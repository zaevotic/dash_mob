import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Bell, Plus, Trash2, Volume2, AlertTriangle } from 'lucide-react';

const AVAILABLE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AlarmCenter = () => {
  const {
    alarms,
    activeAlarm,
    addAlarm,
    toggleAlarm,
    triggerAlarmTest,
    dismissAlarm,
    snoozeAlarm,
    deleteAlarm
  } = useDashboard();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState('07:30');
  const [newLabel, setNewLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [selectedTone] = useState('Cyber Pulse');

  const audioCtxRef = useRef(null);
  const synthTimerRef = useRef(null);

  // Web Audio Synth alarm tone player
  useEffect(() => {
    if (activeAlarm) {
      startSynthAlarmSound();
    } else {
      stopSynthAlarmSound();
    }
    return () => stopSynthAlarmSound();
  }, [activeAlarm]);

  const startSynthAlarmSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let step = 0;
      synthTimerRef.current = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = step % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(step % 2 === 0 ? 880 : 1320, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        step++;
      }, 500);
    } catch (e) {
      console.error('[WebAudio Error]', e);
    }
  };

  const stopSynthAlarmSound = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTime) return;
    await addAlarm({
      time: newTime,
      label: newLabel || 'Alarm',
      days: selectedDays,
      tone: selectedTone,
      snoozeMinutes: 5
    });
    setNewLabel('');
    setShowAddForm(false);
  };

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            ALARM HUB
          </h2>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
          <Plus size={14} />
          {showAddForm ? 'CANCEL' : 'ADD ALARM'}
        </button>
      </div>

      {/* Add Alarm Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border2)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '12px',
          marginBottom: '12px',
          flexShrink: 0
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '2px' }}>TIME</label>
              <input 
                type="time" 
                value={newTime} 
                onChange={(e) => setNewTime(e.target.value)} 
                style={{ width: '100%', fontSize: '1rem', padding: '6px' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '2px' }}>LABEL</label>
              <input 
                type="text" 
                placeholder="Wakeup, Meeting" 
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
                style={{ width: '100%', padding: '6px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {AVAILABLE_DAYS.map(day => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--mono)',
                      background: active ? 'var(--red-mute)' : 'var(--bg1)',
                      borderColor: active ? 'var(--red-ember)' : 'var(--border)',
                      color: active ? 'var(--red-ember)' : 'var(--text2)'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}>SAVE ALARM</button>
        </form>
      )}

      {/* Scrollable Alarms List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
        {alarms.length === 0 ? (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '16px', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
            No alarms configured.
          </div>
        ) : (
          alarms.map(alarm => (
            <div 
              key={alarm.id} 
              style={{
                background: alarm.enabled ? 'var(--bg2)' : 'var(--bg)',
                border: `1px solid ${alarm.enabled ? 'var(--border2)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: alarm.enabled ? 1 : 0.65
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--mono)', color: alarm.enabled ? 'var(--red-ember)' : 'var(--text2)' }}>
                    {alarm.time}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    {alarm.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                  {(alarm.days || []).map(day => (
                    <span key={day} style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--amber)', background: 'var(--amber-warm-dim)', padding: '1px 4px', borderRadius: '2px' }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  onClick={() => triggerAlarmTest(alarm.id)} 
                  title="Test Ring Alarm Remotely"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  <Volume2 size={12} style={{ color: 'var(--amber)' }} />
                  TEST
                </button>
                <button 
                  onClick={() => toggleAlarm(alarm.id)}
                  style={{
                    background: alarm.enabled ? 'var(--red)' : 'var(--bg3)',
                    borderColor: alarm.enabled ? 'var(--red-ember)' : 'var(--border)',
                    color: alarm.enabled ? '#fff' : 'var(--text3)',
                    padding: '4px 10px',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  {alarm.enabled ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={() => deleteAlarm(alarm.id)}
                  style={{ padding: '4px', color: 'var(--text3)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACTIVE RINGING ALARM MODAL OVERLAY */}
      {activeAlarm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 9, 8, 0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div 
            className="alarm-ringing-overlay"
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--red-ember)',
              padding: '32px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-ember)'
            }}
          >
            <AlertTriangle size={56} style={{ color: '#fff', marginBottom: '12px' }} />
            <h1 style={{ fontSize: '3rem', fontFamily: 'var(--mono)', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
              {activeAlarm.time}
            </h1>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '24px' }}>
              {activeAlarm.label}
            </h2>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={snoozeAlarm} 
                className="btn-amber"
                style={{ padding: '12px 20px', fontSize: '1rem', fontWeight: '700' }}
              >
                SNOOZE (5M)
              </button>
              <button 
                onClick={dismissAlarm} 
                className="btn-primary"
                style={{ padding: '12px 20px', fontSize: '1rem', fontWeight: '700' }}
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
