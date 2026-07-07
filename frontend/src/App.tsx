import { useState } from 'react';
import { StellarProvider } from './context/StellarContext';
import WalletConnect from './components/WalletConnect';
import EventExplorer from './components/EventExplorer';
import CreatorDashboard from './components/CreatorDashboard';
import SecondaryMarket from './components/SecondaryMarket';
import MyTickets from './components/MyTickets';
import LiveFeed from './components/LiveFeed';
import './App.css';

type Tab = 'explore' | 'create' | 'market' | 'tickets';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('explore');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'explore', label: 'Explore', icon: '⬡' },
    { id: 'create', label: 'Create', icon: '◈' },
    { id: 'market', label: 'Market', icon: '◎' },
    { id: 'tickets', label: 'My Tickets', icon: '◆' },
  ];

  return (
    <StellarProvider>
      <div className="app-shell">
        {/* Ambient background */}
        <div className="ambient-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-overlay" />
        </div>

        {/* Header */}
        <header className="app-header">
          <div className="header-inner">
            <div className="brand">
              <div className="brand-mark">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="none" stroke="url(#hex-grad)" strokeWidth="1.5"/>
                  <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="url(#hex-fill)" opacity="0.4"/>
                  <circle cx="14" cy="14" r="3" fill="url(#hex-grad)"/>
                  <defs>
                    <linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa"/>
                      <stop offset="100%" stopColor="#38bdf8"/>
                    </linearGradient>
                    <linearGradient id="hex-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa"/>
                      <stop offset="100%" stopColor="#38bdf8"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="brand-name">NEXORA</span>
              <span className="brand-tag">on Stellar</span>
            </div>

            <nav className="main-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <WalletConnect />
          </div>
        </header>

        {/* Main content */}
        <main className="app-main">
          <div className="content-grid">
            <div className="primary-content">
              {activeTab === 'explore' && <EventExplorer />}
              {activeTab === 'create' && <CreatorDashboard />}
              {activeTab === 'market' && <SecondaryMarket />}
              {activeTab === 'tickets' && <MyTickets />}
            </div>
            <aside className="sidebar">
              <LiveFeed />
            </aside>
          </div>
        </main>

        {/* Mobile nav */}
        <nav className="mobile-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </StellarProvider>
  );
}
