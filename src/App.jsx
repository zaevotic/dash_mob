import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { ClockHUD } from './components/ClockHUD';
import { AlarmCenter } from './components/AlarmCenter';
import { MediaOffloader } from './components/MediaOffloader';
import { StorageMonitor } from './components/StorageMonitor';
import { RemoteController } from './components/RemoteController';
import { Clock, Bell, Film, Laptop, Smartphone } from 'lucide-react';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div style={{ 
      width: '100vw', 
      height: '100dvh', 
      maxHeight: '100dvh',
      display: 'flex', 
      flexDirection: 'column', 
      padding: '8px 10px', 
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Compact Navbar Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '6px',
        marginBottom: '6px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        height: '36px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '26px', 
            height: '26px', 
            background: 'var(--red)', 
            borderRadius: '5px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 'var(--shadow-ember)',
            flexShrink: 0
          }}>
            <Smartphone size={15} style={{ color: '#fff' }} />
          </div>
          <h1 className="font-display" style={{ fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--text)', lineHeight: '1', whiteSpace: 'nowrap' }}>
            DASH<span style={{ color: 'var(--red-ember)' }}>MOB</span>
          </h1>
        </div>

        {/* Navigation Viewport Tabs */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flexShrink: 0 }}>
          <button 
            className={activeTab === 'all' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('all')}
            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          >
            <Clock size={11} /> HUD
          </button>
          <button 
            className={activeTab === 'clock' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('clock')}
            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          >
            <Clock size={11} /> CLOCK
          </button>
          <button 
            className={activeTab === 'alarms' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('alarms')}
            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          >
            <Bell size={11} /> ALARMS
          </button>
          <button 
            className={activeTab === 'media' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('media')}
            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          >
            <Film size={11} /> MEDIA
          </button>
          <button 
            className={activeTab === 'remote' ? 'btn-amber' : ''} 
            onClick={() => setActiveTab('remote')}
            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          >
            <Laptop size={11} /> REMOTE
          </button>
        </div>
      </header>

      {/* Main Viewport Container - Zero Page Overflow */}
      <main style={{ flex: 1, height: 'calc(100dvh - 50px)', minHeight: 0, width: '100%', overflow: 'hidden' }}>
        {activeTab === 'all' && (
          <div className="viewport-grid">
            <div className="grid-col-clock">
              <ClockHUD />
            </div>

            <div className="landscape-right-panel phone-portrait-cards-container">
              <div style={{ minHeight: 0, height: '100%', minWidth: 0 }}>
                <AlarmCenter />
              </div>
              <div style={{ minHeight: 0, height: '100%', minWidth: 0 }}>
                <MediaOffloader />
              </div>
              <div style={{ minHeight: 0, height: '100%', minWidth: 0 }}>
                <StorageMonitor />
              </div>
              <div style={{ minHeight: 0, height: '100%', minWidth: 0 }}>
                <RemoteController />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clock' && (
          <div style={{ height: '100%', minHeight: 0 }}>
            <ClockHUD />
          </div>
        )}

        {activeTab === 'alarms' && (
          <div style={{ height: '100%', minHeight: 0 }}>
            <AlarmCenter />
          </div>
        )}

        {activeTab === 'media' && (
          <div style={{ height: '100%', minHeight: 0 }}>
            <MediaOffloader />
          </div>
        )}

        {activeTab === 'remote' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', height: '100%', minHeight: 0, overflowY: 'auto' }}>
            <RemoteController />
            <StorageMonitor />
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <MainLayout />
    </DashboardProvider>
  );
}
