import React from 'react';

/**
 * ScorePill — Affiche un score coloré selon sa valeur
 * Props: score (number), size ('sm' | 'md' | 'lg')
 */
const ScorePill = ({ score, size = 'md' }) => {
  const getClass = () => {
    if (score >= 75) return 'badge-success';
    if (score >= 50) return 'badge-warning';
    return 'badge-danger';
  };

  const sizeStyle = {
    sm: { padding: '5px 10px', fontSize: '0.8rem' },
    md: { padding: '8px 14px', fontSize: '0.88rem', minWidth: '52px', justifyContent: 'center' },
    lg: { padding: '10px 18px', fontSize: '1rem', minWidth: '64px', justifyContent: 'center' },
  };

  return (
    <span
      className={`badge ${getClass()}`}
      style={{ display: 'inline-flex', ...sizeStyle[size] }}
    >
      {score}
    </span>
  );
};

export default ScorePill;
