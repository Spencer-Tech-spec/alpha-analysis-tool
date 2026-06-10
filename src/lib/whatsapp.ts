import axios from 'axios';
import type { AlphaCredentials } from './accountService';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, APP_URL } = process.env;

/**
 * Sends AlphaDollars login credentials to a customer via WhatsApp using Twilio.
 */
export async function sendWhatsAppCredentials(
  phone: string,
  credentials: AlphaCredentials
): Promise<void> {
  const formattedPhone = formatPhone(phone);
  const toNumber = `whatsapp:${formattedPhone}`;
  const fromNumber = TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  const appUrl = APP_URL || 'https://alphadollars.app';

  const message = `✅ *AlphaDollars Premium Access Activated!*

🎉 Your payment was received. Here are your login credentials:

👤 *Username:* ${credentials.username}
🔑 *Password:* ${credentials.password}

🔗 *Login here:* ${appUrl}

⚠️ _Please change your password after your first login._

Thank you for joining AlphaDollars! 🚀`;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams();
  params.append('From', fromNumber);
  params.append('To', toNumber);
  params.append('Body', message);

  await axios.post(twilioUrl, params, {
    auth: {
      username: TWILIO_ACCOUNT_SID!,
      password: TWILIO_AUTH_TOKEN!,
    },
  });

  console.log(`[WhatsApp] Credentials sent to ${formattedPhone}`);
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `+254${cleaned.slice(1)}`;
  if (!cleaned.startsWith('+')) return `+${cleaned}`;
  return phone;
}
