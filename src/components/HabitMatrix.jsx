import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Zap, Plus, Check, Flame, Trash2 } from 'lucide-react';

const PAST_DAYS_COUNT = 7;

export const HabitMatrix = () => {
  const { habits, addHabit, checkinHabit, deleteHabit } = useDashboard();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Productivity');

  // Generate last 7 days date strings [YYYY-MM-DD]
  const dates = Array.from({ length: PAST_DAYS_COUNT }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (PAST_DAYS_COUNT - 1 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      isToday: i === PAST_DAYS_COUNT - 1
    };
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    await addHabit({ name, category, targetDays: 7 });
    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={20} style={{ color: 'var(--amber)' }} />
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            HABIT MATRIX
          </h2>
        </div>
        <button className="btn-amber" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          {showAddForm ? 'CANCEL' : 'NEW HABIT'}
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border2)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '4px' }}>HABIT NAME</label>
              <input 
                type="text" 
                placeholder="e.g. Read 20 mins, Workout" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: '100%' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '4px' }}>CATEGORY</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
                <option value="Productivity">Productivity</option>
                <option value="Health">Health</option>
                <option value="Learning">Learning</option>
                <option value="Mindfulness">Mindfulness</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>ADD TO MATRIX</button>
        </form>
      )}

      {/* Habit List Table / Matrix */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '10px 8px', fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>HABIT</th>
              <th style={{ padding: '10px 8px', fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'var(--mono)', textAlign: 'center' }}>STREAK</th>
              {dates.map((d) => (
                <th 
                  key={d.dateStr} 
                  style={{ 
                    padding: '8px 4px', 
                    fontSize: '0.75rem', 
                    color: d.isToday ? 'var(--red-ember)' : 'var(--text3)', 
                    fontFamily: 'var(--mono)',
                    textAlign: 'center',
                    background: d.isToday ? 'var(--red-hover-tint)' : 'transparent'
                  }}
                >
                  <div>{d.dayName}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: d.isToday ? '700' : 'normal' }}>{d.dayNum}</div>
                </th>
              ))}
              <th style={{ width: '30px' }}></th>
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  No habits being tracked yet.
                </td>
              </tr>
            ) : (
              habits.map((habit) => (
                <tr key={habit.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>{habit.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{habit.category}</div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span className="badge badge-red font-mono" style={{ gap: '3px' }}>
                      <Flame size={12} fill="var(--red-ember)" />
                      {habit.streak || 0}d
                    </span>
                  </td>
                  {dates.map((d) => {
                    const isChecked = !!(habit.history && habit.history[d.dateStr]);
                    return (
                      <td key={d.dateStr} style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <button
                          onClick={() => checkinHabit(habit.id, d.dateStr)}
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            justifyContent: 'center',
                            borderRadius: '6px',
                            background: isChecked ? (habit.color || 'var(--red-ember)') : 'var(--bg2)',
                            borderColor: isChecked ? 'var(--red-ember)' : 'var(--border)',
                            color: isChecked ? '#fff' : 'transparent',
                            margin: '0 auto'
                          }}
                          title={`Toggle ${habit.name} for ${d.dateStr}`}
                        >
                          <Check size={16} style={{ strokeWidth: 3 }} />
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: '12px 4px', textAlign: 'center' }}>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      style={{ padding: '4px', color: 'var(--text3)', background: 'transparent', border: 'none' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
