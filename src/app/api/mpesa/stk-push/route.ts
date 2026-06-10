import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { supabase } from '@/lib/supabase';

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

    const amountStr = process.env.MPESA_AMOUNT || '3000';
    const amount = parseFloat(amountStr);

    // Store a pending session in Supabase keyed by CheckoutRequestID
    const { error: dbError } = await supabase.from('payments').insert({
      checkout_request_id: result.CheckoutRequestID,
      phone: phone,
      amount: amount,
      status: 'pending'
    });

    if (dbError) {
      console.error('[Supabase Insert Error]', dbError);
      // We still return success to the user so they can pay, but the callback might fail
      // if it can't find the record. Better practice: abort if DB fails.
      return NextResponse.json({ error: 'Database error storing payment.' }, { status: 500 });
    }

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
