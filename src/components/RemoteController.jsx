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
    <div className="panel-card active-ember" style={{ height: '100%', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={16} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '0.9rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            REMOTE CONTROLLER
          </h2>
        </div>
        <span className="badge badge-red font-mono">
          <Radio size={9} />
          REMOTE
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {/* Desk Display Screen Mode Controller */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: '6px' }}>
            DESK DISPLAY VIEW MODE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '4px' }}>
            {[
              { id: 'clock', label: 'CLOCK' },
              { id: 'alarms', label: 'ALARMS' },
              { id: 'media', label: 'MEDIA' },
              { id: 'storage', label: 'STORAGE' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleSwitchMode(mode.id)}
                className={settings?.activeDashboardMode === mode.id ? 'btn-primary' : ''}
                style={{ justifyContent: 'center', fontSize: '0.65rem', padding: '4px' }}
              >
                <Monitor size={10} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Remote Alarm Test Ringing Trigger */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '8px', borderRadius: 'var(--radius-sm)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: '6px', flexShrink: 0 }}>
            TRIGGER DESK ALARM TONE TEST
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {alarms.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>No alarms created.</span>
            ) : (
              alarms.map(alarm => (
                <button
                  key={alarm.id}
                  onClick={() => triggerAlarmTest(alarm.id)}
                  className="btn-amber"
                  style={{ fontSize: '0.65rem', padding: '4px 6px' }}
                >
                  <BellRing size={10} />
                  TEST ({alarm.time})
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
