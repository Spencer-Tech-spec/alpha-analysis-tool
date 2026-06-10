import axios from 'axios';

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
  MPESA_AMOUNT,
} = process.env;

const MPESA_BASE = 'https://sandbox.safaricom.co.ke'; // Switch to https://api.safaricom.co.ke for production

/** Generates a base64 OAuth token from Safaricom Daraja */
export async function getMpesaToken(): Promise<string> {
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  return data.access_token as string;
}

/** Creates the Lipa Na M-Pesa Online timestamp (YYYYMMDDHHmmss) */
export function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
}

/** Generates the base64 password = Base64(Shortcode+Passkey+Timestamp) */
export function getLipaNaMpesaPassword(timestamp: string): string {
  return Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
}

/** Formats the phone number to 2547XXXXXXXX format */
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('+')) return cleaned.slice(1);
  return cleaned;
}

export interface StkPushResult {
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
  MerchantRequestID: string;
}

/** Initiates an M-Pesa STK Push (Lipa Na M-Pesa Online) */
export async function initiateStkPush(phone: string): Promise<StkPushResult> {
  const token = await getMpesaToken();
  const timestamp = getTimestamp();
  const password = getLipaNaMpesaPassword(timestamp);
  const formattedPhone = formatPhone(phone);
  const amount = MPESA_AMOUNT || '500';

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: 'AlphaDollars',
    TransactionDesc: 'AlphaDollars Premium Access',
  };

  const { data } = await axios.post(
    `${MPESA_BASE}/mpesa/stkpush/v1/processrequest`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data as StkPushResult;
}
