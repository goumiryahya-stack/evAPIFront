import React from 'react';

const vulnerabilities = [
  {
    title: 'Authentification manquante sur /admin/users',
    severity: 'Critique',
    description: 'L’accès à l’endpoint /admin/users n’est pas protégé, ce qui permettrait à un attaquant non authentifié de lister des comptes administrateur.',
    endpoint: 'GET /admin/users',
    recommendation: 'Mettre en place une authentification forte et vérifier le rôle de l’utilisateur avant de renvoyer des données sensibles.',
    httpSnippet: 'GET /admin/users HTTP/1.1\nHost: api.monsite.com\nAuthorization: <absent>\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n[ { "id": 1, "email": "admin@monsite.com" } ]',
    reference: 'API2:2023 – Broken Authentication',
  },
  {
    title: 'CORS trop permissif sur /api/v1/users',
    severity: 'Élevée',
    description: 'Les en-têtes CORS autorisent toutes les origines, ce qui peut permettre à un site malveillant de récupérer des réponses API depuis le navigateur des utilisateurs.',
    endpoint: 'POST /api/v1/users',
    recommendation: 'Restreindre l’origine autorisée aux domaines de confiance et éviter Access-Control-Allow-Origin: *.',
    httpSnippet: 'Access-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true',
    reference: 'API3:2023 – Excessive Data Exposure',
  },
  {
    title: 'JWT mal configuré sur /auth/login',
    severity: 'Moyenne',
    description: 'Le token JWT utilise un algorithme faible et ne valide pas correctement l’en-tête alg, ce qui expose à des attaques par substitution de signature.',
    endpoint: 'POST /auth/login',
    recommendation: 'Valider strictement l’algorithme JWT côté serveur et utiliser une clé secrète robuste en HS256 ou RS256.',
    httpSnippet: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    reference: 'API5:2023 – Broken Object Level Authorization',
  },
];

const positives = [
  'HTTPS obligatoire sur tous les endpoints principaux.',
  'En-têtes de sécurité HTTP bien configurés pour la plupart des réponses.',
  'Limitation de taux partiellement en place pour les endpoints sensibles.',
];

const recommendations = [
  'Restreindre les accès sur /admin/users avec une authentification et une autorisation solides.',
  'Éliminer les configurations CORS permissives et limiter les origines autorisées.',
  'Renforcer la gestion JWT en validant l’algorithme et en utilisant des clés sécurisées.',
  'Compléter les protections de rate limiting sur les endpoints de création et modification.',
];

const ReportDetail = () => {
  const score = 54;
  const ringValue = 2 * Math.PI * 38;
  const offset = ringValue - (score / 100) * ringValue;

  return (
    <div className="report-detail-shell">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Détail du rapport</p>
          <h1>https://api.monsite.com</h1>
          <div className="meta-row">
            <span>04 mai 2026</span>
            <span>• 28 min</span>
            <span>• Scan approfondi</span>
          </div>
        </div>
        <button className="download-button">Télécharger PDF</button>
      </header>

      <div className="top-block">
        <section className="score-card">
          <div className="score-ring">
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="38" stroke="#1a2b46" strokeWidth="12" fill="none" />
              <circle
                cx="56"
                cy="56"
                r="38"
                stroke="#f2a94b"
                strokeWidth="12"
                fill="none"
                strokeDasharray={ringValue}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 56 56)"
              />
            </svg>
            <div className="score-value">
              <strong>{score}</strong>
              <span>/100</span>
            </div>
          </div>
          <div className="score-label">Moyen</div>
        </section>

        <section className="summary-grid">
          <div className="summary-card critical">
            <span>Critique</span>
            <strong>3</strong>
          </div>
          <div className="summary-card high">
            <span>Élevée</span>
            <strong>5</strong>
          </div>
          <div className="summary-card medium">
            <span>Moyenne</span>
            <strong>8</strong>
          </div>
          <div className="summary-card low">
            <span>Faible</span>
            <strong>4</strong>
          </div>
        </section>
      </div>

      <section className="vuln-section">
        <div className="section-title-row">
          <h2>Vulnérabilités détectées</h2>
          <p>Analyse détaillée des failles identifiées et recommandations.</p>
        </div>
        <div className="vuln-list">
          {vulnerabilities.map((item) => (
            <article key={item.title} className="vuln-card">
              <div className="vuln-header">
                <div>
                  <h3>{item.title}</h3>
                  <span className={`severity-badge ${item.severity.toLowerCase()}`}>{item.severity}</span>
                </div>
                <span className="vuln-endpoint">{item.endpoint}</span>
              </div>
              <p className="vuln-desc">{item.description}</p>
              <div className="recommendation-box">
                <strong>Recommandation</strong>
                <p>{item.recommendation}</p>
              </div>
              <div className="http-snippet">
                <pre>{item.httpSnippet}</pre>
              </div>
              <div className="reference-row">
                <span>Référence OWASP</span>
                <strong>{item.reference}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="two-columns">
        <section className="positives-panel">
          <div className="panel-heading">
            <h2>Points positifs</h2>
            <p>Ce qui est bien configuré et réduit le risque global.</p>
          </div>
          <ul>
            {positives.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>

        <section className="recommendations-panel">
          <div className="panel-heading">
            <h2>Recommandations prioritaires</h2>
            <p>Actions à traiter en priorité pour remédier aux risques critiques.</p>
          </div>
          <ol>
            {recommendations.map((item, index) => (
              <li key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0b1425; color: #eaf0ff; }
        .report-detail-shell { min-height: 100vh; padding: 32px; background: #08101f; display: grid; gap: 28px; }
        .detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 24px 28px; background: #101d32; border: 1px solid rgba(255,255,255,0.06); border-radius: 26px; }
        .eyebrow { margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #8ea6d7; font-size: 0.82rem; }
        h1 { margin: 0; font-size: 2.2rem; line-height: 1.05; }
        .meta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; color: #9ab1d0; font-size: 0.95rem; }
        .download-button { border: none; padding: 14px 22px; background: #185fa5; color: #fff; border-radius: 18px; cursor: pointer; font-weight: 700; }
        .download-button:hover { background: #1f76d4; }
        .top-block { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        .score-card { padding: 28px 24px; background: #111f36; border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; display: grid; place-items: center; gap: 18px; text-align: center; }
        .score-ring { position: relative; width: 112px; height: 112px; }
        .score-value { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
        .score-value strong { font-size: 2.25rem; color: #fff; }
        .score-value span { font-size: 0.92rem; color: #9bb7db; }
        .score-label { color: #a2c5ff; font-size: 1rem; font-weight: 700; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        .summary-card { padding: 22px 20px; border-radius: 22px; background: #111f35; border: 1px solid rgba(255,255,255,0.05); display: grid; gap: 10px; }
        .summary-card span { color: #9ab1d1; text-transform: uppercase; font-size: 0.83rem; letter-spacing: 0.06em; }
        .summary-card strong { font-size: 1.8rem; color: #fff; }
        .summary-card.critical { background: rgba(255, 84, 84, 0.1); border-color: rgba(255,84,84,0.18); }
        .summary-card.high { background: rgba(248, 163, 72, 0.1); border-color: rgba(248,163,72,0.18); }
        .summary-card.medium { background: rgba(105, 143, 233, 0.1); border-color: rgba(105,143,233,0.18); }
        .summary-card.low { background: rgba(98, 167, 131, 0.1); border-color: rgba(98,167,131,0.18); }
        .vuln-section { display: grid; gap: 20px; }
        .section-title-row { display: grid; gap: 8px; }
        .section-title-row h2 { margin: 0; font-size: 1.4rem; }
        .section-title-row p { margin: 0; color: #9eb1d5; }
        .vuln-list { display: grid; gap: 20px; }
        .vuln-card { display: grid; gap: 18px; padding: 24px; border-radius: 26px; background: #101d34; border: 1px solid rgba(255,255,255,0.06); }
        .vuln-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; align-items: center; }
        .vuln-header h3 { margin: 0; font-size: 1.1rem; }
        .severity-badge { padding: 10px 14px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
        .severity-badge.critique { background: rgba(255, 88, 88, 0.16); color: #ff9a9a; }
        .severity-badge.élevée { background: rgba(255, 171, 86, 0.18); color: #ffd39b; }
        .severity-badge.moyenne { background: rgba(110, 146, 222, 0.16); color: #d0dcff; }
        .severity-badge.faible { background: rgba(95, 173, 133, 0.16); color: #bce5c9; }
        .vuln-endpoint { color: #8fa5ce; font-size: 0.95rem; }
        .vuln-desc { margin: 0; color: #ccd7f1; line-height: 1.7; }
        .recommendation-box { padding: 18px 20px; border-radius: 18px; background: rgba(24,95,165,0.12); border: 1px solid rgba(24,95,165,0.2); }
        .recommendation-box strong { display: block; margin-bottom: 8px; color: #d9ecff; }
        .recommendation-box p { margin: 0; color: #d4e3ff; line-height: 1.6; }
        .http-snippet { background: #08101b; border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 18px; overflow-x: auto; }
        .http-snippet pre { margin: 0; font-family: 'Source Code Pro', monospace; font-size: 0.9rem; color: #c8d4f1; white-space: pre-wrap; line-height: 1.5; }
        .reference-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; color: #9ab1d3; font-size: 0.92rem; }
        .reference-row strong { color: #fff; }
        .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .positives-panel, .recommendations-panel { padding: 24px; background: #0f1c34; border-radius: 26px; border: 1px solid rgba(255,255,255,0.05); }
        .panel-heading { display: grid; gap: 8px; margin-bottom: 18px; }
        .panel-heading h2 { margin: 0; font-size: 1.1rem; }
        .panel-heading p { margin: 0; color: #9eb0d4; }
        .positives-panel ul { margin: 0; padding: 0; display: grid; gap: 14px; list-style: none; }
        .positives-panel li { padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,0.03); color: #d8e3ff; }
        .recommendations-panel ol { margin: 0; padding-left: 20px; display: grid; gap: 14px; }
        .recommendations-panel li { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: flex-start; }
        .recommendations-panel li span { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 50%; background: rgba(24,95,165,0.2); color: #c6defd; font-weight: 700; }
        .recommendations-panel li p { margin: 0; color: #d8e3ff; line-height: 1.65; }
        @media (max-width: 1000px) { .top-block { grid-template-columns: 1fr; } .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .two-columns { grid-template-columns: 1fr; } }
        @media (max-width: 700px) { .detail-header { flex-direction: column; align-items: stretch; } .summary-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default ReportDetail;
