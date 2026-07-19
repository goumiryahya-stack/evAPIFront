import React, { useState } from 'react';

const integrations = [
  { name: 'GitHub', status: 'Connecté' },
  { name: 'GitLab', status: 'Déconnecté' },
  { name: 'Jira', status: 'Connecté' },
  { name: 'Slack', status: 'Déconnecté' },
];

const apiKeys = [
  { id: 1, name: 'Clé principale', value: 'sk_************8d12', created: '01 mai 2026' },
  { id: 2, name: 'Clé de test', value: 'sk_************4f91', created: '20 avr 2026' },
];

const sessions = [
  { id: 1, ip: '192.168.1.12', location: 'Paris, FR', browser: 'Chrome' },
  { id: 2, ip: '185.45.32.98', location: 'Lyon, FR', browser: 'Firefox' },
];

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <div className="settings-shell">
      <aside className="settings-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">S</div>
          <div>
            <h2>EvAPI</h2>
            <p>Paramètres du compte</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">Profil utilisateur</button>
          <button className="nav-item">Clés API</button>
          <button className="nav-item">Notifications</button>
          <button className="nav-item">Intégrations</button>
          <button className="nav-item">Plan & facturation</button>
          <button className="nav-item">Sécurité</button>
          <button className="nav-item danger">Zone de danger</button>
        </nav>
      </aside>

      <main className="settings-content">
        <section className="section-card profile-card">
          <div className="section-header">
            <div>
              <h3>Profil utilisateur</h3>
              <p>Informations de compte et accès.</p>
            </div>
            <button className="ghost-button">Modifier</button>
          </div>
          <div className="profile-grid">
            <div className="profile-photo">YB</div>
            <div className="profile-fields">
              <label>
                Nom
                <input type="text" defaultValue="Yahia Ben" />
              </label>
              <label>
                Email
                <input type="email" defaultValue="yahia@monsite.com" />
              </label>
              <label>
                Mot de passe
                <input type="password" placeholder="••••••••••" />
              </label>
            </div>
          </div>
        </section>

        <section className="section-card api-keys-card">
          <div className="section-header">
            <div>
              <h3>Clés API</h3>
              <p>Gérez vos clés d’accès à l’API.</p>
            </div>
            <button className="primary-button">Créer une nouvelle clé</button>
          </div>
          <div className="keys-list">
            {apiKeys.map((key) => (
              <div key={key.id} className="key-row">
                <div>
                  <strong>{key.name}</strong>
                  <p>{key.value}</p>
                </div>
                <div className="key-meta">
                  <span>{key.created}</span>
                  <div className="key-actions">
                    <button type="button">Copier</button>
                    <button type="button">Révoquer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card notifications-card">
          <div className="section-header">
            <div>
              <h3>Notifications</h3>
              <p>Recevez des alertes en temps réel.</p>
            </div>
          </div>
          <div className="toggles-grid">
            <label className="toggle-row">
              <span>Email à chaque scan terminé</span>
              <button type="button" className={emailNotifications ? 'toggle active' : 'toggle'} onClick={() => setEmailNotifications(!emailNotifications)}>
                <span />
              </button>
            </label>
            <label className="toggle-row">
              <span>Alerte si vulnérabilité critique</span>
              <button type="button" className={criticalAlerts ? 'toggle active' : 'toggle'} onClick={() => setCriticalAlerts(!criticalAlerts)}>
                <span />
              </button>
            </label>
            <label className="toggle-row">
              <span>Rapport hebdomadaire</span>
              <button type="button" className={weeklyReport ? 'toggle active' : 'toggle'} onClick={() => setWeeklyReport(!weeklyReport)}>
                <span />
              </button>
            </label>
          </div>
        </section>

        <section className="section-card integrations-card">
          <div className="section-header">
            <div>
              <h3>Intégrations</h3>
              <p>Connectez vos outils DevOps et collaboration.</p>
            </div>
          </div>
          <div className="integration-grid">
            {integrations.map((item) => (
              <div key={item.name} className="integration-card">
                <div>
                  <h4>{item.name}</h4>
                  <span>{item.status}</span>
                </div>
                <button type="button" className={item.status === 'Connecté' ? 'ghost-button' : 'primary-button'}>
                  {item.status === 'Connecté' ? 'Gérer' : 'Connecter'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card billing-card">
          <div className="section-header">
            <div>
              <h3>Plan & facturation</h3>
              <p>Votre abonnement et utilisation actuelle.</p>
            </div>
            <button className="primary-button">Upgrade</button>
          </div>
          <div className="billing-grid">
            <div className="billing-summary">
              <span>Plan actuel</span>
              <strong>Pro</strong>
            </div>
            <div className="billing-summary">
              <span>Usage</span>
              <strong>47 / 100 scans</strong>
            </div>
            <div className="billing-summary">
              <span>Historique factures</span>
              <button type="button" className="ghost-button">Voir l’historique</button>
            </div>
          </div>
        </section>

        <section className="section-card security-card">
          <div className="section-header">
            <div>
              <h3>Sécurité</h3>
              <p>Protection du compte et sessions actives.</p>
            </div>
          </div>
          <div className="security-block">
            <div>
              <h4>Authentification 2FA</h4>
              <p>Activée</p>
            </div>
            <button type="button" className="ghost-button">Gérer</button>
          </div>
          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-row">
                <div>
                  <strong>{session.ip}</strong>
                  <p>{session.location} • {session.browser}</p>
                </div>
                <span>Active</span>
              </div>
            ))}
          </div>
          <button type="button" className="danger-button">Déconnecter toutes les sessions</button>
        </section>

        <section className="section-card danger-card">
          <div className="section-header">
            <div>
              <h3>Zone de danger</h3>
              <p>Actions irréversibles pour le compte.</p>
            </div>
          </div>
          <div className="danger-body">
            <p>La suppression de votre compte supprime toutes les données liées aux scans, rapports et intégrations.</p>
            <button type="button" className="danger-button">Supprimer mon compte</button>
          </div>
        </section>
      </main>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1524; color: #e8f0ff; }
        .settings-shell { min-height: 100vh; display: grid; grid-template-columns: 280px 1fr; gap: 24px; padding: 32px; background: #08101f; }
        .settings-sidebar { background: #101d34; border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; padding: 28px 22px; display: flex; flex-direction: column; gap: 28px; }
        .sidebar-brand { display: flex; align-items: center; gap: 14px; }
        .brand-mark { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; background: #185fa5; color: #fff; font-weight: 700; font-size: 1.15rem; }
        .sidebar-brand h2 { margin: 0; font-size: 1.15rem; }
        .sidebar-brand p { margin: 4px 0 0; color: #9db5d8; font-size: 0.92rem; }
        .sidebar-nav { display: grid; gap: 10px; }
        .nav-item { border: none; text-align: left; padding: 15px 18px; background: transparent; color: #d7e4ff; border-radius: 18px; cursor: pointer; transition: background 0.2s ease; }
        .nav-item.active { background: rgba(24,95,165,0.2); color: #fff; }
        .nav-item.danger { color: #ff8a8a; }
        .settings-content { display: grid; gap: 24px; }
        .section-card { background: #101f36; border: 1px solid rgba(255,255,255,0.06); border-radius: 26px; padding: 26px; display: grid; gap: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .section-header h3 { margin: 0; font-size: 1.2rem; }
        .section-header p { margin: 4px 0 0; color: #9bb4d8; }
        .ghost-button, .primary-button, .danger-button { border: none; border-radius: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
        .ghost-button { padding: 12px 18px; background: rgba(255,255,255,0.04); color: #dce6ff; }
        .ghost-button:hover { background: rgba(255,255,255,0.08); }
        .primary-button { padding: 12px 18px; background: #185fa5; color: #fff; }
        .primary-button:hover { background: #1e74d3; }
        .danger-button { padding: 12px 18px; background: rgba(255,85,85,0.18); color: #ffb0b0; }
        .danger-button:hover { background: rgba(255,85,85,0.28); }
        .profile-grid { display: grid; grid-template-columns: 140px 1fr; gap: 22px; align-items: start; }
        .profile-photo { width: 140px; height: 140px; border-radius: 24px; display: grid; place-items: center; background: #1b2d54; color: #e8f0ff; font-size: 2.75rem; font-weight: 700; }
        .profile-fields { display: grid; gap: 16px; }
        label { display: grid; gap: 8px; font-weight: 600; color: #cfd9f1; }
        input { width: 100%; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: #0f1c32; color: #eef4ff; padding: 14px 16px; font-size: 0.96rem; }
        .keys-list { display: grid; gap: 16px; }
        .key-row { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; padding: 18px 20px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .key-row p { margin: 6px 0 0; color: #9bb5d9; }
        .key-meta { display: grid; gap: 10px; align-items: center; text-align: right; }
        .key-actions { display: flex; gap: 10px; }
        .key-actions button { padding: 10px 16px; border-radius: 14px; background: rgba(255,255,255,0.04); color: #d8e7ff; border: none; cursor: pointer; }
        .toggles-grid { display: grid; gap: 16px; }
        .toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 18px 20px; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); cursor: pointer; }
        .toggle-row span { font-weight: 600; color: #e2ecff; }
        .toggle { width: 52px; height: 28px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: #202f55; position: relative; transition: background 0.2s ease; }
        .toggle.active { background: #185fa5; }
        .toggle span { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; transition: transform 0.2s ease; }
        .toggle.active span { transform: translateX(24px); }
        .integration-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .integration-card { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 22px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; }
        .integration-card h4 { margin: 0; font-size: 1rem; }
        .integration-card span { color: #9cb1d8; }
        .billing-grid { display: grid; gap: 16px; }
        .billing-summary { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 18px 20px; }
        .billing-summary span { color: #9cb1d8; }
        .billing-summary strong { color: #fff; }
        .security-block { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .security-block h4 { margin: 0; }
        .security-block p { margin: 6px 0 0; color: #9ab2d7; }
        .sessions-list { display: grid; gap: 12px; }
        .session-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
        .session-row p { margin: 6px 0 0; color: #9ab2d8; }
        .danger-body { display: grid; gap: 16px; padding: 18px 20px; background: rgba(255,255,255,0.03); border-radius: 22px; }
        .danger-body p { margin: 0; color: #e3edf8; line-height: 1.7; }
        @media (max-width: 1100px) { .settings-shell { grid-template-columns: 1fr; } .integration-grid { grid-template-columns: 1fr; } .billing-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Settings;
