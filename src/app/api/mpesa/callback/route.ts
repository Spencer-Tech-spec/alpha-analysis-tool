import { NextRequest, NextResponse } from 'next/server';
import { createAccount } from '@/lib/accountService';
import { sendWhatsAppCredentials } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

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

    // Fetch the pending session from Supabase
    const { data: paymentSession, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (fetchError || !paymentSession) {
      console.warn(`[Callback] Unknown CheckoutRequestID or DB error: ${CheckoutRequestID}`);
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    if (ResultCode !== 0) {
      // Payment failed or was cancelled
      await supabase
        .from('payments')
        .update({ status: 'failed', error_message: ResultDesc })
        .eq('id', paymentSession.id);
        
      console.log(`[Callback] Payment failed for ${paymentSession.phone}: ${ResultDesc}`);
      return NextResponse.json({ message: 'Payment failure recorded.' });
    }

    // ✅ Payment confirmed — run automated sales flow
    console.log(`[Callback] Payment confirmed for ${paymentSession.phone}`);

    // Step 1: Create account credentials
    const credentials = createAccount();

    // Step 2: Save the user to Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username: credentials.username,
        password_hash: credentials.password, // IMPORTANT: Should be hashed in a real app!
        phone: paymentSession.phone,
        status: 'active'
      })
      .select()
      .single();

    if (userError || !user) {
        console.error('[Callback] Failed to insert user into DB', userError);
        // Even if user insert fails, payment succeeded. Edge case handling needed.
        return NextResponse.json({ message: 'Failed to create user record.' }, { status: 500 });
    }

    // Step 3: Link payment to user and mark as confirmed
    await supabase
      .from('payments')
      .update({ status: 'confirmed', user_id: user.id })
      .eq('id', paymentSession.id);

    // Step 4: Send credentials via WhatsApp
    await sendWhatsAppCredentials(paymentSession.phone, credentials);

    console.log(`[Callback] Flow complete for ${paymentSession.phone} → ${credentials.username}`);

    return NextResponse.json({ message: 'Account created and credentials sent.' });
  } catch (error: unknown) {
    console.error('[Callback Error]', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
