import React from 'react';

const scanSteps = [
  { label: 'Découverte des endpoints', status: 'done' },
  { label: 'Vérification HTTPS', status: 'done' },
  { label: 'Analyse des en-têtes', status: 'done' },
  { label: 'Test d’authentification', status: 'active' },
  { label: 'Test CORS', status: 'pending' },
  { label: 'Fuzzing des paramètres', status: 'pending' },
  { label: 'Analyse JWT', status: 'pending' },
  { label: 'Génération du rapport', status: 'pending' },
];

const liveFindings = [
  { title: 'Injection SQL possible', severity: 'Critique', endpoint: '/orders' },
  { title: 'CORS trop permissif', severity: 'Élevée', endpoint: '/api/v1/users' },
  { title: 'JWT mal configuré', severity: 'Moyenne', endpoint: '/auth/login' },
];

const terminalLogs = [
  'Connexion à https://api.monsite.com...',
  'Endpoint /users détecté',
  'HTTPS vérifié pour /orders',
  'Header X-Frame-Options vérifié',
  'Test d’authentification en cours...',
  'Requête POST /auth/login envoyée',
];

const ScanInProgress = () => {
  return (
    <div className="scan-shell">
      <header className="scan-header">
        <div>
          <p className="label">Scan en cours</p>
          <h1>https://api.monsite.com</h1>
          <p className="subtext">Scan approfondi — fuzzing + injection + replay</p>
        </div>
        <button className="cancel-button">Annuler</button>
      </header>

      <section className="progress-panel">
        <div className="progress-info">
          <div>
            <p className="progress-label">Progression</p>
            <h2>67%</h2>
          </div>
          <div className="progress-meta">
            <span>Temps restant estimé</span>
            <strong>12 min</strong>
          </div>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: '67%' }} />
        </div>
      </section>

      <div className="scan-grid">
        <section className="steps-panel">
          <div className="panel-heading">
            <h2>Étapes du scan</h2>
            <p>Suivez l’avancement des vérifications principales.</p>
          </div>
          <div className="steps-list">
            {scanSteps.map((step) => (
              <div key={step.label} className={`step-item ${step.status}`}>
                <div className="step-dot" />
                <div>
                  <p>{step.label}</p>
                  <span>{step.status === 'done' ? 'Terminé' : step.status === 'active' ? 'En cours' : 'En attente'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="live-panel">
          <div className="panel-heading">
            <h2>Résultats en temps réel</h2>
            <p>Vulnérabilités détectées pendant l’exécution.</p>
          </div>
          <div className="findings-list">
            {liveFindings.map((finding) => (
              <div key={finding.title} className="finding-card">
                <div>
                  <h3>{finding.title}</h3>
                  <p>{finding.endpoint}</p>
                </div>
                <span className={`severity-pill ${finding.severity.toLowerCase()}`}>{finding.severity}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="terminal-panel">
        <div className="panel-heading terminal-header">
          <div>
            <h2>Journal du scan</h2>
            <p>Requêtes et actions en cours de traitement.</p>
          </div>
          <span className="terminal-status">Flux en direct</span>
        </div>
        <div className="terminal-body">
          {terminalLogs.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </section>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0c1322; color: #e9efff; }
        .scan-shell { min-height: 100vh; padding: 32px; background: #08101f; display: grid; gap: 24px; }
        .scan-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 28px 32px; background: #101b30; border: 1px solid rgba(255,255,255,0.06); border-radius: 26px; }
        .label { margin: 0 0 10px; color: #8fa8d4; font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase; }
        h1 { margin: 0; font-size: 2rem; line-height: 1.05; }
        .subtext { margin: 10px 0 0; color: #b7c7e7; }
        .cancel-button { border: none; padding: 14px 22px; background: rgba(255, 64, 64, 0.14); color: #ff9a9a; font-weight: 700; border-radius: 16px; cursor: pointer; transition: background 0.2s ease; }
        .cancel-button:hover { background: rgba(255, 64, 64, 0.24); }
        .progress-panel { padding: 26px 30px; background: #0f182e; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: grid; gap: 20px; }
        .progress-info { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
        .progress-label { margin: 0 0 6px; color: #8ea7cf; font-size: 0.94rem; }
        .progress-info h2 { margin: 0; font-size: 2.5rem; }
        .progress-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; color: #b7c7e7; }
        .progress-meta strong { color: #fff; }
        .progress-bar-wrap { height: 16px; background: rgba(255,255,255,0.05); border-radius: 999px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #185fa5, #58a8ff); transition: width 0.4s ease; }
        .scan-grid { display: grid; grid-template-columns: 1.35fr 0.9fr; gap: 20px; }
        .steps-panel, .live-panel { background: #101b30; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 24px; }
        .panel-heading { display: grid; gap: 6px; margin-bottom: 20px; }
        .panel-heading h2 { margin: 0; font-size: 1.15rem; }
        .panel-heading p { margin: 0; color: #9cb2da; font-size: 0.95rem; }
        .steps-list { display: grid; gap: 14px; }
        .step-item { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
        .step-item.done { border-color: rgba(68, 192, 111, 0.2); }
        .step-item.active { border-color: rgba(24, 95, 165, 0.3); background: rgba(24, 95, 165, 0.12); }
        .step-item.pending { opacity: 0.75; }
        .step-dot { width: 12px; height: 12px; border-radius: 50%; background: #5b667f; box-shadow: inset 0 0 0 2px #1f2e4c; }
        .step-item.done .step-dot { background: #4ce07d; box-shadow: 0 0 0 6px rgba(76, 224, 125, 0.15); }
        .step-item.active .step-dot { background: #7cb9ff; animation: pulse 1.8s ease-in-out infinite; box-shadow: 0 0 0 6px rgba(28, 126, 255, 0.15); }
        .step-item p { margin: 0; font-weight: 600; }
        .step-item span { color: #9bb5d8; font-size: 0.92rem; }
        .live-panel .findings-list { display: grid; gap: 16px; }
        .finding-card { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 18px 20px; border-radius: 18px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
        .finding-card h3 { margin: 0 0 6px; font-size: 1rem; }
        .finding-card p { margin: 0; color: #9fb5da; font-size: 0.9rem; }
        .severity-pill { padding: 8px 14px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
        .severity-pill.critique { background: rgba(255, 87, 87, 0.16); color: #ff9b9b; }
        .severity-pill.élevée { background: rgba(255, 163, 79, 0.18); color: #ffd59b; }
        .severity-pill.moyenne { background: rgba(114, 142, 212, 0.18); color: #c8d6ff; }
        .terminal-panel { background: #0f182f; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 24px; }
        .terminal-header { align-items: center; gap: 12px; }
        .terminal-status { color: #78c6ff; font-size: 0.9rem; font-weight: 700; background: rgba(39, 110, 202, 0.12); padding: 8px 12px; border-radius: 999px; }
        .terminal-body { margin-top: 18px; display: grid; gap: 8px; padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); font-family: 'Source Code Pro', monospace; font-size: 0.92rem; color: #c7d2f5; max-height: 240px; overflow-y: auto; }
        .terminal-body p { margin: 0; }
        @keyframes pulse { 0% { transform: scale(0.96); opacity: 0.8; } 50% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(0.96); opacity: 0.8; } }
        @media (max-width: 1080px) {
          .scan-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .scan-header { flex-direction: column; align-items: stretch; }
          .progress-info { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  );
};

export default ScanInProgress;
