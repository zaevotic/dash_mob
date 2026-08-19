import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Bell, Radio, Maximize2, Minimize2 } from 'lucide-react';

export const ClockHUD = () => {
  const { alarms, isConnected, system } = useDashboard();
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

  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = time.toLocaleDateString('en-US', options);

  const enabledAlarms = alarms.filter(a => a.enabled);
  const nextAlarm = enabledAlarms.length > 0 ? enabledAlarms[0] : null;

  return (
    <div className="panel-card active-ember" style={{ textAlign: 'center', padding: 'clamp(10px, 1.5vh, 16px)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      {/* Top HUD Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`badge ${isConnected ? 'badge-green' : 'badge-red'}`}>
            <Radio size={10} className={isConnected ? 'animate-pulse' : ''} />
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
          {system?.network?.primaryIp && (
            <span className="badge badge-amber font-mono" style={{ fontSize: '0.65rem' }}>
              {system.network.primaryIp}:{system.network.port}
            </span>
          )}
        </div>
        <button 
          onClick={toggleFullscreen}
          style={{ padding: '3px 6px', fontSize: '0.65rem' }}
          title="Toggle High-Tech Desk Kiosk Mode"
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          {isFullscreen ? 'EXIT' : 'DOCK'}
        </button>
      </div>

      {/* Main Clock Display */}
      <div style={{ margin: 'auto 0' }}>
        <div 
          className="clock-display" 
          style={{ 
            fontSize: 'clamp(2.2rem, 7vh, 4.8rem)', 
            fontWeight: '700',
            lineHeight: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '4px'
          }}
        >
          <span>{hours}:{minutes}</span>
          <span className="clock-seconds" style={{ fontSize: '0.45em' }}>:{seconds}</span>
        </div>

        <div style={{ 
          color: 'var(--text2)', 
          fontFamily: 'var(--mono)', 
          fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)',
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {dateStr}
        </div>
      </div>

      {/* Next Alarm Card */}
      <div style={{ 
        background: 'var(--bg2)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '6px 10px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <Bell size={14} style={{ color: 'var(--red-ember)', flexShrink: 0 }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>NEXT ALARM</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextAlarm ? nextAlarm.label : 'None'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--mono)', color: nextAlarm ? 'var(--red-ember)' : 'var(--text3)', flexShrink: 0 }}>
          {nextAlarm ? nextAlarm.time : '--:--'}
        </div>
      </div>
    </div>
  );
};
