import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Clock, Bell, Zap, Maximize2, Minimize2, Radio } from 'lucide-react';

export const ClockHUD = () => {
  const { alarms, habits, isConnected, system } = useDashboard();
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('[Fullscreen Error]', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = time.toLocaleDateString('en-US', options);

  // Find next upcoming enabled alarm
  const enabledAlarms = alarms.filter(a => a.enabled);
  const nextAlarm = enabledAlarms.length > 0 ? enabledAlarms[0] : null;

  // Active habits count today
  const todayStr = time.toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.history && h.history[todayStr]).length;

  return (
    <div className="panel-card active-ember" style={{ textAlign: 'center', padding: '36px 24px' }}>
      {/* Top HUD Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isConnected ? 'badge-green' : 'badge-red'}`}>
            <Radio size={12} className={isConnected ? 'animate-pulse' : ''} />
            {isConnected ? 'NODE ONLINE' : 'OFFLINE'}
          </span>
          {system?.network?.primaryIp && (
            <span className="badge badge-amber font-mono">
              http://{system.network.primaryIp}:{system.network.port}
            </span>
          )}
        </div>
        <button 
          onClick={toggleFullscreen}
          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          title="Toggle High-Tech Desk Kiosk Mode"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? 'EXIT DOCK' : 'DESK DOCK'}
        </button>
      </div>

      {/* Main Clock Display */}
      <div style={{ margin: '20px 0' }}>
        <div 
          className="clock-display" 
          style={{ 
            fontSize: 'clamp(3.8rem, 11vw, 7.5rem)', 
            fontWeight: '700',
            lineHeight: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '8px'
          }}
        >
          <span>{hours}:{minutes}</span>
          <span className="clock-seconds" style={{ fontSize: '0.45em' }}>:{seconds}</span>
        </div>

        <div style={{ 
          color: 'var(--text2)', 
          fontFamily: 'var(--mono)', 
          fontSize: '1.1rem',
          marginTop: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {dateStr}
        </div>
      </div>

      {/* Dashboard Quick Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px', 
        marginTop: '32px' 
      }}>
        {/* Next Alarm Card */}
        <div style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '12px 16px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red-ember)', fontSize: '0.85rem', marginBottom: '4px' }}>
            <Bell size={14} />
            <span style={{ fontFamily: 'var(--mono)' }}>NEXT ALARM</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', fontFamily: 'var(--mono)', color: nextAlarm ? 'var(--text)' : 'var(--text3)' }}>
            {nextAlarm ? nextAlarm.time : 'No Active'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', truncate: true }}>
            {nextAlarm ? nextAlarm.label : 'Set via Desk or Phone'}
          </div>
        </div>

        {/* Habits Progress Card */}
        <div style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '12px 16px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontSize: '0.85rem', marginBottom: '4px' }}>
            <Zap size={14} />
            <span style={{ fontFamily: 'var(--mono)' }}>HABIT MATRIX</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', fontFamily: 'var(--mono)' }}>
            {completedToday} / {habits.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>
            {habits.length > 0 ? `${Math.round((completedToday / habits.length) * 100)}% Done Today` : 'No habits tracked'}
          </div>
        </div>
      </div>
    </div>
  );
};
