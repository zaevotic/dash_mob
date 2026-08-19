import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HardDrive, Upload, Film, Music, Trash2, Play, Pause, MonitorPlay, X } from 'lucide-react';

export const MediaOffloader = () => {
  const { media, currentPlayingMedia, setCurrentPlayingMedia, deleteMedia, refreshAllData } = useDashboard();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef(null);
  const mediaRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('mediaFile', files[i]);

      try {
        await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error('[Upload Error]', err);
      }
    }

    setUploading(false);
    refreshAllData();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  };

  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Film size={20} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            MEDIA OFFLOADER & PLAYER
          </h2>
        </div>
      </div>

      {/* Currently Playing Media Panel */}
      {currentPlayingMedia && (
        <div style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--red-ember)', 
          borderRadius: 'var(--radius-md)', 
          padding: '16px', 
          marginBottom: '20px',
          boxShadow: 'var(--shadow-ember)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red-ember)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
              <MonitorPlay size={16} />
              NOW PLAYING ON DESK HUB
            </div>
            <button onClick={() => setCurrentPlayingMedia(null)} style={{ padding: '4px', background: 'transparent', border: 'none' }}>
              <X size={16} />
            </button>
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text)' }}>
            {currentPlayingMedia.originalname}
          </h3>

          {currentPlayingMedia.type === 'video' ? (
            <video 
              ref={mediaRef} 
              src={currentPlayingMedia.url} 
              controls 
              autoPlay 
              style={{ width: '100%', borderRadius: 'var(--radius-sm)', maxHeight: '320px', background: '#000' }} 
            />
          ) : (
            <audio 
              ref={mediaRef} 
              src={currentPlayingMedia.url} 
              controls 
              autoPlay 
              style={{ width: '100%', marginTop: '8px' }} 
            />
          )}
        </div>
      )}

      {/* Drag & Drop Offload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--red-ember)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '28px 16px',
          textAlign: 'center',
          background: dragActive ? 'var(--red-mute)' : 'var(--bg2)',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s ease'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          onChange={(e) => handleFileUpload(e.target.files)} 
          style={{ display: 'none' }} 
          accept="video/*,audio/*,image/*"
        />
        <Upload size={32} style={{ color: 'var(--red-ember)', marginBottom: '8px' }} />
        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text)' }}>
          {uploading ? 'OFFLOADING FILES TO PHONE STORAGE...' : 'OFFLOAD MEDIA FROM PC TO PHONE'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '4px', fontFamily: 'var(--mono)' }}>
          Drag & drop MP4, MKV, MP3, WAV files to store on phone's SD Card
        </div>
      </div>

      {/* Offloaded Media Vault List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--text2)', textTransform: 'uppercase' }}>
          STORED MEDIA VAULT ({media.length} ITEMS)
        </h4>

        {media.length === 0 ? (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '20px', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
            No media offloaded yet. Drop files above to transfer.
          </div>
        ) : (
          media.map(item => (
            <div 
              key={item.id}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                {item.type === 'video' ? <Film size={18} style={{ color: 'var(--red-ember)', flexShrink: 0 }} /> : <Music size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.originalname}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {formatBytes(item.size)} • {new Date(item.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button 
                  onClick={() => setCurrentPlayingMedia(item)} 
                  className="btn-primary" 
                  style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                >
                  <Play size={12} />
                  PLAY
                </button>
                <button 
                  onClick={() => deleteMedia(item.id)} 
                  style={{ padding: '5px', color: 'var(--text3)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
