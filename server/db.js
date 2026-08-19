import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  alarms: [
    {
      id: 'alarm_1',
      time: '07:30',
      label: 'Morning Work Focus',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      enabled: true,
      tone: 'Cyber Pulse',
      snoozeMinutes: 5
    },
    {
      id: 'alarm_2',
      time: '23:00',
      label: 'Wind Down & Backup',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: false,
      tone: 'Ember Wave',
      snoozeMinutes: 10
    }
  ],
  media: [],
  settings: {
    deviceName: 'Samsung M34 Desk Server',
    storagePath: path.join(__dirname, '../uploads'),
    maxStorageGB: 128,
    activeDashboardMode: 'clock', // 'clock' | 'media' | 'alarms' | 'remote'
    volume: 80,
    nightModeStart: '22:00',
    nightModeEnd: '06:30'
  },
  activeAlarm: null
};

class JSONDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        delete parsed.habits; // Clean habits from existing saved file if present
        return { ...defaultData, ...parsed };
      }
    } catch (err) {
      console.error('[DB] Error loading database file, initializing defaults:', err.message);
    }
    this.save(defaultData);
    return defaultData;
  }

  save(newData) {
    if (newData) this.data = newData;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving database:', err.message);
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
    return this.data[key];
  }
}

export const db = new JSONDatabase();
