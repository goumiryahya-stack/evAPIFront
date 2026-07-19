import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../../context/ScanContext';
import ScoreRing from '../../components/ui/ScoreRing';
import { exportReport, exportAllReports, importReport } from '../../utils/reports';
import styles from './ReportsPage.module.css';

const tabs = ['Tous', 'En cours', 'Terminés', 'Erreurs/Annulés'];

const STATUS_TRANSLATION = {
  pending: 'En attente',
  running: 'En cours',
  completed: 'Terminé',
  error: 'Erreur',
  cancelled: 'Annulé',
};

const ReportsPage = () => {
  const { scanHistory, fetchHistory } = useScan();
  const [activeTab, setActiveTab] = useState('Tous');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const importRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExportAll = async () => {
    setBusy('all');
    try {
      await exportAllReports();
      showToast('Export téléchargé.');
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy('import');
    try {
      const data = await importReport(file);
      await fetchHistory();
      showToast('Rapport importé avec succès.');
      navigate(`/reports/${data.id}`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setBusy(null);
      e.target.value = '';
    }
  };

  const handleExportOne = async (scanId, format, e) => {
    e?.stopPropagation();
    setBusy(scanId);
    try {
      await exportReport(scanId, format);
      showToast(`Export ${format.toUpperCase()} téléchargé.`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setBusy(null);
    }
  };

  const filtered = scanHistory.filter((r) => {
    const matchSearch = r.target_url.toLowerCase().includes(search.toLowerCase());

    let matchTab = true;
    if (activeTab === 'En cours') matchTab = ['pending', 'running'].includes(r.status);
    if (activeTab === 'Terminés') matchTab = r.status === 'completed';
    if (activeTab === 'Erreurs/Annulés') matchTab = ['error', 'cancelled'].includes(r.status);

    return matchSearch && matchTab;
  });

  const completedCount = scanHistory.filter((r) => r.status === 'completed').length;

  const statusBadge = (s) => {
    if (s === 'completed') return 'badge-success';
    if (['pending', 'running'].includes(s)) return 'badge-warning';
    if (['error', 'cancelled'].includes(s)) return 'badge-critical';
    return 'badge-info';
  };

  return (
    <div className="page-shell">
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Rapports</p>
          <h1>Historique des scans API</h1>
        </div>
        <div className={styles.headerRight}>
          <input
            className={`input ${styles.searchInput}`}
            type="text"
            placeholder="Rechercher une API…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.toolbar}>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={handleImport}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!!busy}
              onClick={() => importRef.current?.click()}
            >
              {busy === 'import' ? 'Import…' : '⬆ Importer'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!!busy || completedCount === 0}
              onClick={handleExportAll}
              title={completedCount === 0 ? 'Aucun rapport terminé' : 'Exporter tous les rapports (JSON)'}
            >
              {busy === 'all' ? 'Export…' : '⬇ Exporter tout'}
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
          {toast.msg}
        </div>
      )}

      <div className={styles.tabsRow}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className={styles.list}>
        {filtered.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <p>Aucun rapport ne correspond à vos critères.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/scans/new')} style={{ marginTop: 15 }}>
              Lancer un nouveau scan
            </button>
          </div>
        ) : filtered.map((report) => (
          <article key={report.id} className={`card ${styles.reportCard}`}>
            <div className={styles.overview}>
              <ScoreRing score={report.score || 0} size={80} strokeWidth={9} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{report.target_url}</h2>
                <p style={{ margin: '6px 0 12px', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  {new Date(report.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                  {report.completed_at && ` • Terminé à ${new Date(report.completed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                <div className={styles.pills}>
                  <span className={`badge ${statusBadge(report.status)}`}>
                    {STATUS_TRANSLATION[report.status] || report.status}
                  </span>
                  <span className="badge badge-info">Type: {report.scan_type}</span>
                  {['pending', 'running'].includes(report.status) && (
                    <span className="badge badge-warning">Progression: {report.progress}%</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              {report.status === 'completed' && (
                <>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/reports/${report.id}`)}>
                    Voir le rapport
                  </button>
                  <div className={styles.exportRow}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy === report.id}
                      onClick={(e) => handleExportOne(report.id, 'json', e)}
                    >
                      ⬇ JSON
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy === report.id}
                      onClick={(e) => handleExportOne(report.id, 'csv', e)}
                    >
                      ⬇ CSV
                    </button>
                  </div>
                </>
              )}
              {['pending', 'running'].includes(report.status) && (
                <button type="button" className="btn btn-warning btn-sm" onClick={() => navigate('/scans/progress')}>
                  Suivre le scan
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/scans/new')}>
                ↺ Nouveau scan similaire
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ReportsPage;
