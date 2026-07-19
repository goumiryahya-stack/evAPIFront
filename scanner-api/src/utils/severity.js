/** Mapping sévérité API (EN) ↔ affichage UI (FR) */
export const SEVERITY_LABELS = {
  critical: 'Critique',
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible',
  info: 'Info',
};

export const SEVERITY_FROM_LABEL = Object.fromEntries(
  Object.entries(SEVERITY_LABELS).map(([k, v]) => [v, k])
);

export const toSeverityLabel = (severity) =>
  SEVERITY_LABELS[severity?.toLowerCase?.()] ?? severity ?? 'Info';

export const scoreLevel = (score) => {
  if (score >= 80) return { label: 'Bon', color: '#3ecf8e' };
  if (score >= 60) return { label: 'Moyen', color: '#f2a94b' };
  return { label: 'Critique', color: '#f87171' };
};

export const scanStatusLabel = (status) => {
  const map = {
    completed: 'Succès',
    running: 'En cours',
    pending: 'En attente',
    error: 'Erreur',
    cancelled: 'Annulé',
  };
  return map[status] ?? status;
};
