"use client";

import React from 'react';
import { 
  Layout, 
  TrendingUp,
  Target,
  Hash, 
  Layers, 
  Bot, 
  Bell, 
  Copy, 
  X,
  LogOut
} from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  onLogout: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose, onNavigate, activeView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'rise-fall', label: 'Rise/Fall', icon: TrendingUp },
    { id: 'even-odd', label: 'Even/Odd', icon: Target },
    { id: 'matches-differs', label: 'Matches/Differs', icon: Hash },
    { id: 'over-under', label: 'Over/Under', icon: Layers },
    { id: 'trading-bots', label: 'Trading Bots', icon: Bot },
    { id: 'trade-signals', label: 'Trade Signals', icon: Bell },
    { id: 'copy-trading', label: 'Copy Trading', icon: Copy },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      <aside className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">TRADING TOOLS</span>
          <button onClick={onClose} className="close-btn mobile-only">
            <X size={20} />
          </button>
        </div>

        <div className="menu-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`menu-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon size={18} className="item-icon" />
                <span className="item-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button className="menu-item logout-btn" onClick={onLogout}>
            <LogOut size={18} className="item-icon" />
            <span className="item-label">Sign Out</span>
          </button>
        </div>

        <style jsx>{`
          .sidebar-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: var(--sidebar-width);
            height: 100vh;
            background: var(--bg-primary);
            z-index: 5000;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-right: 1px solid var(--border-color);
            padding-top: 20px;
            display: flex;
            flex-direction: column;
          }

          .sidebar-menu.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 4999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          .sidebar-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          .sidebar-header {
            padding: 0 24px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .sidebar-title {
            color: var(--accent-green);
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.1em;
          }

          .menu-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 0 12px;
            flex: 1;
            overflow-y: auto;
          }

          .sidebar-footer {
            padding: 16px 12px;
            border-top: 1px solid var(--border-color);
            margin-top: auto;
          }

          .menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 12px;
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
            text-align: left;
            width: 100%;
          }

          .menu-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
          }

          .logout-btn {
            color: var(--accent-red);
          }

          .logout-btn:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
          }

          .menu-item.active {
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent-green);
          }

          .item-icon {
            flex-shrink: 0;
          }

          .mobile-only {
            display: none;
          }

          @media (max-width: 768px) {
            .mobile-only {
              display: block;
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default SidebarMenu;
