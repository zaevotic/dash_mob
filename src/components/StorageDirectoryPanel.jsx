import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HardDrive, Play, Trash2, Upload, RefreshCw, FileText, Film, Music } from 'lucide-react';

function formatTerminalSize(bytes) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '-';
  if (bytes === 0) return '0B';
  const units = ['B', 'Ki', 'Mi', 'Gi', 'Ti'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes}B`;
  const val = (bytes / Math.pow(1024, i)).toFixed(1);
  return `${val}${units[i]}`;
}

function formatTerminalDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${hours}:${mins}`;
  } catch (e) {
    return dateString;
  }
}

export const StorageDirectoryPanel = () => {
  const { media, deleteMedia, refreshAllData, playMedia, playbackState } = useDashboard();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('mediaFile', file);

    try {
      await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      await refreshAllData();
    } catch (err) {
      console.error('[Upload Error]', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 14px' }}>
      {/* Directory Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '0.95rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            STORAGE VAULT DIRECTORY (`/storage`)
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button 
            onClick={refreshAllData} 
            title="Refresh Directory"
            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
          >
            <RefreshCw size={12} /> REFRESH
          </button>

          <label className="btn-primary" style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={12} />
            {uploading ? 'UPLOADING...' : 'OFFLOAD FILE'}
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* ls -al Terminal Table */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border2)', color: 'var(--text2)', background: 'var(--bg1)', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px' }}>PERMISSIONS</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>SIZE</th>
              <th style={{ padding: '8px 10px' }}>DATE MODIFIED</th>
              <th style={{ padding: '8px 10px' }}>NAME</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {media.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>
                  No files stored yet.
                </td>
              </tr>
            ) : (
              media.map((file) => {
                const isCurrent = playbackState.currentMedia?.id === file.id;
                const isMediaFile = file.type === 'video' || file.type === 'audio' || /\.(mp4|mkv|webm|mp3|wav|ogg|m4a)$/i.test(file.filename);

                return (
                  <tr 
                    key={file.id || file.filename}
                    style={{ 
                      borderBottom: '1px solid var(--border)',
                      background: isCurrent ? 'var(--red-mute)' : 'transparent',
                      color: isCurrent ? 'var(--red-ember)' : 'var(--text)'
                    }}
                  >
                    <td style={{ padding: '6px 10px', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                      .rw-r--r--
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatTerminalSize(file.size)}
                    </td>
                    <td style={{ padding: '6px 10px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                      {formatTerminalDate(file.uploadDate)}
                    </td>
                    <td style={{ padding: '6px 10px', wordBreak: 'break-all' }}>
                      {file.originalname || file.filename}
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {isMediaFile && (
                          <button 
                            onClick={() => playMedia(file)}
                            className={isCurrent ? 'btn-primary' : ''}
                            style={{ padding: '3px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Play size={11} /> PLAY
                          </button>
                        )}
                        <button 
                          onClick={() => deleteMedia(file.id || file.filename)}
                          style={{ padding: '3px 6px', color: 'var(--text3)', background: 'transparent', border: 'none' }}
                          title="Delete File"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
