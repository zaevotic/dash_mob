import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TONES_DIR = path.join(__dirname, '../../uploads/tones');
if (!fs.existsSync(TONES_DIR)) {
  fs.mkdirSync(TONES_DIR, { recursive: true });
}

// Generate default WAV tone if directory is empty
function ensureDefaultTone() {
  try {
    const files = fs.readdirSync(TONES_DIR).filter(f => /\.(wav|mp3|ogg|m4a)$/i.test(f));
    if (files.length === 0) {
      const defaultWavPath = path.join(TONES_DIR, 'default_cyber_alarm.wav');
      const sampleRate = 44100;
      const numChannels = 1;
      const bitsPerSample = 16;
      const durationSec = 3;
      const numSamples = sampleRate * durationSec;
      const blockAlign = numChannels * (bitsPerSample / 8);
      const byteRate = sampleRate * blockAlign;
      const dataSize = numSamples * blockAlign;
      const chunkSize = 36 + dataSize;

      const buffer = Buffer.alloc(44 + dataSize);
      buffer.write('RIFF', 0);
      buffer.writeUInt32LE(chunkSize, 4);
      buffer.write('WAVE', 8);
      buffer.write('fmt ', 12);
      buffer.writeUInt32LE(16, 16);
      buffer.writeUInt16LE(1, 20);
      buffer.writeUInt16LE(numChannels, 22);
      buffer.writeUInt32LE(sampleRate, 24);
      buffer.writeUInt32LE(byteRate, 28);
      buffer.writeUInt16LE(blockAlign, 32);
      buffer.writeUInt16LE(bitsPerSample, 34);
      buffer.write('data', 36);
      buffer.writeUInt32LE(dataSize, 40);

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const cycle = Math.floor(t * 4) % 2;
        const freq = cycle === 0 ? 880 : 1320;
        const sampleVal = Math.sin(2 * Math.PI * freq * t) * 0.4;
        const sample16 = Math.max(-32768, Math.min(32767, Math.floor(sampleVal * 32767)));
        buffer.writeInt16LE(sample16, 44 + i * 2);
      }
      fs.writeFileSync(defaultWavPath, buffer);
      console.log('[ALARM] Generated default_cyber_alarm.wav audio file');
    }
  } catch (err) {
    console.error('[ALARM] Error generating default tone:', err);
  }
}

ensureDefaultTone();

const router = express.Router();

// GET all alarms + active alarm
router.get('/', (req, res) => {
  res.json({
    alarms: db.get('alarms') || [],
    activeAlarm: db.get('activeAlarm')
  });
});

// GET list of available audio tone files in uploads/tones
router.get('/tones', (req, res) => {
  ensureDefaultTone();
  try {
    const files = fs.readdirSync(TONES_DIR).filter(f => /\.(wav|mp3|ogg|m4a|flac)$/i.test(f));
    const toneList = files.map(filename => {
      const nameWithoutExt = path.parse(filename).name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return {
        id: filename,
        name: nameWithoutExt,
        filename,
        url: `/uploads/tones/${filename}`
      };
    });
    res.json(toneList);
  } catch (e) {
    console.error('[ALARM] Error listing tones:', e);
    res.json([{ id: 'default_cyber_alarm.wav', name: 'Default Cyber Alarm', filename: 'default_cyber_alarm.wav', url: '/uploads/tones/default_cyber_alarm.wav' }]);
  }
});

// POST new alarm
router.post('/', (req, res) => {
  const { time, label, days, tone, toneUrl, snoozeMinutes } = req.body;
  const alarms = db.get('alarms') || [];
  
  const newAlarm = {
    id: 'alarm_' + Date.now(),
    time: time || '08:00',
    label: label || 'Alarm',
    days: days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    enabled: true,
    tone: tone || 'Default Cyber Alarm',
    toneUrl: toneUrl || '/uploads/tones/default_cyber_alarm.wav',
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
    tone: alarm.tone || 'Default Cyber Alarm',
    toneUrl: alarm.toneUrl || '/uploads/tones/default_cyber_alarm.wav',
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
