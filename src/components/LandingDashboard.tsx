"use client";

import React from 'react';
import { BarChart3, Bot, Zap, ArrowRight } from 'lucide-react';

interface LandingDashboardProps {
  onNavigate: (view: string) => void;
}

const LandingDashboard: React.FC<LandingDashboardProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      desc: 'Comprehensive tools to analyze market trends and make informed trading decisions.',
      icon: BarChart3,
      color: '#f97316' // Orange
    },
    {
      id: 'automated-bots',
      title: 'Automated Bots',
      desc: 'Deploy automated trading strategies that work 24/7 to capitalize on opportunities.',
      icon: Bot,
      color: '#f97316'
    },
    {
      id: 'real-time-signals',
      title: 'Real-time Signals',
      desc: 'Get instant trading signals based on technical indicators and market conditions.',
      icon: Zap,
      color: '#f97316'
    }
  ];

  return (
    <div className="landing-container animate-fade">
      <div className="hero-section">
        <h1>Professional Trading Platform</h1>
        <p>Advanced tools for serious traders. Analyze markets, execute strategies, and maximize your profits.</p>
      </div>

      <div className="cards-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id} 
              className="dashboard-card"
              onClick={() => onNavigate('analysis-tool')}
            >
              <div className="card-icon">
                <Icon size={24} color={card.color} />
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
              <div className="card-footer">
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .landing-container {
          padding: 24px 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .hero-section h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--accent-green);
          margin-bottom: 12px;
        }

        .hero-section p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .dashboard-card:hover {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
          border-color: var(--accent-orange);
        }

        .dashboard-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--accent-orange);
          opacity: 0.5;
        }

        .card-icon {
          background: rgba(249, 115, 22, 0.1);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-content h3 {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .card-content p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .card-footer {
          margin-left: auto;
          color: var(--text-secondary);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default LandingDashboard;
