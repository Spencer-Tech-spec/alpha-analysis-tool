/**
 * In-memory store for M-Pesa payment sessions.
 * Maps CheckoutRequestID → session data.
 * In production, replace with Redis or a database.
 */

export interface PaymentSession {
  checkoutRequestId: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'failed';
  credentials?: { username: string; password: string };
  errorMessage?: string;
  createdAt: number;
}

// Global singleton (persists across Next.js API route invocations in the same process)
const globalStore = global as typeof global & { paymentSessions?: Map<string, PaymentSession> };
if (!globalStore.paymentSessions) {
  globalStore.paymentSessions = new Map<string, PaymentSession>();
}

export const paymentSessions: Map<string, PaymentSession> = globalStore.paymentSessions;

export function createSession(checkoutRequestId: string, phone: string): PaymentSession {
  const session: PaymentSession = {
    checkoutRequestId,
    phone,
    status: 'pending',
    createdAt: Date.now(),
  };
  paymentSessions.set(checkoutRequestId, session);
  return session;
}

export function getSession(checkoutRequestId: string): PaymentSession | undefined {
  return paymentSessions.get(checkoutRequestId);
}

export function updateSession(checkoutRequestId: string, update: Partial<PaymentSession>): void {
  const existing = paymentSessions.get(checkoutRequestId);
  if (existing) {
    paymentSessions.set(checkoutRequestId, { ...existing, ...update });
  }
}
