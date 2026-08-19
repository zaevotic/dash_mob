import React, { useState, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Upload, Film, Music, Trash2, Play, MonitorPlay, X } from 'lucide-react';

export const MediaOffloader = () => {
  const { media, currentPlayingMedia, setCurrentPlayingMedia, deleteMedia, refreshAllData } = useDashboard();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const mediaRef = useRef(null);

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
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={18} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            MEDIA OFFLOADER
          </h2>
        </div>
      </div>

      {/* Currently Playing Media Panel */}
      {currentPlayingMedia && (
        <div style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--red-ember)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '10px', 
          marginBottom: '10px',
          boxShadow: 'var(--shadow-ember)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red-ember)', fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
              <MonitorPlay size={14} />
              PLAYING NOW
            </div>
            <button onClick={() => setCurrentPlayingMedia(null)} style={{ padding: '2px', background: 'transparent', border: 'none' }}>
              <X size={14} />
            </button>
          </div>

          {currentPlayingMedia.type === 'video' ? (
            <video 
              ref={mediaRef} 
              src={currentPlayingMedia.url} 
              controls 
              autoPlay 
              style={{ width: '100%', borderRadius: 'var(--radius-sm)', maxHeight: '180px', background: '#000' }} 
            />
          ) : (
            <audio 
              ref={mediaRef} 
              src={currentPlayingMedia.url} 
              controls 
              autoPlay 
              style={{ width: '100%' }} 
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
          border: `1px dashed ${dragActive ? 'var(--red-ember)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '12px 10px',
          textAlign: 'center',
          background: dragActive ? 'var(--red-mute)' : 'var(--bg2)',
          cursor: 'pointer',
          marginBottom: '10px',
          flexShrink: 0,
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
        <Upload size={20} style={{ color: 'var(--red-ember)', marginBottom: '4px' }} />
        <div style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text)' }}>
          {uploading ? 'OFFLOADING FILES...' : 'OFFLOAD MEDIA TO PHONE'}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
          Drop MP4, MKV, MP3 files
        </div>
      </div>

      {/* Scrollable Media Vault List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--mono)', color: 'var(--text2)', textTransform: 'uppercase' }}>
          MEDIA VAULT ({media.length})
        </div>

        {media.length === 0 ? (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '12px', fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
            No media files offloaded.
          </div>
        ) : (
          media.map(item => (
            <div 
              key={item.id}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {item.type === 'video' ? <Film size={15} style={{ color: 'var(--red-ember)', flexShrink: 0 }} /> : <Music size={15} style={{ color: 'var(--amber)', flexShrink: 0 }} />}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.originalname}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {formatBytes(item.size)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button 
                  onClick={() => setCurrentPlayingMedia(item)} 
                  className="btn-primary" 
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  <Play size={10} />
                  PLAY
                </button>
                <button 
                  onClick={() => deleteMedia(item.id)} 
                  style={{ padding: '4px', color: 'var(--text3)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
