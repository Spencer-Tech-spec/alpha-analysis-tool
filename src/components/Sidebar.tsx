"use client";

import React from 'react';
import { PieChart, List, FileText } from 'lucide-react';

interface SidebarProps {
  stats: {
    stake: number;
    payout: number;
    runs: number;
    profit: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ stats }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button className="sidebar-tab active">
          <PieChart size={16} />
          <span>Summary</span>
        </button>
        <button className="sidebar-tab">
          <List size={16} />
          <span>Transactions</span>
        </button>
        <button className="sidebar-tab">
          <FileText size={16} />
          <span>Journal</span>
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Stake</span>
          <span className="metric-value">{stats.stake.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Payout</span>
          <span className="metric-value">{stats.payout.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Runs</span>
          <span className="metric-value">{stats.runs}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Profit/Loss</span>
          <span className={`metric-value ${stats.profit >= 0 ? 'positive' : 'negative'}`}>
            {stats.profit.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="empty-state">
        <p>No data available yet</p>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          background: white;
          border-left: 1px solid #e2e8f0;
          height: calc(100vh - 184px);
          display: flex;
          flex-direction: column;
        }

        .sidebar-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidebar-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-tab.active {
          color: var(--accent-blue);
          border-bottom: 2px solid var(--accent-blue);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        .metric-card {
          background: white;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .metric-value.positive {
          color: var(--accent-green);
        }

        .metric-value.negative {
          color: var(--accent-red);
        }

        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 0.875rem;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
