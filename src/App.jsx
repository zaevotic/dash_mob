import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { ClockHUD } from './components/ClockHUD';
import { AlarmCenter } from './components/AlarmCenter';
import { MediaOffloader } from './components/MediaOffloader';
import { StorageMonitor } from './components/StorageMonitor';
import { RemoteController } from './components/RemoteController';
import { Clock, Bell, Film, Laptop, Smartphone } from 'lucide-react';

const MainLayout = () => {
  const { system } = useDashboard();
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div style={{ 
      width: '100vw', 
      height: '100dvh', 
      maxHeight: '100dvh',
      display: 'flex', 
      flexDirection: 'column', 
      padding: '10px 14px', 
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Compact Navbar Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '8px',
        marginBottom: '8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        height: '42px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            background: 'var(--red)', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 'var(--shadow-ember)'
          }}>
            <Smartphone size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.4rem', letterSpacing: '1px', color: 'var(--text)', lineHeight: '1' }}>
              DASH<span style={{ color: 'var(--red-ember)' }}>MOB</span>
            </h1>
          </div>
        </div>

        {/* Navigation Viewport Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className={activeTab === 'all' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('all')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Clock size={13} /> FULL HUD
          </button>
          <button 
            className={activeTab === 'clock' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('clock')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Clock size={13} /> CLOCK
          </button>
          <button 
            className={activeTab === 'alarms' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('alarms')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Bell size={13} /> ALARMS
          </button>
          <button 
            className={activeTab === 'media' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('media')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Film size={13} /> MEDIA
          </button>
          <button 
            className={activeTab === 'remote' ? 'btn-amber' : ''} 
            onClick={() => setActiveTab('remote')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Laptop size={13} /> REMOTE
          </button>
        </div>
      </header>

      {/* Main Viewport Container - Zero Page Overflow */}
      <main style={{ flex: 1, height: 'calc(100dvh - 64px)', minHeight: 0, overflow: 'hidden', width: '100%' }}>
        {activeTab === 'all' && (
          <div className="viewport-grid">
            <div className="grid-col-clock">
              <ClockHUD />
            </div>
            <div style={{ minHeight: 0, height: '100%' }}>
              <AlarmCenter />
            </div>
            <div style={{ minHeight: 0, height: '100%' }}>
              <MediaOffloader />
            </div>
            <div style={{ minHeight: 0, height: '100%' }}>
              <StorageMonitor />
            </div>
            <div style={{ minHeight: 0, height: '100%' }}>
              <RemoteController />
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', height: '100%', minHeight: 0 }}>
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
