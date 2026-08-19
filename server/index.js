import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db } from './db.js';
import filesRouter from './routes/files.js';
import alarmsRouter from './routes/alarms.js';
import systemRouter from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 3001 : 3000);

app.use(cors());
app.use(express.json());

// Serve static uploaded files and alarm audio tone files
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const TONES_DIR = path.join(UPLOADS_DIR, 'tones');
if (!fs.existsSync(TONES_DIR)) {
  fs.mkdirSync(TONES_DIR, { recursive: true });
}
app.use('/uploads/tones', express.static(TONES_DIR));

// WebSocket broadcast helper
function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: Date.now() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

app.set('wssBroadcast', broadcast);
app.set('wssClientCount', () => wss.clients.size);

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('[WSS] Client connected. Total active clients:', wss.clients.size);

  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    payload: {
      alarms: db.get('alarms') || [],
      activeAlarm: db.get('activeAlarm'),
      media: db.get('media') || [],
      settings: db.get('settings') || {}
    }
  }));

  ws.on('message', (messageRaw) => {
    try {
      const { type, payload } = JSON.parse(messageRaw.toString());

      if (type === 'REMOTE_COMMAND') {
        if (payload.action === 'CHANGE_MODE') {
          const settings = db.get('settings') || {};
          settings.activeDashboardMode = payload.mode;
          db.set('settings', settings);
          broadcast('SETTINGS_UPDATED', settings);
        } else if (payload.action === 'PLAY_MEDIA') {
          broadcast('REMOTE_PLAY_MEDIA', payload.media);
        }
      }
    } catch (e) {
      console.error('[WSS] Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('[WSS] Client disconnected. Total active clients:', wss.clients.size);
  });
});

// API Routes
app.use('/api/files', filesRouter);
app.use('/api/alarms', alarmsRouter);
app.use('/api/system', systemRouter);

// Background alarm trigger loop (checks every 10 seconds)
let lastTriggeredMinute = '';
setInterval(() => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

  if (currentTime === lastTriggeredMinute) return;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = daysOfWeek[now.getDay()];

  const alarms = db.get('alarms') || [];
  const activeAlarm = db.get('activeAlarm');

  if (activeAlarm) return;

  const matchingAlarm = alarms.find(a => {
    if (!a.enabled) return false;
    if (a.time !== currentTime) return false;
    if (a.days && a.days.length > 0 && !a.days.includes(currentDay)) return false;
    return true;
  });

  if (matchingAlarm) {
    lastTriggeredMinute = currentTime;
    const triggered = {
      id: matchingAlarm.id,
      time: matchingAlarm.time,
      label: matchingAlarm.label,
      tone: matchingAlarm.tone || 'Default Cyber Alarm',
      toneUrl: matchingAlarm.toneUrl || '/uploads/tones/default_cyber_alarm.wav',
      triggeredAt: new Date().toISOString()
    };
    db.set('activeAlarm', triggered);
    console.log(`[ALARM] Triggering scheduled alarm: ${matchingAlarm.label} (${matchingAlarm.time})`);
    broadcast('ALARM_TRIGGERED', triggered);
  }
}, 10000);

// Serve built frontend assets in production mode
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

function startServer(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` DashMob Server Running on http://0.0.0.0:${portToTry}`);
    console.log(` Uploads folder: ${UPLOADS_DIR}`);
    console.log(` Tones folder: ${TONES_DIR}`);
    console.log(`====================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && portToTry === 3000) {
      console.log(`[Server] Port 3000 in use (e.g. Vite dev server), trying port 3001...`);
      startServer(3001);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer(PORT);
