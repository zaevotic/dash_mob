import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Sliders, BellRing, Monitor, Radio, Volume2, ShieldCheck } from 'lucide-react';

export const RemoteController = () => {
  const { sendRemoteCommand, alarms, triggerAlarmTest, settings, updateSettings, isConnected } = useDashboard();

  const handleSwitchMode = (mode) => {
    sendRemoteCommand('CHANGE_MODE', { mode });
    updateSettings({ activeDashboardMode: mode });
  };

  return (
    <div className="panel-card active-ember">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={20} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            REMOTE DESK CONTROLLER
          </h2>
        </div>
        <span className="badge badge-red font-mono">
          <Radio size={12} />
          REMOTE CONNECTED
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '20px' }}>
        You are managing the Desk HUD server remotely from your browser. Changes here trigger instant real-time WebSocket updates on your old Android phone.
      </p>

      {/* Desk Display Screen Mode Controller */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: '10px' }}>
          DESK PHONE DISPLAY MODE
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 'clock', label: 'CLOCK & HUD' },
            { id: 'habits', label: 'HABIT MATRIX' },
            { id: 'media', label: 'MEDIA PLAYER' },
            { id: 'storage', label: 'STORAGE & NET' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSwitchMode(mode.id)}
              className={settings?.activeDashboardMode === mode.id ? 'btn-primary' : ''}
              style={{ flex: 1, minWidth: '120px', justifyContent: 'center' }}
            >
              <Monitor size={14} />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remote Alarm Test Ringing Trigger */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: '10px' }}>
          TRIGGER DESK ALARM TONE TEST
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {alarms.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>No alarms created to test.</span>
          ) : (
            alarms.map(alarm => (
              <button
                key={alarm.id}
                onClick={() => triggerAlarmTest(alarm.id)}
                className="btn-amber"
                style={{ fontSize: '0.8rem' }}
              >
                <BellRing size={14} />
                TEST RING ({alarm.time} - {alarm.label})
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
