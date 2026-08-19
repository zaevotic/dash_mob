import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    alarms: db.get('alarms') || [],
    activeAlarm: db.get('activeAlarm')
  });
});

router.post('/', (req, res) => {
  const { time, label, days, tone, snoozeMinutes } = req.body;
  const alarms = db.get('alarms') || [];
  
  const newAlarm = {
    id: 'alarm_' + Date.now(),
    time: time || '08:00',
    label: label || 'Alarm',
    days: days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    enabled: true,
    tone: tone || 'Cyber Pulse',
    snoozeMinutes: snoozeMinutes || 5
  };

  alarms.push(newAlarm);
  db.set('alarms', alarms);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARMS_UPDATED', { alarms, activeAlarm: db.get('activeAlarm') });
  }

  res.json({ success: true, alarm: newAlarm });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const alarms = db.get('alarms') || [];
  const index = alarms.findIndex(a => a.id === id);

  if (index === -1) return res.status(404).json({ error: 'Alarm not found' });

  alarms[index] = { ...alarms[index], ...req.body };
  db.set('alarms', alarms);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARMS_UPDATED', { alarms, activeAlarm: db.get('activeAlarm') });
  }

  res.json({ success: true, alarm: alarms[index] });
});

router.patch('/:id/toggle', (req, res) => {
  const { id } = req.params;
  const alarms = db.get('alarms') || [];
  const index = alarms.findIndex(a => a.id === id);

  if (index === -1) return res.status(404).json({ error: 'Alarm not found' });

  alarms[index].enabled = !alarms[index].enabled;
  db.set('alarms', alarms);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARMS_UPDATED', { alarms, activeAlarm: db.get('activeAlarm') });
  }

  res.json({ success: true, alarm: alarms[index] });
});

// Trigger alarm (remote test or scheduled match)
router.post('/:id/trigger', (req, res) => {
  const { id } = req.params;
  const alarms = db.get('alarms') || [];
  const alarm = alarms.find(a => a.id === id);

  if (!alarm) return res.status(404).json({ error: 'Alarm not found' });

  const activeAlarm = {
    id: alarm.id,
    time: alarm.time,
    label: alarm.label,
    tone: alarm.tone,
    triggeredAt: new Date().toISOString()
  };

  db.set('activeAlarm', activeAlarm);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARM_TRIGGERED', activeAlarm);
  }

  res.json({ success: true, activeAlarm });
});

router.post('/dismiss', (req, res) => {
  db.set('activeAlarm', null);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARM_DISMISSED', null);
  }

  res.json({ success: true });
});

router.post('/snooze', (req, res) => {
  const active = db.get('activeAlarm');
  db.set('activeAlarm', null);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARM_SNOOZED', { active, snoozeTimeMinutes: 5 });
  }

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let alarms = db.get('alarms') || [];
  alarms = alarms.filter(a => a.id !== id);
  db.set('alarms', alarms);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('ALARMS_UPDATED', { alarms, activeAlarm: db.get('activeAlarm') });
  }

  res.json({ success: true, id });
});

export default router;
