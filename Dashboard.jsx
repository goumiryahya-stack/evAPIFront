import React from 'react';

const sidebarNav = [
  { label: 'Dashboard', active: true },
  { label: 'Nouveau scan' },
  { label: 'Rapports' },
  { label: 'Vulnérabilités' },
  { label: 'Paramètres' },
];

const recentScans = [
  { api: 'Payments API', score: 92, status: 'Succès', date: '03 mai 2026' },
  { api: 'User Auth API', score: 64, status: 'Attention', date: '02 mai 2026' },
  { api: 'Inventory API', score: 48, status: 'Critique', date: '01 mai 2026' },
  { api: 'Orders API', score: 78, status: 'Succès', date: '28 avr 2026' },
];

const vulnerabilityTypes = [
  { label: 'Auth manquante', value: 72 },
  { label: 'CORS', value: 54 },
  { label: 'Injection', value: 43 },
  { label: 'Rate limit', value: 32 },
  { label: 'HTTPS', value: 21 },
];

const activityFeed = [
  { message: 'Scan sur Payments API terminé avec succès.', time: 'Il y a 12 min' },
  { message: 'Nouvelle vulnérabilité détectée sur User Auth API.', time: 'Il y a 45 min' },
  { message: 'Rapport terminé pour Inventory API.', time: 'Aujourd’hui, 09:24' },
  { message: '24 APIs surveillées activées.', time: 'Hier' },
];

const scorePill = (score) => {
  if (score >= 75) return 'pillGreen';
  if (score >= 50) return 'pillOrange';
  return 'pillRed';
};

const Dashboard = () => {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-title">EvAPI</div>
            <div className="brand-subtitle">Security SaaS</div>
          </div>
        </div>

        <nav className="nav-menu">
          {sidebarNav.map((item) => (
            <button key={item.label} className={item.active ? 'nav-item active' : 'nav-item'}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="user-panel">
          <div>
            <div className="user-name">Yahia Ben</div>
            <div className="user-role">Admin sécurité</div>
          </div>
          <div className="user-avatar">YB</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="page-title">Dashboard principal</div>
            <div className="page-subtitle">Vue d’ensemble de la sécurité API</div>
          </div>
          <div className="topbar-actions">
            <div className="status-badge">
              <span className="status-dot" /> Système opérationnel
            </div>
            <button className="primary-button">Nouveau scan</button>
          </div>
        </header>

        <section className="metrics-grid">
          <div className="metric-card">
            <p className="metric-label">Scans ce mois</p>
            <h2>142</h2>
          </div>
          <div className="metric-card">
            <p className="metric-label">Vulnérabilités détectées</p>
            <h2 className="metric-alert">38</h2>
          </div>
          <div className="metric-card">
            <p className="metric-label">Score moyen</p>
            <h2>72 / 100</h2>
          </div>
          <div className="metric-card">
            <p className="metric-label">APIs surveillées</p>
            <h2>24</h2>
          </div>
        </section>

        <div className="content-grid">
          <section className="panel panel-table">
            <div className="panel-header">
              <h3>Scans récents</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>API</th>
                  <th>Score</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.api}>
                    <td>{scan.api}</td>
                    <td>
                      <span className={`score-pill ${scorePill(scan.score)}`}>{scan.score}</span>
                    </td>
                    <td>
                      <span className={`status-tag ${scan.status === 'Succès' ? 'tag-success' : scan.status === 'Attention' ? 'tag-warning' : 'tag-danger'}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td>{scan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <aside className="sidebar-right">
            <section className="panel panel-chart">
              <div className="panel-header">
                <h3>Vulnérabilités par type</h3>
              </div>
              <div className="chart-list">
                {vulnerabilityTypes.map((item) => (
                  <div key={item.label} className="chart-row">
                    <span>{item.label}</span>
                    <div className="chart-bar-wrap">
                      <div className="chart-bar" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="chart-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel panel-activity">
              <div className="panel-header">
                <h3>Activité récente</h3>
              </div>
              <div className="activity-list">
                {activityFeed.map((item, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">•</div>
                    <div>
                      <p>{item.message}</p>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <style>{`
        :root {
          color-scheme: dark;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0e1726;
          color: #e6edf9;
        }

        .dashboard-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          padding: 24px;
          background: #0a1220;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          background: #111a2e;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 24px;
          padding: 28px 22px;
          gap: 40px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #185fa5;
          color: #fff;
          font-weight: 700;
        }

        .brand-title {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .brand-subtitle {
          font-size: 0.84rem;
          color: #9bb5d7;
          margin-top: 4px;
        }

        .nav-menu {
          display: grid;
          gap: 10px;
        }

        .nav-item {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          color: #c8d4ee;
          padding: 14px 18px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .nav-item:hover,
        .nav-item.active {
          background: rgba(24, 95, 165, 0.18);
          color: #fff;
        }

        .user-panel {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 18px;
        }

        .user-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-role {
          color: #8ea7cf;
          font-size: 0.88rem;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #1f3052;
          color: #fff;
          font-weight: 700;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #111a2e;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 22px;
          padding: 24px 28px;
        }

        .page-title {
          font-size: 1.35rem;
          font-weight: 700;
        }

        .page-subtitle {
          margin-top: 6px;
          color: #9bb5d7;
          font-size: 0.95rem;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(24, 95, 165, 0.12);
          color: #a8d3ff;
          padding: 12px 16px;
          border-radius: 999px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4ce07d;
          box-shadow: 0 0 0 6px rgba(76, 224, 125, 0.14);
          animation: pulse 2.4s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.9; }
        }

        .primary-button {
          border: none;
          border-radius: 16px;
          background: #185fa5;
          color: #fff;
          padding: 14px 22px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .primary-button:hover {
          transform: translateY(-1px);
          background: #1f75cf;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .metric-card {
          background: #111a2e;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 22px;
          padding: 24px;
        }

        .metric-label {
          margin: 0 0 10px;
          color: #8ea7cf;
          font-size: 0.95rem;
        }

        .metric-card h2 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .metric-alert {
          color: #f07878;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.9fr;
          gap: 20px;
        }

        .panel {
          background: #111a2e;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 24px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 16px 12px;
          text-align: left;
          color: #d7e1f4;
        }

        th {
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8ea7cf;
        }

        tbody tr {
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        tbody tr:hover {
          background: rgba(255,255,255,0.04);
        }

        .score-pill {
          display: inline-flex;
          min-width: 56px;
          justify-content: center;
          padding: 8px 10px;
          border-radius: 999px;
          color: #fff;
          font-weight: 600;
        }

        .pillGreen { background: #1f8b58; }
        .pillOrange { background: #d8863b; }
        .pillRed { background: #c65858; }

        .status-tag {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .tag-success { background: rgba(62, 185, 135, 0.16); color: #5ee2a0; }
        .tag-warning { background: rgba(221, 157, 63, 0.16); color: #ffd37f; }
        .tag-danger { background: rgba(206, 86, 86, 0.16); color: #ff9d9d; }

        .sidebar-right {
          display: grid;
          gap: 20px;
        }

        .chart-list {
          display: grid;
          gap: 16px;
        }

        .chart-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .chart-bar-wrap {
          position: relative;
          background: rgba(255,255,255,0.05);
          border-radius: 999px;
          height: 12px;
          width: 100%;
          overflow: hidden;
        }

        .chart-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #185fa5 0%, #48a4ff 100%);
        }

        .chart-value {
          color: #9bb5d7;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .activity-list {
          display: grid;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
        }

        .activity-icon {
          margin-top: 4px;
          color: #185fa5;
          font-size: 1.25rem;
          line-height: 1;
        }

        .activity-item p {
          margin: 0 0 6px;
          color: #f3f7ff;
          font-size: 0.95rem;
        }

        .activity-item span {
          color: #8ea7cf;
          font-size: 0.85rem;
        }

        @media (max-width: 1280px) {
          .dashboard-shell {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 860px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            padding: 22px;
          }

          .topbar,
          .panel {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
