import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a random username like "trader_a3f2k"
 */
function generateUsername(): string {
  const suffix = uuidv4().replace(/-/g, '').slice(0, 5);
  return `trader_${suffix}`;
}

/**
 * Generates a random strong password like "Alp@7xK2"
 */
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '@#$!';
  let pw = '';
  for (let i = 0; i < 6; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  pw += specials.charAt(Math.floor(Math.random() * specials.length));
  pw += Math.floor(Math.random() * 9 + 1).toString();
  // Shuffle
  return pw.split('').sort(() => 0.5 - Math.random()).join('');
}

export interface AlphaCredentials {
  username: string;
  password: string;
}

/**
 * Creates a new AlphaDollars account and returns credentials.
 * In a real app, persist the user in a database here.
 */
export function createAccount(): AlphaCredentials {
  const username = generateUsername();
  const password = generatePassword();
  // TODO: save { username, hashedPassword, createdAt } to your DB
  console.log(`[AccountService] Created account: ${username}`);
  return { username, password };
}
