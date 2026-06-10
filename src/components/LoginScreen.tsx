"use client";

import React, { useState } from 'react';
import { TrendingUp, User, Lock, Eye, EyeOff, ShieldCheck, MessageSquare, Zap } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-container animate-fade">
      <div className="login-header">
        <div className="logo-box">
          <TrendingUp size={32} color="#3b82f6" />
        </div>
        <h1>AlphaDollars</h1>
        <p className="subtitle">Advanced Digit Pro Scanner Platform</p>
        <div className="active-traders">
          <div className="dot"></div>
          <span>100+ Active Traders</span>
        </div>
      </div>

      <div className="login-form">
        <div className="input-group">
          <label>Username</label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input type="text" placeholder="Enter your username" />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <button
              className="toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="agree-row">
          <input type="checkbox" id="agree" />
          <label htmlFor="agree">I agree to Terms & Conditions</label>
        </div>

        <button className="btn-signin" onClick={onLogin}>
          Sign In
        </button>
      </div>

      <div className="login-footer">
        <div className="whatsapp-box">
          <MessageSquare size={16} />
          <span>Instant WhatsApp delivery</span>
        </div>

        <div className="promo-card">
          <div className="promo-header">
            <ShieldCheck size={18} color="#f59e0b" />
            <span>Don't have AlphaDollars logins?</span>
          </div>
          <p>Get full access including login credentials with our Premium Package</p>
          <div className="payment-badge">One-time payment</div>
          <button className="btn-premium" onClick={() => setShowPaymentModal(true)}>
            Get Login Credentials <User size={14} />
          </button>
        </div>

        <div className="premium-access">
          <Zap size={14} fill="currentColor" />
          <span>Premium Access</span>
          <p>Unlock professional trading tools</p>
        </div>
      </div>

      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
    </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow: auto;
          background: transparent;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          background-image: url('/bg-chart.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        /* dark navy overlay for text readability, no solid blue */
        .login-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10,25,47,0.60) 0%,
            rgba(10,25,47,0.45) 50%,
            rgba(10,25,47,0.70) 100%
          );
        }

        .login-container {
          position: relative;
          z-index: 1;
          padding: 40px 24px;
          max-width: 420px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          min-height: 100vh;
          background: transparent;
        }

        .login-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .logo-box {
          background: white;
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .active-traders {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--accent-green);
          font-weight: 600;
          margin-top: 8px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: var(--accent-green);
          border-radius: 50%;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-secondary);
        }

        .input-wrapper input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 14px 16px 14px 44px;
          border-radius: 12px;
          color: white;
          font-size: 0.9375rem;
          outline: none;
        }

        .toggle-pw {
          position: absolute;
          right: 12px;
          color: var(--text-secondary);
        }

        .agree-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .btn-signin {
          background: var(--accent-blue);
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          margin-top: 8px;
        }

        .login-footer {
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        .whatsapp-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .promo-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .promo-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--accent-orange);
        }

        .promo-card p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .payment-badge {
          display: inline-block;
          font-size: 0.6875rem;
          color: var(--accent-green);
          font-weight: 700;
          text-transform: uppercase;
        }

        .btn-premium {
          background: var(--accent-green);
          color: var(--bg-primary);
          padding: 12px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .premium-access {
          text-align: center;
          color: var(--accent-green);
        }

        .premium-access span {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .premium-access p {
          font-size: 0.6875rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
