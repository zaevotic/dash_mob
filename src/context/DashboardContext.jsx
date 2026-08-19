import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [availableTones, setAvailableTones] = useState([]);
  const [media, setMedia] = useState([]);
  const [settings, setSettings] = useState({
    deviceName: 'Samsung M34 Desk Server',
    maxStorageGB: 128,
    activeDashboardMode: 'clock',
    volume: 80
  });
  const [system, setSystem] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlayingMedia, setCurrentPlayingMedia] = useState(null);

  const wsRef = useRef(null);

  // Fetch available tone audio files
  const fetchTones = async () => {
    try {
      const res = await fetch('/api/alarms/tones');
      const data = await res.json();
      if (Array.isArray(data)) setAvailableTones(data);
    } catch (e) {
      console.error('[DashboardContext] Error fetching tone files:', e);
    }
  };

  // Fetch initial REST data
  const refreshAllData = async () => {
    try {
      const [alarmsRes, filesRes, sysRes] = await Promise.all([
        fetch('/api/alarms').then(r => r.json()),
        fetch('/api/files').then(r => r.json()),
        fetch('/api/system').then(r => r.json())
      ]);

      if (alarmsRes.alarms) setAlarms(alarmsRes.alarms);
      if (alarmsRes.activeAlarm !== undefined) setActiveAlarm(alarmsRes.activeAlarm);
      if (filesRes) setMedia(filesRes);
      if (sysRes) {
        setSystem(sysRes);
        if (sysRes.settings) setSettings(sysRes.settings);
      }
    } catch (err) {
      console.error('[DashboardContext] Error fetching REST data:', err);
    }
  };

  // WebSocket Auto-connect
  useEffect(() => {
    refreshAllData();
    fetchTones();

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);

          switch (type) {
            case 'INITIAL_STATE':
              if (payload.alarms) setAlarms(payload.alarms);
              if (payload.activeAlarm !== undefined) setActiveAlarm(payload.activeAlarm);
              if (payload.media) setMedia(payload.media);
              if (payload.settings) setSettings(payload.settings);
              break;
            case 'ALARMS_UPDATED':
              if (payload.alarms) setAlarms(payload.alarms);
              if (payload.activeAlarm !== undefined) setActiveAlarm(payload.activeAlarm);
              break;
            case 'ALARM_TRIGGERED':
              setActiveAlarm(payload);
              break;
            case 'ALARM_DISMISSED':
            case 'ALARM_SNOOZED':
              setActiveAlarm(null);
              break;
            case 'MEDIA_UPDATED':
              setMedia(payload);
              break;
            case 'SETTINGS_UPDATED':
              setSettings(payload);
              break;
            case 'REMOTE_PLAY_MEDIA':
              setCurrentPlayingMedia(payload);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('[WS Parse Error]', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        ws.close();
      };
    };

    connectWS();

    const sysInterval = setInterval(async () => {
      try {
        const sysRes = await fetch('/api/system').then(r => r.json());
        if (sysRes) setSystem(sysRes);
      } catch (e) {}
    }, 15000);

    return () => {
      clearInterval(sysInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Alarm actions with direct state updates & fallback refresh
  const addAlarm = async (alarmData) => {
    try {
      const res = await fetch('/api/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alarmData)
      });
      const data = await res.json();
      if (data.alarm) {
        setAlarms(prev => [...prev, data.alarm]);
      }
      refreshAllData();
      return data;
    } catch (err) {
      console.error('[addAlarm Error]', err);
      // Fallback local creation if server fetch fails
      const fallbackAlarm = {
        id: 'alarm_' + Date.now(),
        time: alarmData.time || '08:00',
        label: alarmData.label || 'Alarm',
        days: alarmData.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        enabled: true,
        tone: alarmData.tone || 'Default Cyber Alarm',
        toneUrl: alarmData.toneUrl || '/uploads/tones/default_cyber_alarm.wav',
        snoozeMinutes: 5
      };
      setAlarms(prev => [...prev, fallbackAlarm]);
      return { success: true, alarm: fallbackAlarm };
    }
  };

  const toggleAlarm = async (id) => {
    try {
      setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
      const res = await fetch(`/api/alarms/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      refreshAllData();
      return data;
    } catch (e) {
      console.error('[toggleAlarm Error]', e);
    }
  };

  const triggerAlarmTest = async (id) => {
    try {
      const res = await fetch(`/api/alarms/${id}/trigger`, { method: 'POST' });
      const data = await res.json();
      if (data.activeAlarm) setActiveAlarm(data.activeAlarm);
      return data;
    } catch (e) {
      const alarm = alarms.find(a => a.id === id);
      if (alarm) {
        setActiveAlarm({
          id: alarm.id,
          time: alarm.time,
          label: alarm.label,
          tone: alarm.tone || 'Default Cyber Alarm',
          toneUrl: alarm.toneUrl || '/uploads/tones/default_cyber_alarm.wav',
          triggeredAt: new Date().toISOString()
        });
      }
    }
  };

  const dismissAlarm = async () => {
    setActiveAlarm(null);
    try {
      await fetch('/api/alarms/dismiss', { method: 'POST' });
    } catch (e) {}
  };

  const snoozeAlarm = async () => {
    setActiveAlarm(null);
    try {
      await fetch('/api/alarms/snooze', { method: 'POST' });
    } catch (e) {}
  };

  const deleteAlarm = async (id) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
    try {
      const res = await fetch(`/api/alarms/${id}`, { method: 'DELETE' });
      refreshAllData();
      return res.json();
    } catch (e) {}
  };

  // File & Remote actions
  const deleteMedia = async (id) => {
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
    refreshAllData();
    return res.json();
  };

  const sendRemoteCommand = (action, payload = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'REMOTE_COMMAND',
        payload: { action, ...payload }
      }));
    }
  };

  const updateSettings = async (newSettings) => {
    const res = await fetch('/api/system/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    return res.json();
  };

  return (
    <DashboardContext.Provider value={{
      alarms,
      activeAlarm,
      availableTones,
      media,
      settings,
      system,
      isConnected,
      currentPlayingMedia,
      setCurrentPlayingMedia,
      addAlarm,
      toggleAlarm,
      triggerAlarmTest,
      dismissAlarm,
      snoozeAlarm,
      deleteAlarm,
      deleteMedia,
      sendRemoteCommand,
      updateSettings,
      refreshAllData,
      fetchTones
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
