import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import ScoreRing from '../../components/ui/ScoreRing';
import SeverityBadge from '../../components/ui/SeverityBadge';
import { scoreLevel } from '../../utils/severity';
import { exportReport, downloadReportPdf, enrichReportWithAi, fetchAiStatus } from '../../utils/reports';
import styles from './ReportDetailPage.module.css';

const ReportDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/reports/${id}`);
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    fetchAiStatus().then(setAiStatus).catch(() => setAiStatus({ available: false }));
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell">
        <p style={{ color: 'var(--text-secondary)' }}>Chargement du rapport…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="page-shell">
        <div className="card">
          <h2>Rapport introuvable</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error ?? 'Ce scan n\'existe pas ou n\'est pas terminé.'}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/reports')}>← Retour</button>
        </div>
      </div>
    );
  }

  const score = report.score ?? report.report?.security_score ?? 0;
  const level = scoreLevel(score);
  const r = report.report;
  const vulns = report.vulnerabilities ?? [];

  const summaryCards = [
    { label: 'Critique', count: r?.critical_count ?? 0, cls: 'badge-critical' },
    { label: 'Élevée', count: r?.high_count ?? 0, cls: 'badge-high' },
    { label: 'Moyenne', count: r?.medium_count ?? 0, cls: 'badge-medium' },
    { label: 'Faible', count: r?.low_count ?? 0, cls: 'badge-low' },
  ];

  const durationMin = r?.duration_seconds
    ? Math.max(1, Math.round(r.duration_seconds / 60))
    : '—';

  const positives = vulns.length === 0
    ? ['Aucune vulnérabilité critique détectée par le moteur OWASP.']
    : [];

  const recommendations = vulns
    .filter((v) => v.recommendation)
    .slice(0, 6)
    .map((v) => v.recommendation);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportReport(id, format);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = async () => {
    setExporting('pdf');
    try {
      await downloadReportPdf(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting(null);
    }
  };

  const handleAiEnrich = async () => {
    setEnriching(true);
    try {
      const data = await enrichReportWithAi(id);
      setReport(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="page-shell">
      <header className={`card ${styles.header}`}>
        <div>
          <p className="eyebrow">Rapport #{id?.slice(0, 8)}</p>
          <h1>{report.target_url}</h1>
          <div className={styles.metaRow}>
            <span>{new Date(report.completed_at || report.created_at).toLocaleDateString('fr-FR')}</span>
            <span>• {durationMin} min</span>
            <span>• Scan {report.scan_type}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/reports')}>← Retour</button>
          <button type="button" className="btn btn-ghost" disabled={!!exporting} onClick={() => handleExport('json')}>
            {exporting === 'json' ? '…' : '⬇ JSON'}
          </button>
          <button type="button" className="btn btn-ghost" disabled={!!exporting} onClick={() => handleExport('csv')}>
            {exporting === 'csv' ? '…' : '⬇ CSV'}
          </button>
          <button type="button" className="btn btn-ghost" disabled={!!exporting} onClick={handlePdf}>
            {exporting === 'pdf' ? '…' : '📄 PDF'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={enriching || aiStatus?.available === false}
            title={aiStatus?.available === false ? 'Ollama non disponible' : 'Générer résumé et recommandations IA'}
            onClick={handleAiEnrich}
          >
            {enriching ? 'IA…' : '🤖 IA'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/scans/new')}>↺ Nouveau scan</button>
        </div>
      </header>

      <div className={styles.topBlock}>
        <section className={`card ${styles.scoreCard}`}>
          <ScoreRing score={score} size={120} strokeWidth={12} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: level.color }}>Niveau : {level.label}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Score de sécurité global</p>
          </div>
        </section>
        <section className={styles.summaryGrid}>
          {summaryCards.map((s) => (
            <div key={s.label} className={`card card-sm ${styles.summaryCard}`}>
              <span className={`badge ${s.cls}`}>{s.label}</span>
              <strong style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{s.count}</strong>
            </div>
          ))}
        </section>
      </div>

      {r?.executive_summary && (
        <section className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">Synthèse</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{r.executive_summary}</p>
        </section>
      )}

      <section>
        <div style={{ marginBottom: 20 }}>
          <h2 className="section-title">Vulnérabilités détectées ({vulns.length})</h2>
          <p className="section-subtitle">Analyse détaillée des failles identifiées et recommandations.</p>
        </div>
        {vulns.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Aucune vulnérabilité détectée sur cette cible.</p>
          </div>
        ) : (
          <div className={styles.vulnList}>
            {vulns.map((vuln) => (
              <article key={vuln.id} className={`card ${styles.vulnCard}`}>
                <div className={styles.vulnHeader}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{vuln.title}</h3>
                    <SeverityBadge severity={vuln.severity} />
                  </div>
                  {vuln.endpoint && <code className={styles.endpoint}>{vuln.endpoint}</code>}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{vuln.description}</p>
                {(vuln.ai_recommendation || vuln.recommendation) && (
                  <div className={styles.recommendationBox}>
                    <strong style={{ display: 'block', marginBottom: 6, color: '#d9ecff' }}>
                      {vuln.ai_recommendation ? '💡 Recommandation IA' : '💡 Recommandation'}
                    </strong>
                    <p style={{ margin: 0, color: '#d4e3ff', lineHeight: 1.6 }}>
                      {vuln.ai_recommendation || vuln.recommendation}
                    </p>
                  </div>
                )}
                {vuln.http_snippet && (
                  <div className={styles.httpSnippet}>
                    <pre>{vuln.http_snippet}</pre>
                  </div>
                )}
                <div className={styles.referenceRow}>
                  <span style={{ color: 'var(--text-secondary)' }}>Référence OWASP</span>
                  <strong>{vuln.owasp_category}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className={styles.twoCol}>
        <section className="card">
          <h2 className="section-title" style={{ marginBottom: 4 }}>Points positifs</h2>
          <p className="section-subtitle" style={{ marginBottom: 18 }}>Éléments conformes ou sans alerte majeure.</p>
          <ul className={styles.positiveList}>
            {(positives.length ? positives : ['HTTPS et en-têtes peuvent être conformes si aucune alerte API7.']).map((text) => (
              <li key={text}>✓ {text}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="section-title" style={{ marginBottom: 4 }}>Recommandations prioritaires</h2>
          <p className="section-subtitle" style={{ marginBottom: 18 }}>Actions à traiter en priorité.</p>
          {recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Aucune recommandation supplémentaire.</p>
          ) : (
            <ol className={styles.recList}>
              {recommendations.map((item, i) => (
                <li key={i}>
                  <span className={styles.recNum}>{i + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportDetailPage;
