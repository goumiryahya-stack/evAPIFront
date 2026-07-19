import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';

const ScanContext = createContext(null);

const INITIAL_SCAN = {
  id: null,
  url: '',
  type: 'standard',
  status: 'idle', // idle | pending | running | completed | cancelled | error
  progress: 0,
  score: null,
  findings: [], // Chargé à la complétion
  logs: [], 
  errorMessage: null,
};

export const ScanProvider = ({ children }) => {
  const [currentScan, setCurrentScan] = useState(INITIAL_SCAN);
  const [scanHistory, setScanHistory] = useState([]);
  
  const pollingInterval = useRef(null);

  // ── Helpers de Polling ──────────────────────────────────────────────────
  
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (scanId) => {
    try {
      const data = await apiFetch(`/scans/${scanId}/status`);
      
      setCurrentScan(prev => {
        // Ne met à jour que si on suit toujours ce scan précis
        if (prev.id !== scanId) return prev;
        
        const isDone = ['completed', 'cancelled', 'error'].includes(data.status);
        if (isDone) stopPolling();

        return {
          ...prev,
          status: data.status,
          progress: data.progress,
          score: data.score,
          errorMessage: data.error_message,
          logs: data.logs?.length ? data.logs : prev.logs,
        };
      });
      
      // Si terminé avec succès, on récupère les vulnérabilités détectées
      if (data.status === 'completed') {
        const fullData = await apiFetch(`/scans/${scanId}`).catch(() => null);
        if (fullData) {
           setCurrentScan(prev => ({
             ...prev,
             findings: fullData.vulnerabilities || [],
             score: fullData.score
           }));
        }
      }

    } catch (err) {
      console.error("Erreur lors du polling :", err);
    }
  }, [stopPolling]);

  const startPolling = useCallback((scanId) => {
    stopPolling();
    // Premier appel immédiat, puis toutes les 2.5 secondes
    pollStatus(scanId);
    pollingInterval.current = setInterval(() => pollStatus(scanId), 2500);
  }, [pollStatus, stopPolling]);

  // Nettoyage au démontage du composant
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ── Actions ──────────────────────────────────────────────────────────────
  
  const startScan = useCallback(async ({ url, type, checks }) => {
    try {
      setCurrentScan({
        ...INITIAL_SCAN,
        url,
        type,
        status: 'pending',
        logs: ['Initialisation du scan sur le serveur...'],
      });

      // Appel API FastAPI
      const data = await apiFetch('/scans', {
        method: 'POST',
        body: { target_url: url, scan_type: type, selected_checks: checks }
      });

      setCurrentScan(prev => ({ ...prev, id: data.id }));
      startPolling(data.id);
      
      return data.id;
    } catch (error) {
      console.error("Échec du lancement du scan :", error);
      setCurrentScan(prev => ({ ...prev, status: 'error', errorMessage: error.message }));
      throw error;
    }
  }, [startPolling]);

  const cancelScan = useCallback(async () => {
    if (!currentScan.id) return;
    try {
      await apiFetch(`/scans/${currentScan.id}`, { method: 'DELETE' });
      setCurrentScan((prev) => ({ ...prev, status: 'cancelled' }));
      stopPolling();
    } catch (error) {
      console.error("Échec de l'annulation du scan :", error);
    }
  }, [currentScan.id, stopPolling]);

  const resetScan = useCallback(() => {
    stopPolling();
    setCurrentScan(INITIAL_SCAN);
  }, [stopPolling]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await apiFetch('/scans');
      setScanHistory(data);
    } catch (error) {
      console.error("Impossible de récupérer l'historique :", error);
    }
  }, []);

  return (
    <ScanContext.Provider value={{
      currentScan,
      scanHistory,
      startScan,
      cancelScan,
      resetScan,
      fetchHistory,
    }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan doit être utilisé dans ScanProvider');
  return ctx;
};

export default ScanContext;
