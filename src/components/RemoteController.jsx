import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Sliders, BellRing, Monitor, Radio } from 'lucide-react';

export const RemoteController = () => {
  const { sendRemoteCommand, alarms, triggerAlarmTest, settings, updateSettings } = useDashboard();

  const handleSwitchMode = (mode) => {
    sendRemoteCommand('CHANGE_MODE', { mode });
    updateSettings({ activeDashboardMode: mode });
  };

  return (
    <div className="panel-card active-ember" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            REMOTE CONTROLLER
          </h2>
        </div>
        <span className="badge badge-red font-mono">
          <Radio size={10} />
          REMOTE
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {/* Desk Display Screen Mode Controller */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: '8px' }}>
            DESK DISPLAY VIEW MODE
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'clock', label: 'CLOCK & HUD' },
              { id: 'alarms', label: 'ALARMS' },
              { id: 'media', label: 'MEDIA VAULT' },
              { id: 'storage', label: 'STORAGE & NET' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleSwitchMode(mode.id)}
                className={settings?.activeDashboardMode === mode.id ? 'btn-primary' : ''}
                style={{ flex: 1, minWidth: '100px', justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
              >
                <Monitor size={12} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Remote Alarm Test Ringing Trigger */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: '8px' }}>
            TRIGGER DESK ALARM TONE TEST
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {alarms.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>No alarms created to test.</span>
            ) : (
              alarms.map(alarm => (
                <button
                  key={alarm.id}
                  onClick={() => triggerAlarmTest(alarm.id)}
                  className="btn-amber"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                >
                  <BellRing size={12} />
                  TEST ({alarm.time} - {alarm.label})
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
