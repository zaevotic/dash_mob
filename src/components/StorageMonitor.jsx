import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HardDrive, Wifi, Server, Cpu, Users } from 'lucide-react';

export const StorageMonitor = () => {
  const { system } = useDashboard();

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
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} style={{ color: 'var(--amber)' }} />
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            STORAGE & NETWORK NODE
          </h2>
        </div>
        <span className="badge badge-amber font-mono" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
          <Users size={10} />
          {clients} PEER{clients > 1 ? 'S' : ''}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
        {/* Storage Gauge (128GB capacity) */}
        <div style={{ 
          background: 'var(--bg2)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text)' }}>
              <HardDrive size={14} style={{ color: 'var(--red-ember)' }} />
              <span style={{ fontFamily: 'var(--mono)', fontWeight: '600' }}>SD VAULT</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
              {storage.usedGB} GB / {storage.maxGB} GB ({storage.percentage}%)
            </div>
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

        {/* Network & Local IP Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
              <Wifi size={12} style={{ color: 'var(--green)' }} />
              LOCAL NETWORK IP
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'var(--mono)', color: 'var(--text)', marginTop: '2px' }}>
              http://{network.primaryIp}:{network.port}
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
              <Cpu size={12} style={{ color: 'var(--amber)' }} />
              NODE UPTIME & MEMORY
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'var(--mono)', color: 'var(--text)', marginTop: '2px' }}>
              {formatUptime(sysInfo.uptimeSeconds)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
