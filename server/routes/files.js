import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

// Get list of media files
router.get('/', (req, res) => {
  const mediaList = db.get('media') || [];
  res.json(mediaList);
});

// Upload media file (offload from laptop/phone)
router.post('/upload', upload.single('mediaFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, filename, mimetype, size } = req.file;
  let fileType = 'other';
  if (mimetype.startsWith('video/')) fileType = 'video';
  else if (mimetype.startsWith('audio/')) fileType = 'audio';
  else if (mimetype.startsWith('image/')) fileType = 'image';

  const newItem = {
    id: 'media_' + Date.now(),
    originalname,
    filename,
    mimetype,
    size,
    type: fileType,
    uploadDate: new Date().toISOString(),
    url: `/uploads/${filename}`
  };

  const mediaList = db.get('media') || [];
  mediaList.unshift(newItem);
  db.set('media', mediaList);

  // Broadcast to WebSockets via app handler
  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('MEDIA_UPDATED', mediaList);
  }

  res.json({ success: true, file: newItem });
});

// Delete media file
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const mediaList = db.get('media') || [];
  const fileIndex = mediaList.findIndex(item => item.id === id);

  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const item = mediaList[fileIndex];
  const filePath = path.join(UPLOADS_DIR, item.filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('[FILES] Error deleting file:', e);
    }
  }

  mediaList.splice(fileIndex, 1);
  db.set('media', mediaList);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('MEDIA_UPDATED', mediaList);
  }

  res.json({ success: true, id });
});

export default router;
