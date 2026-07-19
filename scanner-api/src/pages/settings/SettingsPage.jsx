import React, { useState } from 'react';
import styles from './SettingsPage.module.css';

const integrations = [
  { name: 'GitHub', status: 'Connecté'    },
  { name: 'GitLab', status: 'Déconnecté'  },
  { name: 'Jira',   status: 'Connecté'    },
  { name: 'Slack',  status: 'Déconnecté'  },
];

const apiKeys = [
  { id: 1, name: 'Clé principale', value: 'sk_************8d12', created: '01 mai 2026' },
  { id: 2, name: 'Clé de test',    value: 'sk_************4f91', created: '20 avr 2026' },
];

const sessions = [
  { id: 1, ip: '192.168.1.12', location: 'Paris, FR',  browser: 'Chrome'  },
  { id: 2, ip: '185.45.32.98', location: 'Lyon, FR',   browser: 'Firefox' },
];

const sections = ['Profil', 'Clés API', 'Notifications', 'Intégrations', 'Plan & Facturation', 'Sécurité', 'Zone de danger'];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('Profil');
  const [emailNotif, setEmailNotif] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const Toggle = ({ on, onToggle }) => (
    <button
      type="button"
      className={`toggle-switch ${on ? 'on' : ''}`}
      onClick={onToggle}
      aria-checked={on}
      role="switch"
    >
      <span className="toggle-thumb" />
    </button>
  );

  return (
    <div className={`page-shell ${styles.shell}`}>
      {/* Header */}
      <header>
        <p className="eyebrow">Paramètres</p>
        <h1 style={{ fontSize: '2rem', marginTop: 6 }}>Configuration du compte</h1>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={`card ${styles.settingsSidebar}`}>
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.sideItem} ${activeSection === s ? styles.sideActive : ''} ${s === 'Zone de danger' ? styles.sideDanger : ''}`}
              onClick={() => setActiveSection(s)}
            >
              {s}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className={styles.content}>

          {/* Profil */}
          {activeSection === 'Profil' && (
            <section className={`card ${styles.section}`}>
              <div className={styles.sectionHead}>
                <div><h3>Profil utilisateur</h3><p>Informations de compte et accès.</p></div>
                <button className="btn btn-ghost btn-sm">Modifier</button>
              </div>
              <div className={styles.profileGrid}>
                <div className={styles.avatar}>YB</div>
                <div className={styles.profileFields}>
                  <label className="form-label">Nom<input className="input" type="text" defaultValue="Yahia Ben" /></label>
                  <label className="form-label">Email<input className="input" type="email" defaultValue="yahia@evapi.io" /></label>
                  <label className="form-label">Mot de passe<input className="input" type="password" placeholder="••••••••••" /></label>
                  <button className="btn btn-primary" style={{ width: 'fit-content' }}>Sauvegarder</button>
                </div>
              </div>
            </section>
          )}

          {/* Clés API */}
          {activeSection === 'Clés API' && (
            <section className={`card ${styles.section}`}>
              <div className={styles.sectionHead}>
                <div><h3>Clés API</h3><p>Gérez vos clés d'accès à l'API.</p></div>
                <button className="btn btn-primary btn-sm">+ Créer une clé</button>
              </div>
              {apiKeys.map((k) => (
                <div key={k.id} className={styles.keyRow}>
                  <div>
                    <strong style={{ display: 'block' }}>{k.name}</strong>
                    <code style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{k.value}</code>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{k.created}</span>
                    <button className="btn btn-ghost btn-sm">Copier</button>
                    <button className="btn btn-danger btn-sm">Révoquer</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Notifications */}
          {activeSection === 'Notifications' && (
            <section className={`card ${styles.section}`}>
              <div className={styles.sectionHead}>
                <div><h3>Notifications</h3><p>Recevez des alertes en temps réel.</p></div>
              </div>
              <div className={styles.togglesList}>
                {[
                  { label: 'Email à chaque scan terminé', on: emailNotif, toggle: () => setEmailNotif(!emailNotif) },
                  { label: 'Alerte si vulnérabilité critique', on: criticalAlerts, toggle: () => setCriticalAlerts(!criticalAlerts) },
                  { label: 'Rapport hebdomadaire', on: weeklyReport, toggle: () => setWeeklyReport(!weeklyReport) },
                ].map((t) => (
                  <div key={t.label} className={styles.toggleRow}>
                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                    <Toggle on={t.on} onToggle={t.toggle} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Intégrations */}
          {activeSection === 'Intégrations' && (
            <section className={`card ${styles.section}`}>
              <div className={styles.sectionHead}>
                <div><h3>Intégrations</h3><p>Connectez vos outils DevOps et collaboration.</p></div>
              </div>
              <div className={styles.intGrid}>
                {integrations.map((i) => (
                  <div key={i.name} className={styles.intCard}>
                    <div>
                      <strong style={{ display: 'block' }}>{i.name}</strong>
                      <span style={{ color: i.status === 'Connecté' ? 'var(--success-text)' : 'var(--text-muted)', fontSize: '0.88rem' }}>{i.status}</span>
                    </div>
                    <button className={`btn btn-sm ${i.status === 'Connecté' ? 'btn-ghost' : 'btn-primary'}`}>
                      {i.status === 'Connecté' ? 'Gérer' : 'Connecter'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Plan */}
          {activeSection === 'Plan & Facturation' && (
            <section className={`card ${styles.section}`}>
              <div className={styles.sectionHead}>
                <div><h3>Plan & Facturation</h3><p>Votre abonnement et utilisation actuelle.</p></div>
                <button className="btn btn-primary btn-sm">Upgrade</button>
              </div>
              {[
                { label: 'Plan actuel', val: 'Pro' },
                { label: 'Usage', val: '47 / 100 scans' },
              ].map((r) => (
                <div key={r.label} className={styles.billingRow}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                  <strong>{r.val}</strong>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}>Voir l'historique des factures</button>
            </section>
          )}

          {/* Sécurité */}
          {activeSection === 'Sécurité' && (
            <section className={`card ${styles.section}`}>
              <div className={styles.sectionHead}>
                <div><h3>Sécurité</h3><p>Protection du compte et sessions actives.</p></div>
              </div>
              <div className={styles.securityBlock}>
                <div><strong>Authentification 2FA</strong><p style={{ margin: '4px 0 0', color: 'var(--success-text)' }}>Activée</p></div>
                <button className="btn btn-ghost btn-sm">Gérer</button>
              </div>
              <div className={styles.sessionsList}>
                {sessions.map((s) => (
                  <div key={s.id} className={styles.sessionRow}>
                    <div>
                      <strong style={{ display: 'block' }}>{s.ip}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{s.location} • {s.browser}</span>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-danger btn-sm" style={{ width: 'fit-content' }}>Déconnecter toutes les sessions</button>
            </section>
          )}

          {/* Danger zone */}
          {activeSection === 'Zone de danger' && (
            <section className={`card ${styles.section} ${styles.dangerSection}`}>
              <div className={styles.sectionHead}>
                <div><h3 style={{ color: 'var(--critical-text)' }}>Zone de danger</h3><p>Actions irréversibles pour le compte.</p></div>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                La suppression de votre compte supprime toutes les données liées aux scans, rapports et intégrations. Cette action est irréversible.
              </p>
              <button className="btn btn-danger" style={{ width: 'fit-content' }}>🗑 Supprimer mon compte</button>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
