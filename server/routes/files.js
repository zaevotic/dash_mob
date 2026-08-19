import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import { resolveStoragePath } from './system.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = resolveStoragePath();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

// Get list of physical media/files on SD card storage
router.get('/', (req, res) => {
  const storageDir = resolveStoragePath();
  const dbMedia = db.get('media') || [];

  try {
    if (fs.existsSync(storageDir)) {
      const dirFiles = fs.readdirSync(storageDir);
      const fileItems = dirFiles.map(file => {
        const fullPath = path.join(storageDir, file);
        try {
          const stats = fs.statSync(fullPath);
          if (!stats.isFile()) return null;

          const matchedDb = dbMedia.find(m => m.filename === file);
          const ext = path.extname(file).toLowerCase();

          let fileType = 'other';
          if (['.mp4', '.mkv', '.webm', '.avi', '.mov'].includes(ext)) fileType = 'video';
          else if (['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) fileType = 'audio';
          else if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) fileType = 'image';

          return {
            id: matchedDb ? matchedDb.id : 'file_' + file,
            originalname: matchedDb ? matchedDb.originalname : file,
            filename: file,
            size: stats.size,
            type: fileType,
            uploadDate: stats.mtime.toISOString(),
            url: `/uploads/${file}`
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      // Sort newest first
      fileItems.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      return res.json(fileItems);
    }
  } catch (err) {
    console.error('[FILES] Error reading storage directory:', err);
  }

  res.json(dbMedia);
});

// Upload media/file to SD card storage
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

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('MEDIA_UPDATED', mediaList);
  }

  res.json({ success: true, file: newItem });
});

// Delete file from SD card storage
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const storageDir = resolveStoragePath();
  const mediaList = db.get('media') || [];

  const fileIndex = mediaList.findIndex(item => item.id === id || item.filename === id);
  let filenameToDelete = id;

  if (fileIndex !== -1) {
    filenameToDelete = mediaList[fileIndex].filename;
    mediaList.splice(fileIndex, 1);
    db.set('media', mediaList);
  }

  const filePath = path.join(storageDir, filenameToDelete);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('[FILES] Error deleting file:', e);
    }
  }

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('MEDIA_UPDATED', mediaList);
  }

  res.json({ success: true, id });
});

export default router;
