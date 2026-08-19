import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { ClockHUD } from './components/ClockHUD';
import { AlarmCenter } from './components/AlarmCenter';
import { HabitMatrix } from './components/HabitMatrix';
import { MediaOffloader } from './components/MediaOffloader';
import { StorageMonitor } from './components/StorageMonitor';
import { RemoteController } from './components/RemoteController';
import { Clock, Bell, Zap, Film, HardDrive, Sliders, Smartphone, Laptop } from 'lucide-react';

const MainLayout = () => {
  const { settings, updateSettings, system } = useDashboard();
  const [activeTab, setActiveTab] = useState('all');

  const currentMode = settings?.activeDashboardMode || 'clock';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px', width: '100%' }}>
      {/* Navbar Brand Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            background: 'var(--red)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 'var(--shadow-ember)'
          }}>
            <Smartphone size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.8rem', letterSpacing: '1px', color: 'var(--text)', lineHeight: '1' }}>
              DASH<span style={{ color: 'var(--red-ember)' }}>MOB</span>
            </h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              ANDROID RESURRECTION HUD & SERVER
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={activeTab === 'all' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('all')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Clock size={14} /> FULL HUD
          </button>
          <button 
            className={activeTab === 'clock' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('clock')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Clock size={14} /> CLOCK DOCK
          </button>
          <button 
            className={activeTab === 'alarms' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('alarms')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Bell size={14} /> ALARMS
          </button>
          <button 
            className={activeTab === 'habits' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('habits')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Zap size={14} /> HABITS
          </button>
          <button 
            className={activeTab === 'media' ? 'btn-primary' : ''} 
            onClick={() => setActiveTab('media')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Film size={14} /> MEDIA
          </button>
          <button 
            className={activeTab === 'remote' ? 'btn-amber' : ''} 
            onClick={() => setActiveTab('remote')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Laptop size={14} /> PC REMOTE
          </button>
        </div>
      </header>

      {/* Main Content Layout Views */}
      {activeTab === 'clock' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ClockHUD />
        </div>
      )}

      {activeTab === 'alarms' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AlarmCenter />
        </div>
      )}

      {activeTab === 'habits' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <HabitMatrix />
        </div>
      )}

      {activeTab === 'media' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <MediaOffloader />
        </div>
      )}

      {activeTab === 'remote' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <RemoteController />
          <MediaOffloader />
          <StorageMonitor />
        </div>
      )}

      {activeTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ClockHUD />
          
          <div className="hud-grid">
            <AlarmCenter />
            <StorageMonitor />
          </div>

          <HabitMatrix />
          
          <MediaOffloader />

          <RemoteController />
        </div>
      )}

      {/* Footer */}
      <footer style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'var(--text3)',
        fontFamily: 'var(--mono)'
      }}>
        <div>
          DASHMOB • REPURPOSED SAMSUNG M34 SERVER
        </div>
        <div>
          {system?.network?.primaryIp ? `LOCAL NODE: http://${system.network.primaryIp}:3000` : 'STANDALONE MODE'}
        </div>
      </footer>
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
