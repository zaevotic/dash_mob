import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Bell, Plus, Trash2, Volume2, VolumeX, CheckCircle, AlertTriangle, Moon } from 'lucide-react';

const AVAILABLE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TONES = ['Cyber Pulse', 'Ember Wave', 'Gothic Synth', 'Hyper Alert'];

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
  const [selectedTone, setSelectedTone] = useState('Cyber Pulse');

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
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={20} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            ALARM HUB
          </h2>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          {showAddForm ? 'CANCEL' : 'ADD ALARM'}
        </button>
      </div>

      {/* Add Alarm Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border2)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '4px' }}>TIME (HH:MM)</label>
              <input 
                type="time" 
                value={newTime} 
                onChange={(e) => setNewTime(e.target.value)} 
                style={{ width: '100%', fontSize: '1.2rem' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '4px' }}>LABEL / PURPOSE</label>
              <input 
                type="text" 
                placeholder="e.g. Morning Wakeup, Deep Work" 
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Days Selection */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '6px' }}>REPEAT DAYS</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {AVAILABLE_DAYS.map(day => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="submit" className="btn-primary">SAVE ALARM</button>
          </div>
        </form>
      )}

      {/* Alarms List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alarms.length === 0 ? (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '24px', fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
            No alarms configured. Click "Add Alarm" to create one.
          </div>
        ) : (
          alarms.map(alarm => (
            <div 
              key={alarm.id} 
              style={{
                background: alarm.enabled ? 'var(--bg2)' : 'var(--bg)',
                border: `1px solid ${alarm.enabled ? 'var(--border2)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: alarm.enabled ? 1 : 0.6
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--mono)', color: alarm.enabled ? 'var(--red-ember)' : 'var(--text2)' }}>
                    {alarm.time}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text)' }}>
                    {alarm.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {(alarm.days || []).map(day => (
                    <span key={day} style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--amber)', background: 'var(--amber-warm-dim)', padding: '1px 5px', borderRadius: '3px' }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => triggerAlarmTest(alarm.id)} 
                  title="Test Ring Alarm Remotely/Locally"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                >
                  <Volume2 size={14} style={{ color: 'var(--amber)' }} />
                  TEST
                </button>
                <button 
                  onClick={() => toggleAlarm(alarm.id)}
                  style={{
                    background: alarm.enabled ? 'var(--red)' : 'var(--bg3)',
                    borderColor: alarm.enabled ? 'var(--red-ember)' : 'var(--border)',
                    color: alarm.enabled ? '#fff' : 'var(--text3)',
                    padding: '6px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  {alarm.enabled ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={() => deleteAlarm(alarm.id)}
                  style={{ padding: '6px', color: 'var(--text3)' }}
                >
                  <Trash2 size={15} />
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
          backgroundColor: 'rgba(10, 9, 8, 0.92)',
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
              maxWidth: '480px',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--red-ember)',
              padding: '40px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-ember)'
            }}
          >
            <AlertTriangle size={64} style={{ color: '#fff', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--mono)', fontWeight: '900', color: '#fff', margin: '10px 0' }}>
              {activeAlarm.time}
            </h1>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: '32px' }}>
              {activeAlarm.label}
            </h2>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={snoozeAlarm} 
                className="btn-amber"
                style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: '700' }}
              >
                SNOOZE (5M)
              </button>
              <button 
                onClick={dismissAlarm} 
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: '700' }}
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
