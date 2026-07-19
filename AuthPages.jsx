import React, { useState } from 'react';

const AuthPages = () => {
  const [view, setView] = useState('login');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const updatePasswordStrength = (value) => {
    const score = Math.min(100, Math.max(0, value.length * 10 + (/[A-Z]/.test(value) ? 10 : 0) + (/[0-9]/.test(value) ? 10 : 0) + (/[^A-Za-z0-9]/.test(value) ? 10 : 0)));
    setPasswordStrength(score);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div>
            <h1>EvAPI</h1>
            <p>Scannez. Détectez. Sécurisez.</p>
          </div>
        </div>

        {view === 'login' && (
          <div className="auth-view">
            <h2>Connexion</h2>
            <label>
              Email
              <input type="email" placeholder="votre@email.com" />
            </label>
            <label>
              Mot de passe
              <input type="password" placeholder="••••••••" />
            </label>
            <button className="primary-button">Se connecter</button>
            <div className="extra-row">
              <button className="text-button" type="button" onClick={() => setView('forgot')}>
                Mot de passe oublié ?
              </button>
            </div>
            <div className="separator">ou</div>
            <button className="oauth-button">Se connecter avec GitHub</button>
            <p className="switch-line">
              Nouveau sur EvAPI ?
              <button className="text-link" type="button" onClick={() => setView('signup')}>
                Inscrivez-vous
              </button>
            </p>
          </div>
        )}

        {view === 'signup' && (
          <div className="auth-view">
            <h2>Inscription</h2>
            <label>
              Nom
              <input type="text" placeholder="Yahia Ben" />
            </label>
            <label>
              Email
              <input type="email" placeholder="votre@email.com" />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => updatePasswordStrength(e.target.value)}
              />
            </label>
            <label>
              Confirmer le mot de passe
              <input type="password" placeholder="••••••••" />
            </label>
            <div className="password-strength">
              <span>Force du mot de passe</span>
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: `${passwordStrength}%` }} />
              </div>
            </div>
            <label className="checkbox-row">
              <input type="checkbox" />
              <span>J’accepte les Conditions générales d’utilisation</span>
            </label>
            <button className="primary-button">Créer mon compte</button>
            <p className="switch-line">
              Déjà inscrit ?
              <button className="text-link" type="button" onClick={() => setView('login')}>
                Se connecter
              </button>
            </p>
          </div>
        )}

        {view === 'forgot' && (
          <div className="auth-view">
            <h2>Mot de passe oublié</h2>
            <label>
              Email
              <input type="email" placeholder="votre@email.com" />
            </label>
            <button className="primary-button">Envoyer le lien de réinitialisation</button>
            <div className="confirmation-box">
              Un lien de réinitialisation sera envoyé à votre adresse si elle est enregistrée.
            </div>
            <p className="switch-line">
              Retour à la connexion ?
              <button className="text-link" type="button" onClick={() => setView('login')}>
                Se connecter
              </button>
            </p>
          </div>
        )}
      </div>

      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1626; color: #eef4ff; }
        .auth-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top, rgba(24,95,165,0.18), transparent 32%), linear-gradient(180deg, #08101f 0%, #08101f 100%); }
        .auth-card { width: min(520px, 100%); background: rgba(15, 28, 52, 0.96); border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; padding: 36px; display: grid; gap: 28px; box-shadow: 0 22px 80px rgba(0, 0, 0, 0.18); }
        .brand-block { display: flex; align-items: center; gap: 18px; }
        .brand-mark { width: 56px; height: 56px; border-radius: 18px; display: grid; place-items: center; background: #185fa5; color: #fff; font-size: 1.4rem; font-weight: 800; }
        .brand-block h1 { margin: 0; font-size: 1.7rem; }
        .brand-block p { margin: 6px 0 0; color: #9db3d7; }
        .auth-view { display: grid; gap: 18px; }
        .auth-view h2 { margin: 0; font-size: 1.65rem; }
        label { display: grid; gap: 10px; color: #d5e1ff; font-weight: 600; }
        input { width: 100%; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: #0f1b33; color: #eef4ff; padding: 16px 18px; font-size: 1rem; outline: none; }
        input::placeholder { color: #7d95b8; }
        .primary-button, .oauth-button, .text-button, .text-link { border: none; cursor: pointer; font-weight: 700; }
        .primary-button { width: 100%; padding: 16px 18px; border-radius: 18px; background: #185fa5; color: #fff; transition: background 0.2s ease, transform 0.2s ease; }
        .primary-button:hover { background: #1f76d4; transform: translateY(-1px); }
        .extra-row { display: flex; justify-content: flex-end; }
        .text-button { background: transparent; color: #8fb3e1; padding: 0; font-size: 0.95rem; }
        .separator { display: flex; align-items: center; gap: 12px; color: #7d96b8; font-size: 0.95rem; }
        .separator::before, .separator::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .oauth-button { width: 100%; padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,0.08); color: #e9f4ff; }
        .oauth-button:hover { background: rgba(255,255,255,0.14); }
        .switch-line { margin: 0; color: #9db6de; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .text-link { background: transparent; color: #9ad1ff; padding: 0; font-size: 0.95rem; }
        .password-strength { display: grid; gap: 10px; }
        .strength-bar { width: 100%; height: 12px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .strength-fill { height: 100%; background: linear-gradient(90deg, #ff7f7f, #f4bf69, #6ccb8c); transition: width 0.25s ease; }
        .checkbox-row { display: flex; align-items: center; gap: 12px; color: #d5e1ff; font-size: 0.95rem; }
        .checkbox-row input { width: 18px; height: 18px; accent-color: #185fa5; }
        .confirmation-box { padding: 18px 20px; border-radius: 18px; background: rgba(24,95,165,0.12); border: 1px solid rgba(24,95,165,0.2); color: #d7e7ff; }
        @media (max-width: 600px) { .auth-card { padding: 26px; } .brand-block { flex-direction: column; align-items: flex-start; } }
      `}</style>
    </div>
  );
};

export default AuthPages;
