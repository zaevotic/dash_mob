import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Clock, Bell, Radio, Maximize2, Minimize2 } from 'lucide-react';

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

  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = time.toLocaleDateString('en-US', options);

  const enabledAlarms = alarms.filter(a => a.enabled);
  const nextAlarm = enabledAlarms.length > 0 ? enabledAlarms[0] : null;

  return (
    <div className="panel-card active-ember" style={{ textAlign: 'center', padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Top HUD Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          title="Toggle High-Tech Desk Kiosk Mode"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          {isFullscreen ? 'EXIT DOCK' : 'DESK DOCK'}
        </button>
      </div>

      {/* Main Clock Display */}
      <div style={{ margin: '12px 0' }}>
        <div 
          className="clock-display" 
          style={{ 
            fontSize: 'clamp(2.8rem, 8vh, 5.5rem)', 
            fontWeight: '700',
            lineHeight: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '6px'
          }}
        >
          <span>{hours}:{minutes}</span>
          <span className="clock-seconds" style={{ fontSize: '0.45em' }}>:{seconds}</span>
        </div>

        <div style={{ 
          color: 'var(--text2)', 
          fontFamily: 'var(--mono)', 
          fontSize: '0.95rem',
          marginTop: '6px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {dateStr}
        </div>
      </div>

      {/* Next Alarm Card */}
      <div style={{ 
        background: 'var(--bg2)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '10px 14px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} style={{ color: 'var(--red-ember)' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>NEXT SCHEDULED ALARM</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: '600' }}>{nextAlarm ? nextAlarm.label : 'None Configured'}</div>
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--mono)', color: nextAlarm ? 'var(--red-ember)' : 'var(--text3)' }}>
          {nextAlarm ? nextAlarm.time : '--:--'}
        </div>
      </div>
    </div>
  );
};
