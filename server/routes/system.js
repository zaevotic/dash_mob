import express from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const router = express.Router();

function getLocalNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }
  return addresses.length > 0 ? addresses : [{ name: 'loopback', address: '127.0.0.1' }];
}

function getUploadsStorageBytes() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return 0;
    const files = fs.readdirSync(UPLOADS_DIR);
    let totalSize = 0;
    for (const file of files) {
      const stats = fs.statSync(path.join(UPLOADS_DIR, file));
      totalSize += stats.size;
    }
    return totalSize;
  } catch (err) {
    console.error('[SYSTEM] Error calculating storage size:', err);
    return 0;
  }
}

router.get('/', (req, res) => {
  const settings = db.get('settings') || {};
  const usedBytes = getUploadsStorageBytes();
  const maxGB = settings.maxStorageGB || 128;
  const maxBytes = maxGB * 1024 * 1024 * 1024;
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const percentage = Math.min(100, ((usedBytes / maxBytes) * 100).toFixed(1));

  const networkIPs = getLocalNetworkIPs();
  const wssClients = req.app.get('wssClientCount') ? req.app.get('wssClientCount')() : 1;

  res.json({
    settings,
    storage: {
      usedBytes,
      usedGB: parseFloat(usedGB),
      maxGB,
      maxBytes,
      percentage: parseFloat(percentage),
      fileCount: (db.get('media') || []).length
    },
    network: {
      ips: networkIPs,
      primaryIp: networkIPs[0]?.address || '127.0.0.1',
      port: process.env.PORT || 3000
    },
    connectedClients: wssClients,
    systemInfo: {
      uptimeSeconds: Math.floor(os.uptime()),
      platform: os.platform(),
      hostname: os.hostname(),
      freememMB: Math.floor(os.freemem() / (1024 * 1024)),
      totalmemMB: Math.floor(os.totalmem() / (1024 * 1024))
    }
  });
});

router.put('/settings', (req, res) => {
  const settings = db.get('settings') || {};
  const updatedSettings = { ...settings, ...req.body };
  db.set('settings', updatedSettings);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('SETTINGS_UPDATED', updatedSettings);
  }

  res.json({ success: true, settings: updatedSettings });
});

export default router;
