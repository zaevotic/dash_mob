import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Bell, Radio, Maximize2, Minimize2, Edit3 } from 'lucide-react';

export const ClockHUD = ({ onEditAlarm }) => {
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
    <div className="panel-card active-ember" style={{ textAlign: 'center', padding: 'clamp(14px, 2vh, 24px)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      {/* Top HUD Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${isConnected ? 'badge-green' : 'badge-red'}`}>
            <Radio size={11} className={isConnected ? 'animate-pulse' : ''} />
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
          {system?.network?.primaryIp && (
            <span className="badge badge-amber font-mono" style={{ fontSize: '0.7rem' }}>
              http://{system.network.primaryIp}:{system.network.port}
            </span>
          )}
        </div>
        <button 
          onClick={toggleFullscreen}
          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
          title="Toggle High-Tech Desk Kiosk Mode"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          {isFullscreen ? 'EXIT DOCK' : 'DESK DOCK'}
        </button>
      </div>

      {/* Main Expanded Clock Display */}
      <div style={{ margin: 'auto 0' }}>
        <div 
          className="clock-display" 
          style={{ 
            fontSize: 'clamp(3.2rem, 11vh, 6.8rem)', 
            fontWeight: '700',
            lineHeight: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '6px'
          }}
        >
          <span>{hours}:{minutes}</span>
          <span className="clock-seconds" style={{ fontSize: '0.42em' }}>:{seconds}</span>
        </div>

        <div style={{ 
          color: 'var(--text2)', 
          fontFamily: 'var(--mono)', 
          fontSize: 'clamp(0.85rem, 2vh, 1.15rem)',
          marginTop: '8px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {dateStr}
        </div>
      </div>

      {/* Next Alarm Summary Card */}
      <div 
        onClick={() => onEditAlarm && onEditAlarm(nextAlarm)}
        style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '10px 14px',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <Bell size={18} style={{ color: 'var(--red-ember)', flexShrink: 0 }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              NEXT SCHEDULED ALARM <Edit3 size={10} style={{ color: 'var(--amber)' }} />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextAlarm ? nextAlarm.label : 'None Configured'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--mono)', color: nextAlarm ? 'var(--red-ember)' : 'var(--text3)', flexShrink: 0 }}>
          {nextAlarm ? nextAlarm.time : '--:--'}
        </div>
      </div>
    </div>
  );
};
