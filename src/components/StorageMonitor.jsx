import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HardDrive, Wifi, Server, Cpu, Users } from 'lucide-react';

export const StorageMonitor = () => {
  const { system, settings } = useDashboard();

  const storage = system?.storage || { usedGB: 0, maxGB: 128, percentage: 0, fileCount: 0 };
  const network = system?.network || { primaryIp: '127.0.0.1', port: 3000 };
  const clients = system?.connectedClients || 1;
  const sysInfo = system?.systemInfo || { uptimeSeconds: 0, freememMB: 0, totalmemMB: 0 };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
  };

  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Server size={20} style={{ color: 'var(--amber)' }} />
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            STORAGE & NETWORK NODE
          </h2>
        </div>
        <span className="badge badge-amber font-mono">
          <Users size={12} />
          {clients} ACTIVE PEER{clients > 1 ? 'S' : ''}
        </span>
      </div>

      {/* Storage Gauge (128GB capacity) */}
      <div style={{ 
        background: 'var(--bg2)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text)' }}>
            <HardDrive size={16} style={{ color: 'var(--red-ember)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>SD CARD / LOCAL VAULT</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
            {storage.usedGB} GB / {storage.maxGB} GB ({storage.percentage}%)
          </div>
        </div>

        {/* Storage Bar */}
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
      </div>

      {/* Network & Local IP Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
            <Wifi size={14} style={{ color: 'var(--green)' }} />
            LOCAL NETWORK IP
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--mono)', color: 'var(--text)', marginTop: '4px' }}>
            http://{network.primaryIp}:{network.port}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '2px' }}>
            Open on Laptop / Phone browser to control
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
            <Cpu size={14} style={{ color: 'var(--amber)' }} />
            NODE UPTIME & MEMORY
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--mono)', color: 'var(--text)', marginTop: '4px' }}>
            {formatUptime(sysInfo.uptimeSeconds)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '2px' }}>
            RAM Free: {sysInfo.freememMB} MB / {sysInfo.totalmemMB} MB
          </div>
        </div>
      </div>
    </div>
  );
};
