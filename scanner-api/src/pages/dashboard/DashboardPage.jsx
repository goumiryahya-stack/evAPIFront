import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import ScorePill from '../../components/ui/ScorePill';
import { scanStatusLabel } from '../../utils/severity';
import styles from './DashboardPage.module.css';

const statusTagClass = (status) => {
  if (status === 'completed') return styles.tagSuccess;
  if (['pending', 'running'].includes(status)) return styles.tagWarning;
  return styles.tagDanger;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const owaspChart = stats?.vulnerabilities_by_owasp ?? [];
  const maxOwasp = Math.max(...owaspChart.map((o) => o.count), 1);
  const severityCounts = stats?.vulnerabilities_by_severity ?? {};

  const severityChart = [
    { key: 'critical', label: 'Auth / critique' },
    { key: 'high', label: 'Élevée' },
    { key: 'medium', label: 'Moyenne' },
    { key: 'low', label: 'Faible' },
  ].map((s) => ({
    label: s.label,
    value: severityCounts[s.key] ?? 0,
  }));
  const maxSev = Math.max(...severityChart.map((s) => s.value), 1);

  if (loading) {
    return (
      <div className="page-shell">
        <p style={{ color: 'var(--text-secondary)' }}>Chargement du tableau de bord…</p>
      </div>
    );
  }

  const recentScans = stats?.recent_scans ?? [];

  return (
    <div className={`page-shell ${styles.dashboard}`}>
      <header className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Dashboard principal</div>
          <div className={styles.pageSub}>Vue d&apos;ensemble de la sécurité API</div>
        </div>
        <div className={styles.topbarActions}>
          <div className={styles.statusBadge}>
            <span className="status-dot" />
            Système opérationnel
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/scans/new')}>
            + Nouveau scan
          </button>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        {[
          { label: 'Scans totaux', value: String(stats?.total_scans ?? 0), delta: `${stats?.completed_scans ?? 0} terminés`, positive: true },
          { label: 'Vulnérabilités ouvertes', value: String(stats?.open_vulnerabilities ?? 0), delta: stats?.running_scans ? `${stats.running_scans} en cours` : '—', positive: false, alert: (stats?.open_vulnerabilities ?? 0) > 0 },
          { label: 'Score moyen', value: `${stats?.average_score ?? 0}/100`, delta: stats?.completed_scans ? 'sur scans terminés' : 'aucun scan', positive: (stats?.average_score ?? 0) >= 60 },
          { label: 'APIs auditées', value: String(stats?.unique_apis ?? 0), delta: 'URLs distinctes', positive: true },
        ].map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <p className={styles.metricLabel}>{m.label}</p>
            <h2 className={m.alert ? styles.metricAlert : ''}>{m.value}</h2>
            <span className={m.positive ? styles.deltaPosive : styles.deltaNegatif}>{m.delta}</span>
          </div>
        ))}
      </section>

      <div className={styles.contentGrid}>
        <section className="card">
          <div className={styles.panelHeader}>
            <h3 className="section-title">Scans récents</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>Voir tout</button>
          </div>
          {recentScans.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>
              Aucun scan pour l&apos;instant.{' '}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/scans/new')}>
                Lancer un scan
              </button>
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>API</th><th>Score</th><th>Statut</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => scan.status === 'completed' ? navigate(`/reports/${scan.id}`) : navigate('/reports')}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{scan.target_url}</td>
                    <td><ScorePill score={scan.score ?? 0} /></td>
                    <td>
                      <span className={`badge ${statusTagClass(scan.status)}`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        {scanStatusLabel(scan.status)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(scan.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div className={styles.sideCol}>
          <section className="card">
            <div className={styles.panelHeader}>
              <h3 className="section-title">Vulnérabilités par sévérité</h3>
            </div>
            <div className={styles.chartList}>
              {severityChart.map((item) => (
                <div key={item.label} className={styles.chartRow}>
                  <span className={styles.chartLabel}>{item.label}</span>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${(item.value / maxSev) * 100}%` }} />
                  </div>
                  <span className={styles.chartVal}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className={styles.panelHeader}>
              <h3 className="section-title">Top catégories OWASP</h3>
            </div>
            <div className={styles.activityList}>
              {owaspChart.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucune vulnérabilité enregistrée.</p>
              ) : owaspChart.map((item) => (
                <div key={item.category} className={styles.activityItem}>
                  <div className={`${styles.activityDot} ${styles.dotWarning}`} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.94rem' }}>{item.category}</p>
                    <div className="progress-track" style={{ marginTop: 8 }}>
                      <div className="progress-fill" style={{ width: `${(item.count / maxOwasp) * 100}%` }} />
                    </div>
                  </div>
                  <strong style={{ marginLeft: 12 }}>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
