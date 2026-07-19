import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../utils/api';
import SeverityBadge from '../../components/ui/SeverityBadge';
import { toSeverityLabel, SEVERITY_FROM_LABEL } from '../../utils/severity';
import styles from './VulnerabilitiesPage.module.css';

const STATUS_UI = { open: 'Ouverte', resolved: 'Résolue', ignored: 'Ignorée' };
const STATUS_API = { Ouverte: 'open', Résolue: 'resolved', Ignorée: 'ignored' };

const statusCls = { Ouverte: 'badge-danger', Résolue: 'badge-success', Ignorée: 'badge-info' };

const VulnerabilitiesPage = () => {
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('Tous');
  const [owaspFilter, setOwaspFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selected, setSelected] = useState(null);

  const loadVulns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'Tous') {
        params.set('severity', SEVERITY_FROM_LABEL[severityFilter] ?? severityFilter.toLowerCase());
      }
      if (statusFilter !== 'Tous') {
        params.set('status', STATUS_API[statusFilter] ?? statusFilter.toLowerCase());
      }
      if (owaspFilter !== 'Tous') {
        params.set('owasp', owaspFilter);
      }
      const qs = params.toString();
      const data = await apiFetch(`/vulnerabilities${qs ? `?${qs}` : ''}`);
      setVulns(data);
    } catch (err) {
      console.error('Vulnérabilités:', err);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, owaspFilter, statusFilter]);

  useEffect(() => {
    loadVulns();
  }, [loadVulns]);

  const counts = vulns.reduce((acc, v) => {
    const label = toSeverityLabel(v.severity);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const countCls = {
    Critique: styles.countCritical,
    Élevée: styles.countHigh,
    Moyenne: styles.countMedium,
    Faible: styles.countLow,
  };

  const updateStatus = async (vulnId, status) => {
    try {
      await apiFetch(`/vulnerabilities/${vulnId}?remediation_status=${status}`, { method: 'PATCH' });
      await loadVulns();
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const apiOptions = ['Toutes', ...new Set(vulns.map((v) => v.target_url).filter(Boolean))];
  const [apiFilter, setApiFilter] = useState('Toutes');

  const filtered = vulns.filter((v) =>
    apiFilter === 'Toutes' || v.target_url === apiFilter
  );

  return (
    <div className="page-shell">
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Vulnérabilités</p>
          <h1>Gestion des failles API</h1>
        </div>
        <button type="button" className="btn btn-ghost" onClick={loadVulns}>↻ Actualiser</button>
      </header>

      <section className={styles.countsRow}>
        {['Critique', 'Élevée', 'Moyenne', 'Faible'].map((label) => (
          <div key={label} className={`card card-sm ${styles.countCard} ${countCls[label]}`}>
            <span className={styles.countLabel}>{label}</span>
            <strong className={styles.countVal}>{counts[label] ?? 0}</strong>
          </div>
        ))}
      </section>

      <section className={`card card-sm ${styles.filterPanel}`}>
        {[
          { label: 'Sévérité', value: severityFilter, setValue: setSeverityFilter, opts: ['Tous', 'Critique', 'Élevée', 'Moyenne', 'Faible'] },
          { label: 'Type OWASP', value: owaspFilter, setValue: setOwaspFilter, opts: ['Tous', 'API1', 'API2', 'API4', 'API6', 'API7', 'API8'] },
          { label: 'API', value: apiFilter, setValue: setApiFilter, opts: apiOptions },
          { label: 'Statut', value: statusFilter, setValue: setStatusFilter, opts: ['Tous', 'Ouverte', 'Résolue', 'Ignorée'] },
        ].map((f) => (
          <div key={f.label} className={styles.filterGroup}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{f.label}</label>
            <select className="input" value={f.value} onChange={(e) => f.setValue(e.target.value)}>
              {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </section>

      <div className={`${styles.tableLayout} ${selected ? styles.withDrawer : ''}`}>
        <section className={`card ${styles.tablePanel}`}>
          {loading ? (
            <p style={{ padding: 16, color: 'var(--text-muted)' }}>Chargement…</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: 16, color: 'var(--text-muted)' }}>Aucune vulnérabilité trouvée.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sévérité</th><th>Vulnérabilité</th><th>API / Endpoint</th>
                  <th>OWASP</th><th>Statut</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const statusUi = STATUS_UI[v.remediation_status] ?? v.remediation_status;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelected({ ...v, statusUi })}
                      className={selected?.id === v.id ? styles.selectedRow : ''}
                    >
                      <td><SeverityBadge severity={v.severity} /></td>
                      <td style={{ fontWeight: 600 }}>{v.title}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {v.target_url}<br />
                        <code style={{ opacity: 0.7 }}>{v.endpoint || '—'}</code>
                      </td>
                      <td><span className="badge badge-info">{v.owasp_category}</span></td>
                      <td><span className={`badge ${statusCls[statusUi] ?? 'badge-info'}`}>{statusUi}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {new Date(v.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {v.remediation_status === 'open' && (
                            <>
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => updateStatus(v.id, 'resolved')}>Résoudre</button>
                              <button type="button" className="btn btn-ghost btn-sm" style={{ opacity: 0.6 }} onClick={() => updateStatus(v.id, 'ignored')}>Ignorer</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {selected && (
          <aside className={`card ${styles.drawer}`}>
            <div className={styles.drawerHead}>
              <SeverityBadge severity={selected.severity} />
              <button type="button" className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <h2 style={{ margin: '12px 0 4px', fontSize: '1.05rem' }}>{selected.title}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {selected.target_url} • <code>{selected.endpoint || '—'}</code>
            </p>
            <div className={styles.drawerBody}>
              {[
                { label: 'Type OWASP', val: selected.owasp_category },
                { label: 'Statut', val: selected.statusUi },
                { label: 'Détecté le', val: new Date(selected.created_at).toLocaleDateString('fr-FR') },
              ].map((row) => (
                <div key={row.label} className={styles.drawerRow}>
                  <span>{row.label}</span><strong>{row.val}</strong>
                </div>
              ))}
              {selected.recommendation && (
                <div className={styles.drawerBlock}>
                  <h3>💡 Recommandation</h3>
                  <p>{selected.recommendation}</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default VulnerabilitiesPage;
