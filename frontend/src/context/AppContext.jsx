import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, setLiveBackend as apiSetLive } from '../services/api';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveBackend, setLiveBackendState] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendChecking, setBackendChecking] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [charterResult, setCharterResult] = useState(null);

  // Theme: dark / light mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('freightai_theme') || 'light';
  });

  // Voice command state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Shared freight filter state
  const [route, setRoute] = useState('Australia → China');
  const [commodity, setCommodity] = useState('Iron Ore');
  const [period, setPeriod] = useState('30');

  // Shared vessel search parameters
  const [cargoQty, setCargoQty] = useState('50000');
  const [origin, setOrigin] = useState('Port Hedland');
  const [dest, setDest] = useState('Qingdao');
  const [reqDate, setReqDate] = useState('2026-10-15');

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('freightai_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const checkConnection = useCallback(async () => {
    setBackendChecking(true);
    const health = await checkBackendHealth();
    setBackendOnline(health.online);
    setBackendError(health.online ? null : (health.error || 'Backend not responding'));
    setBackendChecking(false);
    return health.online;
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const navigate = useCallback((pg) => {
    setPage(pg);
    setSidebarOpen(false);
  }, []);

  const toggleBackend = useCallback((val) => {
    apiSetLive(val);
    setLiveBackendState(val);
    toast(val ? 'Connecting to FastAPI backend' : 'Using offline demonstration mode', 'info');
  }, [toast]);

  // Voice Command Listener
  const toggleVoiceCommands = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('Speech Recognition is not supported by your browser.', 'error');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening for voice command... (e.g. "Forecast", "Dashboard", "Vessels", "Dark Mode")', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceTranscript(transcript);
        toast(`Voice command: "${transcript}"`, 'success');

        if (transcript.includes('dashboard')) {
          navigate('dashboard');
        } else if (transcript.includes('forecast') || transcript.includes('predict')) {
          navigate('forecast');
        } else if (transcript.includes('vessel') || transcript.includes('ship')) {
          navigate('vessels');
        } else if (transcript.includes('decision') || transcript.includes('charter')) {
          navigate('decision');
        } else if (transcript.includes('insight') || transcript.includes('market')) {
          navigate('insights');
        } else if (transcript.includes('report')) {
          navigate('reports');
        } else if (transcript.includes('dark')) {
          setTheme('dark');
        } else if (transcript.includes('light')) {
          setTheme('light');
        } else if (transcript.includes('refresh') || transcript.includes('check')) {
          checkConnection();
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice command init failed:', err);
      setIsListening(false);
    }
  }, [isListening, navigate, toast, checkConnection]);

  return (
    <AppCtx.Provider value={{
      page, navigate,
      sidebarOpen, setSidebarOpen,
      liveBackend, toggleBackend,
      backendOnline, backendChecking, backendError, checkConnection,
      theme, toggleTheme,
      isListening, toggleVoiceCommands, voiceTranscript,
      toasts, toast, dismissToast,
      notifOpen, setNotifOpen,
      selectedVessel, setSelectedVessel,
      charterResult, setCharterResult,
      route, setRoute,
      commodity, setCommodity,
      period, setPeriod,
      cargoQty, setCargoQty,
      origin, setOrigin,
      dest, setDest,
      reqDate, setReqDate,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
