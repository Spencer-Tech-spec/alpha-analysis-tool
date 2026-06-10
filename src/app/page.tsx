"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SidebarMenu from '@/components/SidebarMenu';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import LandingDashboard from '@/components/LandingDashboard';
import LoginScreen from '@/components/LoginScreen';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNavigate={setCurrentView}
        activeView={currentView}
      />

      <main className="main-content">
        {currentView === 'dashboard' && (
          <LandingDashboard onNavigate={setCurrentView} />
        )}
        {(currentView === 'analysis-tool' || 
          currentView === 'rise-fall' ||
          currentView === 'even-odd' || 
          currentView === 'matches-differs' || 
          currentView === 'over-under') && (
          <AnalysisDashboard activeView={currentView} onNavigate={setCurrentView} />
        )}
        
        {/* Placeholders for other views */}
        {(currentView === 'trading-bots' || 
          currentView === 'trade-signals' || 
          currentView === 'copy-trading') && (
          <div className="placeholder-view animate-fade">
            <h2>{currentView.replace('-', ' ').toUpperCase()}</h2>
            <p>This feature is coming soon to AlphaDollars Premium.</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          background: var(--bg-primary);
        }

        .placeholder-view {
          padding: 40px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .placeholder-view h2 {
          color: var(--accent-orange);
          font-size: 1.25rem;
        }

        .placeholder-view p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
