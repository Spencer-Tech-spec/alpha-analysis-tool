import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/paymentStore';

/**
 * GET /api/mpesa/status?checkoutRequestId=XXX
 * Frontend polls this every few seconds after the STK push to know if payment succeeded.
 */
export async function GET(req: NextRequest) {
  const checkoutRequestId = req.nextUrl.searchParams.get('checkoutRequestId');

  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'checkoutRequestId is required' }, { status: 400 });
  }

  const session = getSession(checkoutRequestId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    errorMessage: session.errorMessage,
    // Don't expose credentials here — they were sent via WhatsApp
  });
}
