"use client";

import React from 'react';
import { Layers, Box, Settings, Sliders, ChevronRight, Zap, ShieldCheck } from 'lucide-react';

const BotBuilder = () => {
  const categories = [
    { name: 'Analysis Logics', icon: '🔥', color: '#ffedd5' },
    { name: 'Market Structure', icon: '🏗️', color: '#dcfce7' },
    { name: 'Trade Parameters', icon: '⚙️', color: '#fef9c3' },
  ];

  return (
    <div className="builder-container">
      <aside className="blocks-menu">
        <div className="menu-header">
          <Layers size={18} />
          <span>Blocks menu</span>
        </div>
        <div className="category-list">
          {categories.map((cat, i) => (
            <div key={i} className="category-item">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
              <ChevronRight size={14} className="cat-arrow" />
            </div>
          ))}
        </div>
      </aside>

      <main className="canvas-area">
        <div className="canvas-grid">
          {/* Main Strategy Block */}
          <div className="logic-block strategy-block">
            <div className="block-head">
              <Box size={14} />
              <span>1. Trade Parameters</span>
            </div>
            <div className="block-content">
              <div className="param-row">
                <span>Market:</span>
                <span className="param-value">Volatility 100</span>
              </div>
              <div className="param-row">
                <span>Trade Type:</span>
                <span className="param-value">Digits Over/Under</span>
              </div>
              <div className="param-row">
                <span>Stake:</span>
                <span className="param-value">$10.00</span>
              </div>
            </div>
          </div>

          {/* Analysis Block */}
          <div className="logic-block analysis-block">
            <div className="block-head">
              <Zap size={14} />
              <span>2. Analysis & Purchase</span>
            </div>
            <div className="block-content">
              <div className="logic-rule">
                IF <span className="logic-keyword">Last Digit</span> IS <span className="logic-keyword">Under 5</span>
              </div>
              <div className="logic-action">
                PURCHASE <span className="logic-keyword">Over 2</span>
              </div>
            </div>
          </div>

          {/* Risk Block */}
          <div className="logic-block risk-block">
            <div className="block-head">
              <ShieldCheck size={14} />
              <span>3. Risk Management</span>
            </div>
            <div className="block-content">
              <div className="param-row">
                <span>Martingale:</span>
                <span className="param-value">2.1x</span>
              </div>
              <div className="param-row">
                <span>Take Profit:</span>
                <span className="param-value">$50.00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="canvas-hint">
          <p>Drag and drop blocks from the menu to build your trading logic</p>
        </div>
      </main>

      <style jsx>{`
        .builder-container {
          flex: 1;
          display: flex;
          height: 100%;
          background: #f8fafc;
        }

        .blocks-menu {
          width: 260px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .menu-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .category-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .category-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-item:hover {
          background: #f1f5f9;
        }

        .cat-icon {
          font-size: 1.25rem;
          margin-right: 12px;
        }

        .cat-name {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
        }

        .cat-arrow {
          color: #94a3b8;
        }

        .canvas-area {
          flex: 1;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
          position: relative;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .canvas-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          justify-content: center;
          padding: 20px;
        }

        .logic-block {
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s;
        }

        .logic-block:hover {
          transform: translateY(-4px);
        }

        .block-head {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .strategy-block .block-head { background: #eff6ff; color: #2563eb; }
        .analysis-block .block-head { background: #fef2f2; color: #ef4444; }
        .risk-block .block-head { background: #f0fdf4; color: #10b981; }

        .block-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .param-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #64748b;
        }

        .param-value {
          font-weight: 700;
          color: #1e293b;
        }

        .logic-rule, .logic-action {
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .logic-keyword {
          color: var(--accent-blue);
          font-weight: 800;
        }

        .logic-action {
          border-left: 4px solid var(--accent-red);
          margin-top: 4px;
        }

        .canvas-hint {
          position: absolute;
          bottom: 40px;
          background: rgba(255, 255, 255, 0.8);
          padding: 12px 24px;
          border-radius: 9999px;
          backdrop-filter: blur(4px);
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.875rem;
          box-shadow: var(--card-shadow);
        }
      `}</style>
    </div>
  );
};

export default BotBuilder;
