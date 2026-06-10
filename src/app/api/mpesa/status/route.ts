import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/mpesa/status?checkoutRequestId=XXX
 * Frontend polls this every few seconds after the STK push to know if payment succeeded.
 */
export async function GET(req: NextRequest) {
  const checkoutRequestId = req.nextUrl.searchParams.get('checkoutRequestId');

  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'checkoutRequestId is required' }, { status: 400 });
  }

  // Fetch the payment status from Supabase
  const { data: session, error } = await supabase
    .from('payments')
    .select('status, error_message')
    .eq('checkout_request_id', checkoutRequestId)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    errorMessage: session.error_message,
    // Don't expose credentials here — they were sent via WhatsApp
  });
}
