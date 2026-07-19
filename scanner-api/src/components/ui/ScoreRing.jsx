import React from 'react';

/**
 * ScoreRing — SVG ring affichant un score
 * Props: score (number 0-100), size (number px), strokeWidth (number)
 */
const ScoreRing = ({ score, size = 80, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return '#4dc97d';
    if (score >= 50) return '#f2a94b';
    return '#ff6b6b';
  };

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx} cy={cy} r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={cx} cy={cy} r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', placeItems: 'center', textAlign: 'center',
      }}>
        <div>
          <strong style={{ display: 'block', fontSize: size * 0.25 + 'px', color: '#fff', lineHeight: 1 }}>{score}</strong>
          <span style={{ fontSize: size * 0.14 + 'px', color: 'var(--text-secondary)' }}>/100</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreRing;
