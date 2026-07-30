import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

/**
 * ProtectedRoute — Redirige vers /auth si non authentifié
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Le token est vérifié de façon async au montage (AuthContext.initAuth) :
  // ne pas rediriger tant que ce check n'est pas terminé, sinon un rechargement
  // de page (ou un lien direct) déconnecte un utilisateur pourtant valide.
  if (isLoading) {
    return (
      <div className="page-shell">
        <p style={{ color: 'var(--text-secondary)' }}>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <AppLayout />;
};

export default ProtectedRoute;
