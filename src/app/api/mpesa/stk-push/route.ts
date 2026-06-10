import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { createSession } from '@/lib/paymentStore';

/**
 * POST /api/mpesa/stk-push
 * Body: { phone: "0712345678" }
 * Initiates an M-Pesa STK push and stores a pending session.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const result = await initiateStkPush(phone);

    if (result.ResponseCode !== '0') {
      return NextResponse.json(
        { error: result.ResponseDescription || 'STK push failed.' },
        { status: 502 }
      );
    }

    // Store a pending session keyed by CheckoutRequestID
    createSession(result.CheckoutRequestID, phone);

    return NextResponse.json({
      checkoutRequestId: result.CheckoutRequestID,
      message: result.CustomerMessage,
    });
  } catch (error: unknown) {
    console.error('[STK Push Error]', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
