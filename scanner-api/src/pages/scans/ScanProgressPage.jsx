import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../../context/ScanContext';
import SeverityBadge from '../../components/ui/SeverityBadge';
import styles from './ScanProgressPage.module.css';

const ScanProgressPage = () => {
  const { currentScan, cancelScan, resetScan } = useScan();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentScan.id && currentScan.status !== 'pending') {
      // Si aucun scan n'est en cours, on redirige vers la création
      navigate('/scans/new');
    }
  }, [currentScan.id, currentScan.status, navigate]);

  // Si le scan est terminé, on redirige vers le rapport détaillé
  useEffect(() => {
    if (currentScan.status === 'completed') {
      navigate(`/reports/${currentScan.id}`);
    }
  }, [currentScan.status, currentScan.id, navigate]);

  const handleCancel = () => {
    cancelScan();
    resetScan();
    navigate('/dashboard');
  };

  const { url, progress = 0, findings = [], logs = [], status, errorMessage } = currentScan;

  // Calcul du temps restant approximatif (très basique)
  const remainingMin = progress < 100 ? Math.ceil((100 - progress) / 10) : 0;

  return (
    <div className="page-shell">
      {/* Header */}
      <header className={`card ${styles.header}`}>
        <div>
          <p className="eyebrow">
            {status === 'pending' ? 'Initialisation...' : 
             status === 'error' ? 'Erreur de scan' : 
             status === 'cancelled' ? 'Scan annulé' : 'Scan en cours'}
          </p>
          <h1 style={{ fontSize: '1.8rem', marginTop: 6 }}>{url || 'Chargement…'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
            Scan {currentScan.type === 'quick' ? 'rapide' : currentScan.type === 'deep' ? 'approfondi' : 'standard'}
          </p>
        </div>
        {status !== 'completed' && status !== 'error' && status !== 'cancelled' && (
          <button className="btn btn-danger" onClick={handleCancel}>✕ Annuler le scan</button>
        )}
      </header>

      {/* Message d'erreur */}
      {status === 'error' && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ color: 'var(--danger)', marginTop: 0 }}>Le scan a échoué</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{errorMessage}</p>
          <button className="btn btn-primary" onClick={() => navigate('/scans/new')} style={{ marginTop: 15 }}>
            Essayer à nouveau
          </button>
        </div>
      )}

      {/* Progress bar */}
      <section className={`card ${styles.progressPanel}`}>
        <div className={styles.progressInfo}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Progression</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '2.5rem' }}>{progress}%</h2>
          </div>
          <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
            <span>Temps restant estimé</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: 4 }}>
              {status === 'running' ? `~${remainingMin} min` : status}
            </strong>
          </div>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: status === 'error' ? 'var(--danger)' : 'var(--brand)' 
            }} 
          />
        </div>
      </section>

      {/* Findings */}
      <div className={styles.grid}>
        <section className="card" style={{ gridColumn: 'span 2' }}>
          <h2 className="section-title" style={{ marginBottom: 6 }}>Résultats en temps réel</h2>
          <p className="section-subtitle" style={{ marginBottom: 20 }}>Vulnérabilités détectées pendant l'exécution.</p>
          
          {findings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
              Aucune vulnérabilité détectée pour l'instant…
            </p>
          ) : (
            <div className={styles.findingsList}>
              {findings.map((f, i) => (
                <div key={i} className={styles.findingCard}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{f.title}</p>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{f.endpoint || 'Global'}</p>
                  </div>
                  <SeverityBadge severity={f.severity} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Terminal log */}
      <section className="card">
        <div className={styles.terminalHead}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Journal du scan</h2>
            <p className="section-subtitle">Requêtes et actions en cours de traitement.</p>
          </div>
          {status === 'running' && <span className={styles.liveTag}>🔴 Flux en direct</span>}
        </div>
        <div className={styles.terminalBody}>
          {Array.isArray(logs) ? logs.map((line, i) => (
            <p key={i} style={{ margin: 0 }}>
              <span style={{ color: 'var(--brand)' }}>$</span> {line}
            </p>
          )) : null}
          {status === 'running' && <p style={{ margin: 0, opacity: 0.4 }}>█</p>}
        </div>
      </section>
    </div>
  );
};

export default ScanProgressPage;
