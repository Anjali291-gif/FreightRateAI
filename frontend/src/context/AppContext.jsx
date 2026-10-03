import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkBackendHealth, setLiveBackend as apiSetLive } from '../services/api';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  // Navigation & layout state
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Backend connectivity state
  const [liveBackend, setLiveBackendState] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendChecking, setBackendChecking] = useState(true);
  const [backendError, setBackendError] = useState(null);

  // Notifications and toasts
  const [toasts, setToasts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Vessel fixture & chartering state
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [charterResult, setCharterResult] = useState(null);

  // Shared freight filter state
  const [route, setRoute] = useState('Australia → China');
  const [commodity, setCommodity] = useState('Iron Ore');
  const [period, setPeriod] = useState('30');

  // Shared vessel search parameters
  const [cargoQty, setCargoQty] = useState('50000');
  const [origin, setOrigin] = useState('Port Hedland');
  const [dest, setDest] = useState('Qingdao');
  const [reqDate, setReqDate] = useState('2026-10-15');

  // Theme: dark / light mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('freightai_theme') || 'light';
  });

  // Apply theme class to <html> element
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

  // Toast notifications
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // Navigation helper
  const navigate = useCallback((pg) => {
    setPage(pg);
    setSidebarOpen(false);
  }, []);

  // Backend connection check
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

  const toggleBackend = useCallback((val) => {
    apiSetLive(val);
    setLiveBackendState(val);
    toast(val ? 'Connecting to FastAPI backend' : 'Using offline demonstration mode', 'info');
  }, [toast]);

  // -------------------------------------------------------------
  // Voice Command System
  // -------------------------------------------------------------
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');

  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const voiceTimeoutRef = useRef(null);

  const updateVoiceStatus = useCallback((msg, clearDelay = 4000) => {
    setVoiceStatus(msg);
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    if (clearDelay > 0) {
      voiceTimeoutRef.current = setTimeout(() => {
        setVoiceStatus('');
      }, clearDelay);
    }
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    };
  }, []);

  // Tolerant voice command interpreter
  const processVoiceCommand = useCallback((rawText) => {
    const text = rawText.trim().toLowerCase();
    console.log('[Voice Command] Raw text:', rawText, '-> Normalized:', text);

    // 1. Dark Mode
    if (text.includes('dark')) {
      setTheme('dark');
      updateVoiceStatus('Switched to Dark Mode');
      toast('Voice Command: Switched to Dark Mode', 'success');
      return true;
    }

    // 2. Light Mode
    if (text.includes('light') || text.includes('white')) {
      setTheme('light');
      updateVoiceStatus('Switched to Light Mode');
      toast('Voice Command: Switched to Light Mode', 'success');
      return true;
    }

    // 3. Cargo Demand (or Demand) -> Navigate to Dashboard where Demand Analytics lives
    if ((text.includes('cargo') && text.includes('demand')) || text.includes('cargo demand')) {
      navigate('dashboard');
      updateVoiceStatus('Opening Cargo Demand (Dashboard)');
      toast('Voice Command: Opened Cargo Demand on Dashboard', 'success');
      return true;
    }

    // 4. Chartering Decision / AI Decision Support
    if (text.includes('charter') || text.includes('decision')) {
      navigate('decision');
      updateVoiceStatus('Opening Chartering Decision');
      toast('Voice Command: Opened AI Decision Support', 'success');
      return true;
    }

    // 5. Vessel Analytics / Vessel Selection
    if (text.includes('vessel') || text.includes('fleet') || text.includes('ship')) {
      navigate('vessels');
      updateVoiceStatus('Opening Vessel Analytics');
      toast('Voice Command: Opened Vessel Selection', 'success');
      return true;
    }

    // 6. Forecast / Freight Forecast / Rate Predictions
    if (text.includes('forecast') || text.includes('predict') || text.includes('rate')) {
      navigate('forecast');
      updateVoiceStatus('Opening Freight Forecast');
      toast('Voice Command: Opened Freight Forecast', 'success');
      return true;
    }

    // 7. Market Insights / Baltic Indices
    if (text.includes('insight') || text.includes('market') || text.includes('baltic')) {
      navigate('insights');
      updateVoiceStatus('Opening Market Insights');
      toast('Voice Command: Opened Market Insights', 'success');
      return true;
    }

    // 8. Reports / Dossiers
    if (text.includes('report') || text.includes('dossier')) {
      navigate('reports');
      updateVoiceStatus('Opening Reports');
      toast('Voice Command: Opened Reports', 'success');
      return true;
    }

    // 9. Dashboard / Home / Overview
    if (text.includes('dashboard') || text.includes('home') || text.includes('overview')) {
      navigate('dashboard');
      updateVoiceStatus('Opening Dashboard');
      toast('Voice Command: Opened Dashboard', 'success');
      return true;
    }

    // 10. General Demand
    if (text.includes('demand')) {
      navigate('dashboard');
      updateVoiceStatus('Opening Cargo Demand (Dashboard)');
      toast('Voice Command: Opened Cargo Demand', 'success');
      return true;
    }

    // 11. Refresh / Connection check
    if (text.includes('refresh') || text.includes('check') || text.includes('reconnect')) {
      checkConnection();
      updateVoiceStatus('Checking Connection');
      toast('Voice Command: Re-checking backend status', 'info');
      return true;
    }

    // Unrecognized Command
    updateVoiceStatus('Voice command not recognized', 4500);
    toast(`Voice command not recognized: "${rawText}"`, 'warning');
    return false;
  }, [navigate, setTheme, toast, checkConnection, updateVoiceStatus]);

  // Voice Command Listener
  const toggleVoiceCommands = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('Speech Recognition is not supported in this browser. Please use Chrome.', 'error');
      updateVoiceStatus('Speech recognition not supported in browser');
      return;
    }

    // If currently listening, stop immediately
    if (isListening || recognitionRef.current) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {
        console.warn('Error aborting speech recognition:', e);
      }
      recognitionRef.current = null;
      setIsListening(false);
      updateVoiceStatus('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      isProcessingRef.current = false;

      recognition.onstart = () => {
        setIsListening(true);
        updateVoiceStatus('Listening...', 0);
        toast('Listening for voice command... (e.g. "Show dashboard", "Switch to dark mode")', 'info');
      };

      recognition.onresult = (event) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        let transcriptText = '';
        if (event.results && event.results.length > 0) {
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i] && event.results[i][0]) {
              transcriptText += event.results[i][0].transcript + ' ';
            }
          }
        }
        transcriptText = transcriptText.trim();
        if (!transcriptText) return;

        setVoiceTranscript(transcriptText);
        updateVoiceStatus(`Heard: "${transcriptText}"`, 3000);

        // Execute command
        processVoiceCommand(transcriptText);
      };

      recognition.onerror = (event) => {
        console.warn('[Voice Command] Error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;
        isProcessingRef.current = false;

        if (event.error === 'no-speech') {
          updateVoiceStatus('No speech detected. Please try again.', 4000);
          toast('No speech detected. Please speak closer to your microphone.', 'warning');
        } else if (event.error === 'not-allowed') {
          updateVoiceStatus('Microphone permission blocked in browser settings.', 5000);
          toast('Microphone access blocked. Please allow mic in browser settings.', 'error');
        } else if (event.error !== 'aborted') {
          updateVoiceStatus(`Voice error: ${event.error}`, 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        isProcessingRef.current = false;
      };

      recognition.start();
    } catch (err) {
      console.error('[Voice Command] Failed to start:', err);
      setIsListening(false);
      recognitionRef.current = null;
      isProcessingRef.current = false;
      toast('Failed to initialize microphone: ' + (err.message || 'Unknown error'), 'error');
    }
  }, [isListening, toast, updateVoiceStatus, processVoiceCommand]);

  return (
    <AppCtx.Provider value={{
      page, setPage, navigate,
      activeTab: page, setActiveTab: navigate,
      sidebarOpen, setSidebarOpen,
      liveBackend, toggleBackend,
      backendOnline, backendChecking, backendError, checkConnection,
      theme, toggleTheme, setTheme,
      isListening, toggleVoiceCommands, voiceTranscript, voiceStatus, setVoiceStatus,
      toasts, toast, showToast: toast, dismissToast,
      notifOpen, setNotifOpen,
      selectedVessel, setSelectedVessel,
      isVesselModalOpen: !!selectedVessel,
      setIsVesselModalOpen: (open) => { if (!open) setSelectedVessel(null); },
      handleSelectVessel: (v) => setSelectedVessel(v),
      charterResult, setCharterResult,
      route, setRoute,
      commodity, setCommodity,
      period, setPeriod,
      cargoQty, setCargoQty,
      cargoQuantity: cargoQty, setCargoQuantity: setCargoQty,
      origin, setOrigin,
      dest, setDest,
      destination: dest, setDestination: setDest,
      reqDate, setReqDate,
      requiredDate: reqDate, setRequiredDate: setReqDate,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
