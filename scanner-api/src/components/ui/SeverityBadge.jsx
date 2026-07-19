import React from 'react';
import { toSeverityLabel } from '../../utils/severity';

const severityMap = {
  Critique: 'badge-critical',
  Élevée: 'badge-high',
  Moyenne: 'badge-medium',
  Faible: 'badge-low',
  Info: 'badge-info',
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  info: 'badge-info',
};

const SeverityBadge = ({ severity }) => {
  const label = toSeverityLabel(severity);
  const cls = severityMap[severity] ?? severityMap[label] ?? 'badge-info';
  return <span className={`badge ${cls}`}>{label}</span>;
};

export default SeverityBadge;
