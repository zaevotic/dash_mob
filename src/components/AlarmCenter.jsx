import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CustomKeyboard } from './CustomKeyboard';
import { Bell, Plus, Trash2, Volume2, AlertTriangle, X, Music, Edit3, Keyboard } from 'lucide-react';

const AVAILABLE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AlarmCenter = ({ onEditAlarmExternal }) => {
  const {
    alarms,
    activeAlarm,
    availableTones,
    addAlarm,
    updateAlarm,
    toggleAlarm,
    triggerAlarmTest,
    dismissAlarm,
    snoozeAlarm,
    deleteAlarm
  } = useDashboard();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState(null);

  const [newTime, setNewTime] = useState('07:30');
  const [newLabel, setNewLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [selectedToneFile, setSelectedToneFile] = useState('');

  const [showKeyboard, setShowKeyboard] = useState(false);

  const audioCtxRef = useRef(null);
  const synthTimerRef = useRef(null);
  const audioFileRef = useRef(null);

  // Set initial tone when availableTones load
  useEffect(() => {
    if (availableTones.length > 0 && !selectedToneFile) {
      setSelectedToneFile(availableTones[0].filename);
    }
  }, [availableTones]);

  // Handle ring audio playback
  useEffect(() => {
    if (activeAlarm) {
      startAlarmPlayback();
    } else {
      stopAlarmPlayback();
    }
    return () => stopAlarmPlayback();
  }, [activeAlarm]);

  const startAlarmPlayback = () => {
    if (audioFileRef.current) {
      audioFileRef.current.currentTime = 0;
      audioFileRef.current.play().catch(err => {
        console.warn('[Audio Playback Blocked, using synth fallback]', err);
        startSynthAlarmSound();
      });
    } else {
      startSynthAlarmSound();
    }
  };

  const stopAlarmPlayback = () => {
    if (audioFileRef.current) {
      audioFileRef.current.pause();
      audioFileRef.current.currentTime = 0;
    }
    stopSynthAlarmSound();
  };

  const startSynthAlarmSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

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
    } catch (e) {}
  };

  const stopSynthAlarmSound = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  const openNewAlarmModal = () => {
    setEditingAlarmId(null);
    setNewTime('07:30');
    setNewLabel('');
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    if (availableTones.length > 0) setSelectedToneFile(availableTones[0].filename);
    setShowAddModal(true);
  };

  const openEditAlarmModal = (alarm) => {
    setEditingAlarmId(alarm.id);
    setNewTime(alarm.time);
    setNewLabel(alarm.label);
    setSelectedDays(alarm.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const matchedTone = availableTones.find(t => t.name === alarm.tone || t.url === alarm.toneUrl);
    if (matchedTone) setSelectedToneFile(matchedTone.filename);
    setShowAddModal(true);
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newTime) return;

    const matchedToneObj = availableTones.find(t => t.filename === selectedToneFile);
    const toneName = matchedToneObj ? matchedToneObj.name : 'Default Cyber Alarm';
    const toneUrl = matchedToneObj ? matchedToneObj.url : '/uploads/tones/default_cyber_alarm.wav';

    const payload = {
      time: newTime,
      label: newLabel || 'Alarm',
      days: selectedDays,
      tone: toneName,
      toneUrl: toneUrl,
      snoozeMinutes: 5
    };

    if (editingAlarmId) {
      await updateAlarm(editingAlarmId, payload);
    } else {
      await addAlarm(payload);
    }

    setNewLabel('');
    setShowAddModal(false);
  };

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '0.95rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            ALARM HUB
          </h2>
        </div>
        <button className="btn-primary" onClick={openNewAlarmModal} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
          <Plus size={14} />
          ADD ALARM
        </button>
      </div>

      {/* Alarm List Container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
        {alarms.length === 0 ? (
          <div style={{ color: 'var(--text3)', textAlign: 'center', margin: 'auto 0', padding: '16px', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
            No alarms configured.
          </div>
        ) : (
          alarms.map(alarm => (
            <div 
              key={alarm.id} 
              onClick={() => openEditAlarmModal(alarm)}
              style={{
                background: alarm.enabled ? 'var(--bg2)' : 'var(--bg)',
                border: `1px solid ${alarm.enabled ? 'var(--border2)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: alarm.enabled ? 1 : 0.65,
                cursor: 'pointer'
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
                  <Edit3 size={12} style={{ color: 'var(--text3)', marginLeft: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {(alarm.days || []).map(day => (
                      <span key={day} style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--amber)', background: 'var(--amber-warm-dim)', padding: '1px 4px', borderRadius: '2px' }}>
                        {day}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    • {alarm.tone || 'Cyber Alarm'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
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

      {/* FLOATING ADD / EDIT ALARM MODAL OVERLAY */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 9, 8, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--bg1)',
              border: '1px solid var(--red-ember)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--shadow-ember)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1rem', fontFamily: 'var(--mono)', fontWeight: '700', color: 'var(--text)' }}>
                {editingAlarmId ? 'EDIT ALARM SETTINGS' : 'NEW ALARM SCHEDULE'}
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text2)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '4px' }}>TIME</label>
                  <input 
                    type="time" 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    style={{ width: '100%', fontSize: '1.1rem', padding: '6px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '4px' }}>LABEL (TAP FOR KEYBOARD)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Work Focus" 
                      value={newLabel} 
                      readOnly
                      onClick={() => setShowKeyboard(true)}
                      onFocus={(e) => { e.target.blur(); setShowKeyboard(true); }}
                      style={{ width: '100%', padding: '8px 30px 8px 8px', fontSize: '0.85rem', cursor: 'pointer' }}
                    />
                    <Keyboard 
                      size={15} 
                      onClick={() => setShowKeyboard(true)} 
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--red-ember)', cursor: 'pointer' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Tone File Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '4px' }}>
                  ALARM SOUND FILE (`uploads/tones/`)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Music size={16} style={{ color: 'var(--amber)' }} />
                  <select 
                    value={selectedToneFile} 
                    onChange={(e) => setSelectedToneFile(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    {availableTones.length === 0 ? (
                      <option value="default_cyber_alarm.wav">Default Cyber Alarm (.wav)</option>
                    ) : (
                      availableTones.map(tone => (
                        <option key={tone.id} value={tone.filename}>
                          {tone.name} ({tone.filename})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Repeat Days */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '6px' }}>REPEAT DAYS</label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {AVAILABLE_DAYS.map(day => {
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--mono)',
                          background: active ? 'var(--red-mute)' : 'var(--bg2)',
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

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingAlarmId ? (
                  <button 
                    type="button" 
                    onClick={() => { deleteAlarm(editingAlarmId); setShowAddModal(false); }}
                    style={{ padding: '8px 12px', color: 'var(--red-ember)', borderColor: 'var(--red-mute)', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={13} /> DELETE
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px' }}>
                    CANCEL
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                    {editingAlarmId ? 'UPDATE ALARM' : 'SAVE ALARM'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM TOUCH KEYBOARD PANE MODAL */}
      {showKeyboard && (
        <CustomKeyboard 
          value={newLabel}
          onChange={(val) => setNewLabel(val)}
          onClose={() => setShowKeyboard(false)}
          title="TYPE ALARM LABEL"
        />
      )}

      {/* ACTIVE RINGING ALARM MODAL */}
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
          <audio 
            ref={audioFileRef} 
            src={activeAlarm.toneUrl || '/uploads/tones/default_cyber_alarm.wav'} 
            loop 
            preload="auto"
          />

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
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '8px' }}>
              {activeAlarm.label}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--amber)', fontFamily: 'var(--mono)', marginBottom: '24px' }}>
              SOUND TONE: {activeAlarm.tone || 'Cyber Alarm'}
            </div>

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
