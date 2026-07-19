import React, { useState } from 'react';

const scanTypes = [
  {
    label: 'Scan rapide',
    duration: '2 min',
    description: 'Vérifications essentielles',
    key: 'quick',
  },
  {
    label: 'Scan standard',
    duration: '10 min',
    description: 'OWASP Top 10 complet',
    key: 'standard',
  },
  {
    label: 'Scan approfondi',
    duration: '30 min',
    description: 'Fuzzing + injection + replay',
    key: 'deep',
  },
];

const checks = [
  { label: 'HTTPS obligatoire', severity: 'Critique', color: 'severityCritical' },
  { label: 'En-têtes de sécurité', severity: 'Élevée', color: 'severityHigh' },
  { label: 'CORS', severity: 'Moyenne', color: 'severityMedium' },
  { label: 'Authentification', severity: 'Critique', color: 'severityCritical' },
  { label: 'Rate limiting', severity: 'Élevée', color: 'severityHigh' },
  { label: 'Injection SQL', severity: 'Critique', color: 'severityCritical' },
  { label: 'JWT mal configuré', severity: 'Élevée', color: 'severityHigh' },
  { label: 'Exposition de données', severity: 'Moyenne', color: 'severityMedium' },
  { label: 'SSRF', severity: 'Élevée', color: 'severityHigh' },
  { label: 'BOLA', severity: 'Critique', color: 'severityCritical' },
];

const NewScan = () => {
  const [selectedScan, setSelectedScan] = useState('standard');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="newscan-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Nouveau scan</p>
          <h1>Lancer une analyse de votre API</h1>
          <p className="subtitle">Entrez l’URL ou importez votre spécification OpenAPI/Swagger pour démarrer.</p>
        </div>
        <button className="secondary-button">Aide & documentation</button>
      </header>

      <section className="form-panel">
        <div className="form-group large-input">
          <label htmlFor="api-url">URL de l’API</label>
          <input id="api-url" type="text" placeholder="https://api.monsite.com" />
        </div>

        <div className="file-import-panel">
          <div>
            <p className="label">Importer OpenAPI / Swagger</p>
            <p className="hint">JSON ou YAML</p>
          </div>
          <button className="upload-button">Importer un fichier</button>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <div>
              <h2>Type de scan</h2>
              <p className="section-subtitle">Choisissez la portée et la profondeur de l’analyse.</p>
            </div>
          </div>

          <div className="scan-type-grid">
            {scanTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                className={selectedScan === type.key ? 'scan-card active' : 'scan-card'}
                onClick={() => setSelectedScan(type.key)}
              >
                <div>
                  <p className="scan-label">{type.label}</p>
                  <p className="scan-meta">{type.duration}</p>
                </div>
                <p className="scan-description">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <div>
              <h2>Vérifications</h2>
              <p className="section-subtitle">Sélectionnez les contrôles à inclure dans le scan.</p>
            </div>
          </div>

          <div className="checks-grid">
            {checks.map((check) => (
              <label key={check.label} className="check-card">
                <div className="check-meta">
                  <span>{check.label}</span>
                  <span className={`severity-pill ${check.color}`}>{check.severity}</span>
                </div>
                <input type="checkbox" defaultChecked />
              </label>
            ))}
          </div>
        </div>

        <div className="section-block advanced-panel">
          <button type="button" className="advanced-toggle" onClick={() => setAdvancedOpen(!advancedOpen)}>
            <span>Options avancées</span>
            <span>{advancedOpen ? '−' : '+'}</span>
          </button>

          {advancedOpen && (
            <div className="advanced-content">
              <div className="form-row">
                <label htmlFor="request-delay">Délai entre requêtes</label>
                <input id="request-delay" type="text" placeholder="250 ms" />
              </div>
              <div className="form-row">
                <label htmlFor="timeout">Timeout</label>
                <input id="timeout" type="text" placeholder="30 s" />
              </div>
              <div className="form-row full-width">
                <label htmlFor="user-agent">User-Agent personnalisé</label>
                <input id="user-agent" type="text" placeholder="Mozilla/5.0 (API Scanner)" />
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="primary-button">Lancer le scan</button>
        </div>
      </section>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0e1726; color: #e8efff; }
        .newscan-shell { min-height: 100vh; padding: 32px; background: #0a1220; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 30px; }
        .eyebrow { margin: 0 0 12px; color: #8ea7cf; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.82rem; }
        h1 { margin: 0; font-size: 2.4rem; line-height: 1.05; letter-spacing: -0.02em; }
        .subtitle { margin: 14px 0 0; color: #b6c7e5; max-width: 620px; }
        .secondary-button, .primary-button, .upload-button { border: none; cursor: pointer; border-radius: 16px; font-weight: 700; }
        .secondary-button { padding: 14px 20px; background: rgba(24,95,165,0.16); color: #c9dffe; }
        .form-panel { background: #111a2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; padding: 32px; display: grid; gap: 28px; }
        .form-group.large-input { display: grid; gap: 12px; }
        label { font-size: 0.95rem; font-weight: 600; color: #d8e2f8; }
        input[type='text'] { width: 100%; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); background: #0f1a31; color: #eef3ff; padding: 18px 20px; font-size: 1rem; outline: none; }
        input[type='text']::placeholder { color: #7b8ea9; }
        .file-import-panel { display: flex; align-items: center; justify-content: space-between; gap: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 22px 26px; }
        .label { margin: 0; font-size: 0.98rem; color: #eef3ff; font-weight: 700; }
        .hint { margin: 6px 0 0; color: #90a9d0; font-size: 0.9rem; }
        .upload-button { padding: 14px 22px; background: rgba(24,95,165,0.16); color: #c9dffe; }
        .section-block { display: grid; gap: 18px; }
        .section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .section-heading h2 { margin: 0; font-size: 1.1rem; }
        .section-subtitle { margin: 6px 0 0; color: #9fb7db; font-size: 0.95rem; }
        .scan-type-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .scan-card { display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); border-radius: 22px; padding: 24px; text-align: left; color: #eef3ff; transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease; }
        .scan-card:hover { transform: translateY(-2px); border-color: rgba(24,95,165,0.35); }
        .scan-card.active { border-color: #185fa5; background: rgba(24,95,165,0.18); }
        .scan-label { margin: 0; font-size: 1rem; font-weight: 700; }
        .scan-meta { margin: 8px 0 0; color: #8ea7cf; font-size: 0.92rem; }
        .scan-description { margin: 14px 0 0; color: #cbd4ec; font-size: 0.95rem; line-height: 1.5; }
        .checks-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .check-card { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 20px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); cursor: pointer; transition: background 0.2s ease, border-color 0.2s ease; }
        .check-card:hover { background: rgba(24,95,165,0.12); border-color: rgba(24,95,165,0.28); }
        .check-meta { display: grid; gap: 8px; }
        .severity-pill { display: inline-flex; padding: 6px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .severityCritical { background: rgba(222, 102, 102, 0.18); color: #ff9b9b; }
        .severityHigh { background: rgba(235, 168, 89, 0.18); color: #ffd28f; }
        .severityMedium { background: rgba(101, 146, 217, 0.18); color: #b9d3ff; }
        .severityLow { background: rgba(100, 193, 154, 0.18); color: #ade8c7; }
        .advanced-panel { border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; background: rgba(255,255,255,0.02); }
        .advanced-toggle { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: transparent; color: #eef3ff; font-size: 1rem; font-weight: 700; border: none; cursor: pointer; }
        .advanced-content { display: grid; gap: 16px; padding: 0 24px 24px; }
        .form-row { display: grid; gap: 10px; }
        .form-row.full-width { grid-column: span 2; }
        .form-actions { display: flex; justify-content: flex-end; }
        .primary-button { padding: 16px 30px; background: #185fa5; color: #fff; box-shadow: 0 18px 40px rgba(24,95,165,0.16); }
        .primary-button:hover { background: #1f75cf; }
        @media (max-width: 1024px) {
          .scan-type-grid { grid-template-columns: 1fr; }
          .checks-grid { grid-template-columns: 1fr; }
          .form-row.full-width { grid-column: auto; }
        }
        @media (max-width: 760px) {
          .page-header { flex-direction: column; align-items: stretch; }
          .newscan-shell { padding: 20px; }
        }
      `}</style>
    </div>
  );
};

export default NewScan;
