import React, { useState } from 'react';

const reportCards = [
  {
    id: 1,
    api: 'Payments API',
    score: 82,
    date: '04 mai 2026',
    duration: '12 min',
    critical: 2,
    high: 5,
    medium: 8,
    status: 'Terminé',
  },
  {
    id: 2,
    api: 'User Auth API',
    score: 56,
    date: '03 mai 2026',
    duration: '18 min',
    critical: 5,
    high: 7,
    medium: 11,
    status: 'Terminé',
  },
  {
    id: 3,
    api: 'Inventory API',
    score: 33,
    date: '02 mai 2026',
    duration: '25 min',
    critical: 10,
    high: 6,
    medium: 9,
    status: 'En cours',
  },
  {
    id: 4,
    api: 'Orders API',
    score: 71,
    date: '28 avr 2026',
    duration: '14 min',
    critical: 1,
    high: 3,
    medium: 5,
    status: 'Archivé',
  },
];

const tabs = ['Tous', 'Critiques', 'En cours', 'Archivés'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('Tous');
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('Tous');
  const [dateFilter, setDateFilter] = useState('Dernières 24h');
  const [statusFilter, setStatusFilter] = useState('Tous');

  const getRingColor = (score) => {
    if (score < 40) return { stroke: '#ff6b6b', fill: '#2c121f' };
    if (score <= 70) return { stroke: '#f2a94b', fill: '#2c2113' };
    return { stroke: '#4dc97d', fill: '#122a20' };
  };

  const filteredReports = reportCards.filter((report) => {
    const matchesSearch = report.api.toLowerCase().includes(search.toLowerCase());
    const matchesScore = scoreFilter === 'Tous' || (scoreFilter === '0-40' && report.score < 40) || (scoreFilter === '40-70' && report.score >= 40 && report.score <= 70) || (scoreFilter === '70+' && report.score > 70);
    const matchesStatus = statusFilter === 'Tous' || report.status === statusFilter;
    const matchesTab = activeTab === 'Tous' || (activeTab === 'Critiques' && report.critical > 3) || (activeTab === 'En cours' && report.status === 'En cours') || (activeTab === 'Archivés' && report.status === 'Archivé');
    return matchesSearch && matchesScore && matchesStatus && matchesTab;
  });

  return (
    <div className="reports-shell">
      <header className="reports-header">
        <div>
          <p className="eyebrow">Rapports</p>
          <h1>Historique des scans API</h1>
        </div>
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher une API, un statut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
              <option value="Tous">Score</option>
              <option value="0-40"><40</option>
              <option value="40-70">40-70</option>
              <option value="70+">70+</option>
            </select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="Dernières 24h">Dernières 24h</option>
              <option value="7 derniers jours">7 derniers jours</option>
              <option value="30 derniers jours">30 derniers jours</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="Tous">Statut</option>
              <option value="Terminé">Terminé</option>
              <option value="En cours">En cours</option>
              <option value="Archivé">Archivé</option>
            </select>
          </div>
        </div>
      </header>

      <div className="tabs-row">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="report-list">
        {filteredReports.map((report) => {
          const { stroke, fill } = getRingColor(report.score);
          const circumference = 2 * Math.PI * 28;
          const offset = circumference - (report.score / 100) * circumference;

          return (
            <article key={report.id} className="report-card">
              <div className="report-overview">
                <div className="score-ring">
                  <svg width="74" height="74" viewBox="0 0 74 74">
                    <circle cx="37" cy="37" r="28" stroke="#1b2f4f" strokeWidth="10" fill="none" />
                    <circle
                      cx="37"
                      cy="37"
                      r="28"
                      stroke={stroke}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      transform="rotate(-90 37 37)"
                    />
                  </svg>
                  <div className="score-value">
                    <strong>{report.score}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="report-meta">
                  <h2>{report.api}</h2>
                  <p>{report.date} • {report.duration}</p>
                  <div className="severity-pills">
                    <span className="pill critical">{report.critical} critique</span>
                    <span className="pill high">{report.high} élevée</span>
                    <span className="pill medium">{report.medium} moyenne</span>
                  </div>
                </div>
              </div>

              <div className="report-actions">
                <button type="button" className="ghost-button">Voir le rapport</button>
                <button type="button" className="ghost-button">Télécharger PDF</button>
                <button type="button" className="primary-button">Relancer le scan</button>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="pagination-bar">
        <button type="button">← Précédent</button>
        <span>Page 1 sur 4</span>
        <button type="button">Suivant →</button>
      </footer>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1627; color: #e8efff; }
        .reports-shell { min-height: 100vh; padding: 32px; background: #08101f; display: grid; gap: 24px; }
        .reports-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; align-items: flex-end; }
        .eyebrow { margin: 0 0 8px; color: #8da5d4; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.8rem; }
        h1 { margin: 0; font-size: 2.25rem; line-height: 1.05; }
        .search-filters { display: grid; gap: 16px; width: min(100%, 720px); }
        .search-box input { width: 100%; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); background: #121d35; color: #eef3ff; padding: 16px 18px; font-size: 1rem; }
        .search-box input::placeholder { color: #7f95b9; }
        .filter-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        select { width: 100%; appearance: none; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: #121d35; color: #eef3ff; padding: 14px 16px; font-size: 0.95rem; }
        .tabs-row { display: flex; gap: 14px; flex-wrap: wrap; }
        .tab { border: none; background: rgba(255,255,255,0.03); color: #cfd8ee; padding: 12px 20px; border-radius: 18px; cursor: pointer; transition: background 0.2s ease, color 0.2s ease; }
        .tab.active { background: rgba(24,95,165,0.24); color: #fff; }
        .report-list { display: grid; gap: 18px; }
        .report-card { display: grid; grid-template-columns: 1fr auto; gap: 20px; padding: 26px; background: #101d34; border: 1px solid rgba(255,255,255,0.06); border-radius: 26px; align-items: center; }
        .report-overview { display: flex; gap: 22px; align-items: center; }
        .score-ring { position: relative; width: 74px; height: 74px; }
        .score-value { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
        .score-value strong { display: block; font-size: 1.1rem; color: #fff; }
        .score-value span { font-size: 0.78rem; color: #94b0dc; }
        .report-meta h2 { margin: 0 0 8px; font-size: 1.15rem; }
        .report-meta p { margin: 0 0 14px; color: #9bb4d8; font-size: 0.95rem; }
        .severity-pills { display: flex; flex-wrap: wrap; gap: 10px; }
        .pill { display: inline-flex; align-items: center; padding: 8px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
        .pill.critical { background: rgba(255, 102, 102, 0.16); color: #ff9b9b; }
        .pill.high { background: rgba(245, 161, 84, 0.18); color: #ffd39c; }
        .pill.medium { background: rgba(103, 144, 205, 0.18); color: #c8d6ff; }
        .report-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end; }
        .ghost-button, .primary-button { border: none; border-radius: 16px; cursor: pointer; font-weight: 700; padding: 12px 18px; transition: transform 0.2s ease, background 0.2s ease; }
        .ghost-button { background: rgba(255,255,255,0.04); color: #d0def8; }
        .ghost-button:hover { background: rgba(255,255,255,0.08); }
        .primary-button { background: #185fa5; color: #fff; }
        .primary-button:hover { background: #1f76d2; }
        .pagination-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 0 8px; color: #95aacb; }
        .pagination-bar button { border: none; background: rgba(255,255,255,0.03); color: #d8e3ff; padding: 12px 20px; border-radius: 16px; cursor: pointer; }
        .pagination-bar button:hover { background: rgba(24,95,165,0.16); }
        @media (max-width: 900px) {
          .report-card { grid-template-columns: 1fr; }
          .report-actions { justify-content: flex-start; }
          .filter-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
