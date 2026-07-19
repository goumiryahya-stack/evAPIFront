import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const [view, setView] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [localError, setLocalError] = useState(null);
  const { login, signup, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'password') {
      const score = Math.min(100, value.length * 8 +
        (/[A-Z]/.test(value) ? 12 : 0) +
        (/[0-9]/.test(value) ? 12 : 0) +
        (/[^A-Za-z0-9]/.test(value) ? 16 : 0));
      setPasswordStrength(score);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) navigate('/dashboard');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (form.password !== form.confirm) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }
    const res = await signup(form.name, form.email, form.password);
    if (res.success) navigate('/dashboard');
  };

  const strengthColor = passwordStrength < 40 ? '#ff6b6b' : passwordStrength < 70 ? '#f2a94b' : '#4dc97d';

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark}>E</div>
          <div>
            <h1 className={styles.brandTitle}>EvAPI</h1>
            <p className={styles.brandSub}>Scannez. Détectez. Sécurisez.</p>
          </div>
        </div>

        {/* Login */}
        {view === 'login' && (
          <form className={styles.form} onSubmit={handleLogin}>
            <h2 className={styles.heading}>Connexion</h2>
            {error && <div className={styles.errorBox}>{error}</div>}
            <label className="form-label">
              Email
              <input className="input" type="email" name="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} required />
            </label>
            <label className="form-label">
              Mot de passe
              <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </label>
            <div className={styles.forgotRow}>
              <button type="button" className={styles.linkBtn} onClick={() => setView('forgot')}>
                Mot de passe oublié ?
              </button>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
              {isLoading ? 'Connexion…' : 'Se connecter'}
            </button>
            <div className="separator">ou</div>
            <button type="button" className="btn btn-ghost btn-full">Se connecter avec GitHub</button>
            <p className={styles.switchLine}>
              Nouveau sur EvAPI ?{' '}
              <button type="button" className={styles.linkBtn} onClick={() => setView('signup')}>
                Inscrivez-vous
              </button>
            </p>
          </form>
        )}

        {/* Signup */}
        {view === 'signup' && (
          <form className={styles.form} onSubmit={handleSignup}>
            <h2 className={styles.heading}>Inscription</h2>
            {(error || localError) && <div className={styles.errorBox}>{localError || error}</div>}
            <label className="form-label">
              Nom complet
              <input className="input" type="text" name="name" placeholder="Yahia Ben" value={form.name} onChange={handleChange} required />
            </label>
            <label className="form-label">
              Email
              <input className="input" type="email" name="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} required />
            </label>
            <label className="form-label">
              Mot de passe
              <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </label>
            {form.password && (
              <div className={styles.strengthWrap}>
                <span className={styles.strengthLabel}>Force du mot de passe</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${passwordStrength}%`, background: `linear-gradient(90deg, ${strengthColor}, ${strengthColor}cc)` }} />
                </div>
              </div>
            )}
            <label className="form-label">
              Confirmer le mot de passe
              <input className="input" type="password" name="confirm" placeholder="••••••••" value={form.confirm} onChange={handleChange} required />
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" required />
              <span>J'accepte les Conditions générales d'utilisation</span>
            </label>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
              {isLoading ? 'Création…' : 'Créer mon compte'}
            </button>
            <p className={styles.switchLine}>
              Déjà inscrit ?{' '}
              <button type="button" className={styles.linkBtn} onClick={() => setView('login')}>
                Se connecter
              </button>
            </p>
          </form>
        )}

        {/* Forgot password */}
        {view === 'forgot' && (
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <h2 className={styles.heading}>Mot de passe oublié</h2>
            <label className="form-label">
              Email
              <input className="input" type="email" name="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} required />
            </label>
            <button type="submit" className="btn btn-primary btn-full">
              Envoyer le lien de réinitialisation
            </button>
            <div className={styles.confirmBox}>
              Un lien de réinitialisation sera envoyé à votre adresse si elle est enregistrée.
            </div>
            <p className={styles.switchLine}>
              <button type="button" className={styles.linkBtn} onClick={() => setView('login')}>
                ← Retour à la connexion
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
