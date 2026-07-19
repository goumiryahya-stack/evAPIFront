import React, { useState } from 'react';

const severityFilters = ['Tous', 'Critique', 'Élevée', 'Moyenne', 'Faible'];
const owaspFilters = ['Tous', 'API1', 'API2', 'API3', 'API4', 'API5'];
const apiFilters = ['Toutes', 'Payments API', 'User Auth API', 'Inventory API', 'Orders API'];
const statusFilters = ['Tous', 'Ouverte', 'Résolue', 'Ignorée'];

const vulnerabilities = [
  {
    id: 1,
    severity: 'Critique',
    title: 'Authentification manquante',
    endpoint: 'GET /admin/users',
    api: 'User Auth API',
    owasp: 'API2',
    status: 'Ouverte',
    date: '04 mai 2026',
    recommendation: 'Restreindre l’accès à l’endpoint /admin/users avec une authentification et une vérification de rôle.',
  },
  {
    id: 2,
    severity: 'Élevée',
    title: 'CORS trop permissif',
    endpoint: 'POST /api/v1/users',
    api: 'Payments API',
    owasp: 'API3',
    status: 'Ouverte',
    date: '03 mai 2026',
    recommendation: 'Limiter Access-Control-Allow-Origin aux domaines de confiance.',
  },
  {
    id: 3,
    severity: 'Moyenne',
    title: 'JWT mal configuré',
    endpoint: 'POST /auth/login',
    api: 'User Auth API',
    owasp: 'API5',
    status: 'Résolue',
    date: '02 mai 2026',
    recommendation: 'Valider strictement l’algorithme JWT côté serveur et utiliser une clé secrète robuste.',
  },
  {
    id: 4,
    severity: 'Faible',
    title: 'Header X-Frame-Options manquant',
    endpoint: 'GET /dashboard',
    api: 'Inventory API',
    owasp: 'API6',
    status: 'Ignorée',
    date: '28 avr 2026',
    recommendation: 'Ajouter X-Frame-Options: DENY ou SAMEORIGIN pour protéger contre le clickjacking.',
  },
];

const counts = {
  Critique: 9,
  Élevée: 14,
  Moyenne: 22,
  Faible: 8,
};

const getSeverityClass = (severity) => {
  switch (severity) {
    case 'Critique': return 'pill-critical';
    case 'Élevée': return 'pill-high';
    case 'Moyenne': return 'pill-medium';
    case 'Faible': return 'pill-low';
    default: return '';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Ouverte': return 'status-open';
    case 'Résolue': return 'status-fixed';
    case 'Ignorée': return 'status-ignored';
    default: return '';
  }
};

const Vulnerabilities = () => {
  const [activeSeverity, setActiveSeverity] = useState('Tous');
  const [activeOwasp, setActiveOwasp] = useState('Tous');
  const [activeApi, setActiveApi] = useState('Toutes');
  const [activeStatus, setActiveStatus] = useState('Tous');
  const [selectedVuln, setSelectedVuln] = useState(null);

  const filtered = vulnerabilities.filter((item) => {
    const matchesSeverity = activeSeverity === 'Tous' || item.severity === activeSeverity;
    const matchesOwasp = activeOwasp === 'Tous' || item.owasp === activeOwasp;
    const matchesApi = activeApi === 'Toutes' || item.api === activeApi;
    const matchesStatus = activeStatus === 'Tous' || item.status === activeStatus;
    return matchesSeverity && matchesOwasp && matchesApi && matchesStatus;
  });

  return (
    <div className="vuln-shell">
      <header className="vuln-header">
        <div>
          <p className="eyebrow">Vulnérabilités</p>
          <h1>Gestion des failles API</h1>
        </div>
        <button className="export-button">Export CSV</button>
      </header>

      <section className="filter-panel">
        <div className="filter-group">
          <label>Sévérité</label>
          <select value={activeSeverity} onChange={(e) => setActiveSeverity(e.target.value)}>
            {severityFilters.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Type OWASP</label>
          <select value={activeOwasp} onChange={(e) => setActiveOwasp(e.target.value)}>
            {owaspFilters.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>API</label>
          <select value={activeApi} onChange={(e) => setActiveApi(e.target.value)}>
            {apiFilters.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Statut</label>
          <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
            {statusFilters.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </section>

      <section className="counts-row">
        <div className="count-card critical">
          <span>Critique</span>
          <strong>{counts.Critique}</strong>
        </div>
        <div className="count-card high">
          <span>Élevée</span>
          <strong>{counts.Élevée}</strong>
        </div>
        <div className="count-card medium">
          <span>Moyenne</span>
          <strong>{counts.Moyenne}</strong>
        </div>
        <div className="count-card low">
          <span>Faible</span>
          <strong>{counts.Faible}</strong>
        </div>
      </section>

      <div className="table-drawer-layout">
        <section className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Sévérité</th>
                <th>Vulnérabilité</th>
                <th>API / Endpoint</th>
                <th>Type OWASP</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => setSelectedVuln(item)}>
                  <td><span className={`pill ${getSeverityClass(item.severity)}`}>{item.severity}</span></td>
                  <td>{item.title}</td>
                  <td>{item.api} / {item.endpoint}</td>
                  <td>{item.owasp}</td>
                  <td><span className={`status-pill ${getStatusClass(item.status)}`}>{item.status}</span></td>
                  <td>{item.date}</td>
                  <td className="actions-cell">
                    <button type="button">Voir détail</button>
                    <button type="button">Résolue</button>
                    <button type="button">Ignorer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {selectedVuln && (
          <aside className="drawer-panel">
            <div className="drawer-header">
              <div>
                <p className={`pill ${getSeverityClass(selectedVuln.severity)}`}>{selectedVuln.severity}</p>
                <h2>{selectedVuln.title}</h2>
                <p>{selectedVuln.api} • {selectedVuln.endpoint}</p>
              </div>
              <button type="button" className="close-button" onClick={() => setSelectedVuln(null)}>×</button>
            </div>
            <div className="drawer-body">
              <div className="drawer-row">
                <span>Type OWASP</span>
                <strong>{selectedVuln.owasp}</strong>
              </div>
              <div className="drawer-row">
                <span>Statut</span>
                <strong>{selectedVuln.status}</strong>
              </div>
              <div className="drawer-row">
                <span>Date de détection</span>
                <strong>{selectedVuln.date}</strong>
              </div>
              <div className="drawer-block">
                <h3>Recommandation</h3>
                <p>{selectedVuln.recommendation}</p>
              </div>
              <div className="drawer-block">
                <h3>Description</h3>
                <p>Analyse détaillée de la vulnérabilité et de son impact sur l’API.</p>
              </div>
            </div>
          </aside>
        )}
      </div>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a1222; color: #e7efff; }
        .vuln-shell { min-height: 100vh; padding: 32px; background: #08101f; display: grid; gap: 24px; }
        .vuln-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .eyebrow { margin: 0 0 8px; color: #8da4d5; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.8rem; }
        h1 { margin: 0; font-size: 2.1rem; }
        .export-button { border: none; padding: 14px 22px; background: rgba(24,95,165,0.16); color: #c9dffe; border-radius: 18px; cursor: pointer; font-weight: 700; }
        .filter-panel { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; padding: 22px 24px; background: #101d34; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; }
        .filter-group { display: grid; gap: 8px; }
        .filter-group label { color: #a7b9d6; font-weight: 600; }
        select { width: 100%; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: #0f1a30; color: #eef3ff; padding: 14px 16px; font-size: 0.95rem; }
        .counts-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .count-card { padding: 20px 24px; border-radius: 22px; background: #101f38; border: 1px solid rgba(255,255,255,0.06); display: grid; gap: 10px; }
        .count-card span { color: #9abbda; text-transform: uppercase; font-size: 0.82rem; letter-spacing: 0.08em; }
        .count-card strong { font-size: 1.9rem; color: #fff; }
        .count-card.critical { border-color: rgba(255, 86, 86, 0.2); }
        .count-card.high { border-color: rgba(245, 167, 71, 0.2); }
        .count-card.medium { border-color: rgba(102, 147, 232, 0.2); }
        .count-card.low { border-color: rgba(96, 174, 129, 0.2); }
        .table-drawer-layout { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 20px; }
        .table-panel { background: #101f36; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 16px 18px; text-align: left; color: #d5e0ff; border-bottom: 1px solid rgba(255,255,255,0.06); }
        th { color: #8da4cb; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
        tbody tr { cursor: pointer; transition: background 0.2s ease; }
        tbody tr:hover { background: rgba(255,255,255,0.04); }
        .pill { display: inline-flex; padding: 8px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
        .pill-critical { background: rgba(255, 85, 85, 0.18); color: #ff9a9a; }
        .pill-high { background: rgba(248, 165, 78, 0.18); color: #ffd29e; }
        .pill-medium { background: rgba(108, 147, 225, 0.16); color: #d4e2ff; }
        .pill-low { background: rgba(97, 183, 137, 0.16); color: #bde6c7; }
        .status-pill { display: inline-flex; padding: 8px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; }
        .status-open { background: rgba(255, 85, 85, 0.12); color: #ff9a9a; }
        .status-fixed { background: rgba(84, 214, 132, 0.14); color: #b8f4c9; }
        .status-ignored { background: rgba(140, 145, 166, 0.16); color: #c4c9e2; }
        .actions-cell button { margin-right: 8px; border: none; background: rgba(255,255,255,0.05); color: #d4e4ff; padding: 8px 12px; border-radius: 14px; cursor: pointer; }
        .actions-cell button:last-child { margin-right: 0; }
        .drawer-panel { background: #101e36; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 24px; display: grid; gap: 20px; }
        .drawer-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .drawer-header h2 { margin: 0; font-size: 1.15rem; }
        .close-button { border: none; background: rgba(255,255,255,0.04); color: #dbe4ff; width: 40px; height: 40px; border-radius: 14px; cursor: pointer; font-size: 1.5rem; line-height: 1; }
        .drawer-body { display: grid; gap: 18px; }
        .drawer-row { display: grid; grid-template-columns: 1fr auto; gap: 20px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .drawer-row span { color: #8fabc9; }
        .drawer-row strong { color: #eef5ff; }
        .drawer-block { padding: 18px; border-radius: 18px; background: rgba(24,95,165,0.12); border: 1px solid rgba(24,95,165,0.2); }
        .drawer-block h3 { margin: 0 0 10px; font-size: 1rem; }
        .drawer-block p { margin: 0; color: #dbe5ff; line-height: 1.7; }
        @media (max-width: 1080px) { .table-drawer-layout { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { .filter-panel { grid-template-columns: 1fr; } .counts-row { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
};

export default Vulnerabilities;
