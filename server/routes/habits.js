import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.get('habits') || []);
});

router.post('/', (req, res) => {
  const { name, category, targetDays, color } = req.body;
  const habits = db.get('habits') || [];

  const newHabit = {
    id: 'habit_' + Date.now(),
    name: name || 'New Habit',
    category: category || 'General',
    targetDays: targetDays || 7,
    history: {},
    streak: 0,
    color: color || 'var(--red-ember)'
  };

  habits.push(newHabit);
  db.set('habits', habits);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('HABITS_UPDATED', habits);
  }

  res.json({ success: true, habit: newHabit });
});

router.post('/:id/checkin', (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const habits = db.get('habits') || [];
  const habit = habits.find(h => h.id === id);

  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  if (!habit.history) habit.history = {};

  const currentVal = !!habit.history[targetDate];
  if (currentVal) {
    delete habit.history[targetDate];
  } else {
    habit.history[targetDate] = true;
  }

  // Calculate streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (habit.history[dateStr]) {
      streak++;
    } else if (i > 0) {
      // Break streak if missing past day (allow today to be unchecked without breaking streak)
      break;
    }
  }

  habit.streak = streak;
  db.set('habits', habits);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('HABITS_UPDATED', habits);
  }

  res.json({ success: true, habit });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let habits = db.get('habits') || [];
  habits = habits.filter(h => h.id !== id);
  db.set('habits', habits);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('HABITS_UPDATED', habits);
  }

  res.json({ success: true, id });
});

export default router;
