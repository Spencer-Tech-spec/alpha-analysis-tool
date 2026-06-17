"use client";

import React, { useState } from 'react';
import { TrendingUp, User, Lock, Eye, EyeOff, ShieldCheck, MessageSquare, Zap, Mail, Phone } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoginError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
      } else {
        onLogin(); // Proceed to app
      }
    } catch (e) {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Registration failed');
      } else {
        // Automatically switch to login with the generated username
        setUsername(data.user.username);
        setIsLoginMode(true);
        setLoginError('Account created! Please select a payment option below to get your login credentials via WhatsApp.');
      }
    } catch (e) {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="mode-toggle">
          <button 
            className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
            onClick={() => { setIsLoginMode(true); setLoginError(''); }}
          >
            Sign In
          </button>
          <button 
            className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
            onClick={() => { setIsLoginMode(false); setLoginError(''); }}
          >
            Sign Up
          </button>
        </div>

        {loginError && (
          <div className={`message-banner ${loginError.includes('success') ? 'success' : 'error'}`}>
            {loginError}
          </div>
        )}

        {!isLoginMode && (
          <>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input 
                  type="tel" 
                  placeholder="e.g. 0712345678" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {isLoginMode && (
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="input-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={isLoginMode ? "Enter your password" : "Create a password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (isLoginMode ? handleLogin() : handleRegister())}
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

        <button 
          className="btn-signin" 
          onClick={isLoginMode ? handleLogin : handleRegister} 
          disabled={isLoading}
        >
          {isLoading ? (isLoginMode ? 'Verifying...' : 'Creating Account...') : (isLoginMode ? 'Sign In' : 'Sign Up')}
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
          <div className="payment-methods">
            <button 
              className="pay-btn mpesa" 
              onClick={() => window.open('https://wa.me/254793612801?text=Hello,%20I%20would%20like%20to%20get%20AlphaDollars%20Premium%20using%20M-Pesa.', '_blank')}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" alt="M-Pesa" />
            </button>
            <button 
              className="pay-btn paypal" 
              onClick={() => window.open('https://wa.me/254793612801?text=Hello,%20I%20would%20like%20to%20get%20AlphaDollars%20Premium%20using%20PayPal.', '_blank')}
            >
              <img src="https://cdn.simpleicons.org/paypal/00457C" alt="PayPal" />
            </button>
            <button 
              className="pay-btn binance" 
              onClick={() => window.open('https://wa.me/254793612801?text=Hello,%20I%20would%20like%20to%20get%20AlphaDollars%20Premium%20using%20Binance.', '_blank')}
            >
              <img src="https://cdn.simpleicons.org/binance/F3BA2F" alt="Binance" />
            </button>
          </div>
        </div>

        <div className="premium-access">
          <Zap size={14} fill="currentColor" />
          <span>Premium Access</span>
          <p>Unlock professional trading tools</p>
        </div>
      </div>
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

        .mode-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 16px;
        }

        .toggle-btn {
          flex: 1;
          padding: 8px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .toggle-btn:hover:not(.active) {
          color: #e2e8f0;
        }

        .message-banner {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 16px;
        }

        .message-banner.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .message-banner.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
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

        .payment-methods {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 8px;
        }

        .pay-btn {
          width: 56px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }

        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .pay-btn.mpesa { background: #fff; padding: 4px; }
        .pay-btn.paypal { background: #fff; padding: 8px; }
        .pay-btn.binance { background: #1E2329; padding: 8px; border-color: #F3BA2F; }

        .pay-btn img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
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
