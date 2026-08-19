import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [availableTones, setAvailableTones] = useState([]);
  const [media, setMedia] = useState([]);
  const [playbackState, setPlaybackState] = useState({
    currentMedia: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });
  const [settings, setSettings] = useState({
    deviceName: 'Samsung M34 Desk Server',
    maxStorageGB: 128,
    activeDashboardMode: 'clock',
    volume: 80
  });
  const [system, setSystem] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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

  // WebSocket Auto-connect across local network
  useEffect(() => {
    refreshAllData();
    fetchTones();

    let reconnectTimer = null;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
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
                if (payload.playbackState) setPlaybackState(payload.playbackState);
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
              case 'PLAYBACK_UPDATED':
                setPlaybackState(prev => ({ ...prev, ...payload }));
                break;
              case 'SETTINGS_UPDATED':
                setSettings(payload);
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
          reconnectTimer = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error('[WS Connection Error]', err);
        reconnectTimer = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    const sysInterval = setInterval(async () => {
      try {
        const sysRes = await fetch('/api/system').then(r => r.json());
        if (sysRes) setSystem(sysRes);
      } catch (e) {}
    }, 10000);

    return () => {
      clearInterval(sysInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Sync playback state change across network
  const sendPlaybackUpdate = (updateObj) => {
    const updated = { ...playbackState, ...updateObj };
    setPlaybackState(updated);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PLAYBACK_UPDATE',
        payload: updateObj
      }));
    }
  };

  const playMedia = (mediaItem) => {
    sendPlaybackUpdate({
      currentMedia: mediaItem,
      isPlaying: true,
      currentTime: 0
    });
  };

  const togglePlayPause = () => {
    sendPlaybackUpdate({
      isPlaying: !playbackState.isPlaying
    });
  };

  const seekPlayback = (time) => {
    sendPlaybackUpdate({
      currentTime: time
    });
  };

  const playNextMedia = () => {
    if (!media || media.length === 0) return;
    const currentIndex = media.findIndex(m => m.id === playbackState.currentMedia?.id);
    const nextIndex = (currentIndex + 1) % media.length;
    playMedia(media[nextIndex]);
  };

  const playPrevMedia = () => {
    if (!media || media.length === 0) return;
    const currentIndex = media.findIndex(m => m.id === playbackState.currentMedia?.id);
    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    playMedia(media[prevIndex]);
  };

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
        setAlarms(prev => {
          const exists = prev.some(a => a.id === data.alarm.id);
          return exists ? prev : [...prev, data.alarm];
        });
      }
      refreshAllData();
      return data;
    } catch (err) {
      console.error('[addAlarm Error]', err);
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

  // File actions
  const deleteMedia = async (id) => {
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
    refreshAllData();
    return res.json();
  };

  const updateSettings = async (newSettings) => {
    const res = await fetch('/api/system/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    refreshAllData();
    return res.json();
  };

  return (
    <DashboardContext.Provider value={{
      alarms,
      activeAlarm,
      availableTones,
      media,
      playbackState,
      settings,
      system,
      isConnected,
      playMedia,
      togglePlayPause,
      seekPlayback,
      playNextMedia,
      playPrevMedia,
      sendPlaybackUpdate,
      addAlarm,
      toggleAlarm,
      triggerAlarmTest,
      dismissAlarm,
      snoozeAlarm,
      deleteAlarm,
      deleteMedia,
      updateSettings,
      refreshAllData,
      fetchTones
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
