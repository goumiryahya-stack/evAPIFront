import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../../context/ScanContext';
import SeverityBadge from '../../components/ui/SeverityBadge';
import styles from './NewScanPage.module.css';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const scanTypes = [
  { key: 'quick',    label: 'Scan rapide',    duration: '~2 min',  description: 'Vérifications essentielles de sécurité.' },
  { key: 'standard', label: 'Scan standard',  duration: '~10 min', description: 'OWASP Top 10 complet et analyse des headers.' },
  { key: 'deep',     label: 'Scan approfondi',duration: '~30 min', description: 'Fuzzing + injection + replay des requêtes.' },
];

const checks = [
  { label: 'HTTPS obligatoire',     severity: 'Critique' },
  { label: 'En-têtes de sécurité',  severity: 'Élevée'   },
  { label: 'CORS',                  severity: 'Moyenne'  },
  { label: 'Authentification',      severity: 'Critique' },
  { label: 'Rate limiting',         severity: 'Élevée'   },
  { label: 'Injection SQL',         severity: 'Critique' },
  { label: 'JWT mal configuré',     severity: 'Élevée'   },
  { label: 'Exposition de données', severity: 'Moyenne'  },
  { label: 'SSRF',                  severity: 'Élevée'   },
  { label: 'BOLA',                  severity: 'Critique' },
];

const NewScanPage = () => {
  const [url, setUrl] = useState('');
  const [selectedType, setSelectedType] = useState('standard');
  const [selectedChecks, setSelectedChecks] = useState(checks.map((c) => c.label));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advanced, setAdvanced] = useState({ delay: '250', timeout: '30', userAgent: '' });
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef(null);
  const { startScan } = useScan();
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg('Import en cours…');
    const token = localStorage.getItem('access_token');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/files/upload-spec`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Échec import');
      setUploadMsg(`Fichier importé : ${data.filename}`);
    } catch (err) {
      setUploadMsg(err.message);
    }
    e.target.value = '';
  };

  const toggleCheck = (label) => {
    setSelectedChecks((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    startScan({ url, type: selectedType, checks: selectedChecks });
    navigate('/scans/progress');
  };

  return (
    <div className="page-shell">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Nouveau scan</p>
          <h1>Lancer une analyse de votre API</h1>
          <p className={styles.subtitle}>Entrez l'URL ou importez votre spécification OpenAPI/Swagger pour démarrer.</p>
        </div>
        <button className="btn btn-ghost">Aide & documentation</button>
      </header>

      {/* Form */}
      <form className={`card card-lg ${styles.form}`} onSubmit={handleSubmit}>
        {/* URL */}
        <div className={styles.formGroup}>
          <label htmlFor="api-url" className="form-label" style={{ fontSize: '1rem', fontWeight: 700 }}>
            URL de l'API cible
          </label>
          <input
            id="api-url"
            className="input"
            type="url"
            placeholder="https://api.monsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ fontSize: '1.05rem', padding: '18px 20px' }}
            required
          />
        </div>

        {/* File import */}
        <div className={styles.importPanel}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Importer OpenAPI / Swagger</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>JSON ou YAML accepté</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".json,.yaml,.yml" hidden onChange={handleFileUpload} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
            📎 Importer un fichier
          </button>
          {uploadMsg && <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{uploadMsg}</p>}
        </div>

        {/* Scan type */}
        <div className={styles.section}>
          <h2 className="section-title">Type de scan</h2>
          <p className="section-subtitle">Choisissez la portée et la profondeur de l'analyse.</p>
          <div className={styles.scanTypeGrid}>
            {scanTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                className={`${styles.scanCard} ${selectedType === type.key ? styles.active : ''}`}
                onClick={() => setSelectedType(type.key)}
              >
                <div>
                  <p className={styles.scanLabel}>{type.label}</p>
                  <p className={styles.scanDuration}>{type.duration}</p>
                </div>
                <p className={styles.scanDesc}>{type.description}</p>
                {selectedType === type.key && <span className={styles.checkMark}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Checks */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className="section-title">Vérifications</h2>
              <p className="section-subtitle">Sélectionnez les contrôles à inclure dans le scan.</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() =>
              setSelectedChecks(selectedChecks.length === checks.length ? [] : checks.map((c) => c.label))
            }>
              {selectedChecks.length === checks.length ? 'Désélectionner tout' : 'Tout sélectionner'}
            </button>
          </div>
          <div className={styles.checksGrid}>
            {checks.map((check) => (
              <label
                key={check.label}
                className={`${styles.checkCard} ${selectedChecks.includes(check.label) ? styles.checkActive : ''}`}
              >
                <div className={styles.checkMeta}>
                  <span style={{ fontWeight: 600 }}>{check.label}</span>
                  <SeverityBadge severity={check.severity} />
                </div>
                <input
                  type="checkbox"
                  checked={selectedChecks.includes(check.label)}
                  onChange={() => toggleCheck(check.label)}
                  style={{ accentColor: 'var(--brand)', width: 18, height: 18 }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Advanced */}
        <div className={styles.advancedPanel}>
          <button type="button" className={styles.advancedToggle} onClick={() => setAdvancedOpen(!advancedOpen)}>
            <span>⚙ Options avancées</span>
            <span>{advancedOpen ? '−' : '+'}</span>
          </button>
          {advancedOpen && (
            <div className={styles.advancedContent}>
              <label className="form-label">
                Délai entre requêtes (ms)
                <input className="input" type="text" placeholder="250" value={advanced.delay}
                  onChange={(e) => setAdvanced((a) => ({ ...a, delay: e.target.value }))} />
              </label>
              <label className="form-label">
                Timeout (s)
                <input className="input" type="text" placeholder="30" value={advanced.timeout}
                  onChange={(e) => setAdvanced((a) => ({ ...a, timeout: e.target.value }))} />
              </label>
              <label className="form-label" style={{ gridColumn: 'span 2' }}>
                User-Agent personnalisé
                <input className="input" type="text" placeholder="Mozilla/5.0 (API Scanner)" value={advanced.userAgent}
                  onChange={(e) => setAdvanced((a) => ({ ...a, userAgent: e.target.value }))} />
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Annuler</button>
          <button type="submit" className="btn btn-primary btn-lg">🚀 Lancer le scan</button>
        </div>
      </form>
    </div>
  );
};

export default NewScanPage;
