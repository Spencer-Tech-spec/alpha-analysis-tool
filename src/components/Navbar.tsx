"use client";

import React, { useState } from 'react';
import { Menu, X, ChevronDown, User, TrendingUp } from 'lucide-react';

interface NavbarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="menu-btn">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="brand">
          <TrendingUp className="brand-icon" size={24} />
          <span className="brand-name">AlphaDollars</span>
        </div>
      </div>

      <div className="nav-right">
        <div className="user-badge">
          <span className="user-name">AlphaTrader</span>
          <ChevronDown size={14} />
        </div>
      </div>

      <style jsx>{`
        .navbar {
          height: 60px;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 5001;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-btn {
          color: var(--accent-green);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent-green);
        }

        .brand-name {
          font-weight: 700;
          font-size: 1.125rem;
          letter-spacing: -0.025em;
          color: white;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-orange);
          padding: 6px 12px;
          border-radius: 6px;
          color: var(--bg-primary);
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-name {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
