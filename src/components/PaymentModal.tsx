"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Loader2, CheckCircle2, XCircle, MessageSquare, ShieldCheck, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
}

type Step = 'enter_phone' | 'waiting_payment' | 'confirmed' | 'failed';

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>('enter_phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_POLLS = 30; // 30 × 3s = 90 second timeout

  const validatePhone = (p: string) => {
    const cleaned = p.replace(/\D/g, '');
    if (!cleaned) return 'Phone number is required.';
    if (cleaned.startsWith('0') && cleaned.length !== 10) return 'Enter a valid Kenyan number (e.g. 0712345678).';
    if (cleaned.startsWith('254') && cleaned.length !== 12) return 'Enter a valid number starting with 254.';
    return '';
  };

  const handleSubmitPhone = async () => {
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    setPhoneError('');
    setStep('waiting_payment');

    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initiate payment.');
        setStep('failed');
        return;
      }

      setCheckoutRequestId(data.checkoutRequestId);
      startPolling(data.checkoutRequestId);
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStep('failed');
    }
  };

  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          clearInterval(pollRef.current!);
          setErrorMessage('Payment timed out. Please try again.');
          setStep('failed');
        }
        return prev + 1;
      });

      try {
        const res = await fetch(`/api/mpesa/status?checkoutRequestId=${id}`);
        const data = await res.json();

        if (data.status === 'confirmed') {
          clearInterval(pollRef.current!);
          setStep('confirmed');
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current!);
          setErrorMessage(data.errorMessage || 'Payment was cancelled or failed.');
          setStep('failed');
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3000);
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  return (
    <div className="pm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pm-modal animate-fade">
        <button className="pm-close" onClick={onClose}><X size={18} /></button>

        {/* Header */}
        <div className="pm-header">
          <div className="pm-logo-row">
            <Smartphone size={22} color="#10b981" />
            <span className="pm-brand">M-Pesa Payment</span>
          </div>
          <p className="pm-sub">Secure one-time payment for AlphaDollars Premium</p>
        </div>

        {/* --- STEP: Enter Phone --- */}
        {step === 'enter_phone' && (
          <div className="pm-body">
            <div className="pm-price-badge">
              <ShieldCheck size={14} color="#f59e0b" />
              <span>Ksh {process.env.NEXT_PUBLIC_MPESA_AMOUNT || '3000'} &mdash; Lifetime Access</span>
            </div>

            <div className="pm-field">
              <label>Your M-Pesa Phone Number</label>
              <div className="pm-input-wrap">
                <Phone size={16} className="pm-icon" />
                <input
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitPhone()}
                />
              </div>
              {phoneError && <span className="pm-error">{phoneError}</span>}
            </div>

            <ul className="pm-features">
              <li><CheckCircle2 size={13} color="#10b981" /> Full access to AlphaDollars Pro Scanner</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Digit signals &amp; real-time analysis</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Login credentials via WhatsApp instantly</li>
            </ul>

            <button className="pm-btn-pay" onClick={handleSubmitPhone}>
              <Smartphone size={16} />
              Pay with M-Pesa
            </button>
          </div>
        )}

        {/* --- STEP: Waiting for Payment --- */}
        {step === 'waiting_payment' && (
          <div className="pm-body center">
            <div className="pm-spinner-ring">
              <Loader2 size={36} className="spin" color="#10b981" />
            </div>
            <h3 className="pm-status-title">Check Your Phone</h3>
            <p className="pm-status-text">
              An M-Pesa STK push has been sent to <strong>{phone}</strong>.<br />
              Enter your PIN to complete the payment.
            </p>
            <div className="pm-progress-bar">
              <div
                className="pm-progress-fill"
                style={{ width: `${Math.min((pollCount / MAX_POLLS) * 100, 100)}%` }}
              />
            </div>
            <span className="pm-timer-text">Waiting for confirmation…</span>
            <div className="pm-whatsapp-note">
              <MessageSquare size={13} color="#25D366" />
              <span>Credentials will be sent via WhatsApp upon payment</span>
            </div>
          </div>
        )}

        {/* --- STEP: Confirmed --- */}
        {step === 'confirmed' && (
          <div className="pm-body center">
            <div className="pm-success-ring">
              <CheckCircle2 size={48} color="#10b981" />
            </div>
            <h3 className="pm-status-title success">Payment Confirmed! 🎉</h3>
            <p className="pm-status-text">
              Your AlphaDollars Premium account has been created.<br />
              Check your WhatsApp at <strong>{phone}</strong> for your login credentials.
            </p>
            <div className="pm-whatsapp-note success">
              <MessageSquare size={14} color="#25D366" />
              <span>Credentials sent to your WhatsApp</span>
            </div>
            <button className="pm-btn-close" onClick={onClose}>
              Close &amp; Login
            </button>
          </div>
        )}

        {/* --- STEP: Failed --- */}
        {step === 'failed' && (
          <div className="pm-body center">
            <div className="pm-fail-ring">
              <XCircle size={48} color="#ef4444" />
            </div>
            <h3 className="pm-status-title fail">Payment Failed</h3>
            <p className="pm-status-text">{errorMessage}</p>
            <button className="pm-btn-retry" onClick={() => { setStep('enter_phone'); setErrorMessage(''); setPollCount(0); }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px); z-index: 10000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .pm-modal {
          background: linear-gradient(145deg, #0d1b2e, #111827);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 28px; width: 100%; max-width: 380px;
          position: relative; box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        }
        .pm-close {
          position: absolute; top: 16px; right: 16px; color: #64748b;
          background: rgba(255,255,255,0.05); border-radius: 50%; padding: 6px;
          display: flex; transition: all 0.2s;
        }
        .pm-close:hover { background: rgba(255,255,255,0.12); color: white; }

        .pm-header { margin-bottom: 20px; }
        .pm-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .pm-brand { font-size: 1.05rem; font-weight: 800; color: white; }
        .pm-sub { font-size: 0.75rem; color: #64748b; margin-left: 32px; }

        .pm-body { display: flex; flex-direction: column; gap: 16px; }
        .pm-body.center { align-items: center; text-align: center; }

        .pm-price-badge {
          display: flex; align-items: center; gap: 6px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
          padding: 8px 14px; border-radius: 999px; font-size: 0.8rem;
          font-weight: 700; color: #f59e0b; width: fit-content;
        }

        .pm-field { display: flex; flex-direction: column; gap: 6px; }
        .pm-field label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; }
        .pm-input-wrap { position: relative; display: flex; align-items: center; }
        .pm-icon { position: absolute; left: 12px; color: #64748b; }
        .pm-input-wrap input {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          padding: 13px 16px 13px 40px; border-radius: 10px; color: white;
          font-size: 0.9rem; outline: none; transition: border 0.2s;
        }
        .pm-input-wrap input:focus { border-color: #10b981; }
        .pm-error { font-size: 0.7rem; color: #ef4444; }

        .pm-features { list-style: none; display: flex; flex-direction: column; gap: 8px; padding: 0; }
        .pm-features li { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #94a3b8; }

        .pm-btn-pay {
          background: linear-gradient(135deg, #10b981, #059669); color: white;
          padding: 14px; border-radius: 12px; font-weight: 900; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s; box-shadow: 0 4px 20px rgba(16,185,129,0.3);
        }
        .pm-btn-pay:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(16,185,129,0.45); }

        .pm-spinner-ring { margin-bottom: 8px; }
        .spin { animation: spinAnim 1s linear infinite; }
        @keyframes spinAnim { to { transform: rotate(360deg); } }

        .pm-success-ring { margin-bottom: 8px; animation: popIn 0.4s ease; }
        .pm-fail-ring { margin-bottom: 8px; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .pm-status-title { font-size: 1.1rem; font-weight: 800; color: white; }
        .pm-status-title.success { color: #10b981; }
        .pm-status-title.fail { color: #ef4444; }
        .pm-status-text { font-size: 0.82rem; color: #94a3b8; line-height: 1.55; }

        .pm-progress-bar { width: 100%; background: rgba(255,255,255,0.07); border-radius: 999px; height: 4px; overflow: hidden; }
        .pm-progress-fill { height: 100%; background: #10b981; border-radius: 999px; transition: width 0.5s ease; }
        .pm-timer-text { font-size: 0.7rem; color: #64748b; }

        .pm-whatsapp-note {
          display: flex; align-items: center; gap: 6px; font-size: 0.72rem;
          color: #64748b; background: rgba(37,211,102,0.07);
          padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(37,211,102,0.15);
        }
        .pm-whatsapp-note.success { color: #25D366; border-color: rgba(37,211,102,0.4); }

        .pm-btn-close {
          background: #10b981; color: white; padding: 12px 28px; border-radius: 10px;
          font-weight: 800; font-size: 0.85rem; transition: all 0.2s;
        }
        .pm-btn-retry {
          background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3);
          padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 0.85rem;
          transition: all 0.2s;
        }
        .pm-btn-retry:hover { background: rgba(239,68,68,0.25); }
      `}</style>
    </div>
  );
};

export default PaymentModal;
