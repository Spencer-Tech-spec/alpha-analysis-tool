import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/paymentStore';
import { createAccount } from '@/lib/accountService';
import { sendWhatsAppCredentials } from '@/lib/whatsapp';

/**
 * POST /api/mpesa/callback
 * Safaricom calls this URL after the STK push is completed (success or failure).
 * This is the CORE of the automated sales flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stk = body?.Body?.stkCallback;

    if (!stk) {
      return NextResponse.json({ message: 'Invalid callback body' }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stk;

    const session = getSession(CheckoutRequestID);
    if (!session) {
      console.warn(`[Callback] Unknown CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    if (ResultCode !== 0) {
      // Payment failed or was cancelled
      updateSession(CheckoutRequestID, {
        status: 'failed',
        errorMessage: ResultDesc,
      });
      console.log(`[Callback] Payment failed for ${session.phone}: ${ResultDesc}`);
      return NextResponse.json({ message: 'Payment failure recorded.' });
    }

    // ✅ Payment confirmed — run automated sales flow
    console.log(`[Callback] Payment confirmed for ${session.phone}`);

    // Step 1: Create account
    const credentials = createAccount();

    // Step 2: Send credentials via WhatsApp
    await sendWhatsAppCredentials(session.phone, credentials);

    // Step 3: Mark session as confirmed with credentials stored
    updateSession(CheckoutRequestID, {
      status: 'confirmed',
      credentials,
    });

    console.log(`[Callback] Flow complete for ${session.phone} → ${credentials.username}`);

    return NextResponse.json({ message: 'Account created and credentials sent.' });
  } catch (error: unknown) {
    console.error('[Callback Error]', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
