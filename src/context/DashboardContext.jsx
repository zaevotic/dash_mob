import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [habits, setHabits] = useState([]);
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

  // Fetch initial REST data
  const refreshAllData = async () => {
    try {
      const [alarmsRes, habitsRes, filesRes, sysRes] = await Promise.all([
        fetch('/api/alarms').then(r => r.json()),
        fetch('/api/habits').then(r => r.json()),
        fetch('/api/files').then(r => r.json()),
        fetch('/api/system').then(r => r.json())
      ]);

      if (alarmsRes.alarms) setAlarms(alarmsRes.alarms);
      if (alarmsRes.activeAlarm !== undefined) setActiveAlarm(alarmsRes.activeAlarm);
      if (habitsRes) setHabits(habitsRes);
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

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      console.log('[DashboardContext] Connecting to WebSocket at', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[DashboardContext] WebSocket Connected!');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          console.log('[WS Msg]', type, payload);

          switch (type) {
            case 'INITIAL_STATE':
              if (payload.alarms) setAlarms(payload.alarms);
              if (payload.activeAlarm !== undefined) setActiveAlarm(payload.activeAlarm);
              if (payload.habits) setHabits(payload.habits);
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
            case 'HABITS_UPDATED':
              setHabits(payload);
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
        console.log('[DashboardContext] WebSocket Disconnected. Retrying in 3s...');
        setIsConnected(false);
        setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WS Error]', err);
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

  // Alarm actions
  const addAlarm = async (alarmData) => {
    const res = await fetch('/api/alarms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alarmData)
    });
    return res.json();
  };

  const toggleAlarm = async (id) => {
    const res = await fetch(`/api/alarms/${id}/toggle`, { method: 'PATCH' });
    return res.json();
  };

  const triggerAlarmTest = async (id) => {
    const res = await fetch(`/api/alarms/${id}/trigger`, { method: 'POST' });
    return res.json();
  };

  const dismissAlarm = async () => {
    const res = await fetch('/api/alarms/dismiss', { method: 'POST' });
    return res.json();
  };

  const snoozeAlarm = async () => {
    const res = await fetch('/api/alarms/snooze', { method: 'POST' });
    return res.json();
  };

  const deleteAlarm = async (id) => {
    const res = await fetch(`/api/alarms/${id}`, { method: 'DELETE' });
    return res.json();
  };

  // Habit actions
  const addHabit = async (habitData) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habitData)
    });
    return res.json();
  };

  const checkinHabit = async (id, date) => {
    const res = await fetch(`/api/habits/${id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    return res.json();
  };

  const deleteHabit = async (id) => {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    return res.json();
  };

  // File & Remote actions
  const deleteMedia = async (id) => {
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
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
      habits,
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
      addHabit,
      checkinHabit,
      deleteHabit,
      deleteMedia,
      sendRemoteCommand,
      updateSettings,
      refreshAllData
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
