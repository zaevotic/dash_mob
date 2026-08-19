import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// POST /api/playback/youtube - Send to Dock YouTube video instruction
router.post('/youtube', (req, res) => {
  const { videoId, startSeconds = 0, title } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  const mediaItem = {
    id: `yt_${videoId}`,
    videoId: videoId,
    originalname: title || `YouTube Video (${videoId})`,
    title: title || `YouTube Video (${videoId})`,
    type: 'youtube',
    url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&start=${Math.floor(startSeconds)}`
  };

  const newPlaybackState = {
    currentMedia: mediaItem,
    type: 'youtube',
    isPlaying: true,
    currentTime: Math.floor(startSeconds),
    duration: 0
  };

  db.set('playbackState', newPlaybackState);

  if (req.app.get('wssBroadcast')) {
    req.app.get('wssBroadcast')('PLAYBACK_UPDATED', newPlaybackState);
  }

  console.log(`[YOUTUBE PLAYBACK] Sent to dock: "${mediaItem.title}" (${videoId}) at ${startSeconds}s`);
  res.json({ success: true, playbackState: newPlaybackState });
});

export default router;
