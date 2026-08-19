import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HardDrive } from 'lucide-react';

export const StorageMonitor = ({ onNavigateToStorage }) => {
  const { system } = useDashboard();
  const storage = system?.storage || { usedGB: 0, maxGB: 128, percentage: 0 };

  return (
    <div 
      className="panel-card" 
      onClick={onNavigateToStorage}
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '12px 16px',
        cursor: onNavigateToStorage ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      title={onNavigateToStorage ? 'Click to open full Storage Directory' : ''}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} style={{ color: 'var(--red-ember)' }} />
          <h2 style={{ fontSize: '0.95rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--text)' }}>
            STORAGE
          </h2>
        </div>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
          {storage.usedGB} GB / {storage.maxGB} GB ({storage.percentage}%)
        </div>
      </div>

      {/* Storage Progress Bar */}
      <div style={{ width: '100%', height: '10px', background: 'var(--bg1)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div 
          style={{ 
            width: `${Math.max(2, storage.percentage)}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--amber), var(--red-ember))',
            transition: 'width 0.5s ease'
          }} 
        />
      </div>

      {onNavigateToStorage && (
        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: '6px', textAlign: 'right' }}>
          TAP TO VIEW DIRECTORY LISTING &rarr;
        </div>
      )}
    </div>
  );
};
