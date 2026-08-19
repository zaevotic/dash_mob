import React, { useState, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HardDrive, Upload, Trash2, RefreshCw } from 'lucide-react';

function formatTerminalSize(bytes) {
  if (!bytes || bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'Ki', 'Mi', 'Gi', 'Ti'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = (bytes / Math.pow(k, i)).toFixed(1);
  return `${val}${sizes[i]}`;
}

function formatTerminalDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(nowMinutes(d)).padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes}`;
}

function nowMinutes(d) {
  return d.getMinutes();
}

export const StorageDirectoryPanel = () => {
  const { media, system, deleteMedia, refreshAllData } = useDashboard();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const storage = system?.storage || { usedGB: 0, maxGB: 128, percentage: 0, fileCount: 0 };

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

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={20} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--text)' }}>
            STORAGE DIRECTORY VAULT
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            onChange={(e) => handleFileUpload(e.target.files)} 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ fontSize: '0.75rem', padding: '5px 12px' }}
          >
            <Upload size={13} />
            {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
          </button>
          <button 
            onClick={refreshAllData} 
            style={{ padding: '5px 8px', fontSize: '0.75rem' }} 
            title="Refresh Directory"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Storage Gauge Bar Header */}
      <div style={{ 
        background: 'var(--bg2)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '10px 14px',
        marginBottom: '14px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text2)' }}>SD CARD STORAGE CAPACITY</span>
          <span style={{ color: 'var(--amber)' }}>{storage.usedGB} GB / {storage.maxGB} GB ({storage.percentage}%)</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg1)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div 
            style={{ 
              width: `${Math.max(2, storage.percentage)}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--amber), var(--red-ember))',
              transition: 'width 0.5s ease'
            }} 
          />
        </div>
      </div>

      {/* Terminal Directory Table Container (Horizontally & Vertically Scrollable internally) */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        {media.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: '0.85rem' }}>
            No files stored yet. Click "UPLOAD FILE" to transfer files to SD Card storage.
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontFamily: 'var(--mono)', 
            fontSize: '0.8rem',
            color: 'var(--text)',
            whiteSpace: 'nowrap'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)', background: 'var(--bg2)', color: 'var(--text2)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: '600' }}>PERMISSIONS</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', textAlign: 'right' }}>SIZE</th>
                <th style={{ padding: '8px 12px', fontWeight: '600' }}>DATE MODIFIED</th>
                <th style={{ padding: '8px 12px', fontWeight: '600' }}>NAME</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {media.map((file) => (
                <tr 
                  key={file.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease'
                  }}
                  className="terminal-row"
                >
                  <td style={{ padding: '8px 12px', color: 'var(--amber-dim)' }}>
                    .rw-r--r--
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--amber)', fontWeight: '600' }}>
                    {formatTerminalSize(file.size)}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>
                    {formatTerminalDate(file.uploadDate)}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text)' }}>
                    {file.originalname}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => deleteMedia(file.id)}
                      style={{ padding: '3px 6px', background: 'transparent', border: 'none', color: 'var(--red-ember)' }}
                      title="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
