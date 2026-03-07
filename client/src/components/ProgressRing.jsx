export default function ProgressRing({ completed, total, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;
  const offset = circumference - pct * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={10}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFC72C"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,199,44,0.6))' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-4xl font-bold text-co-gold leading-none">{completed}</div>
        <div className="text-sm text-white/50 mt-1">of {total}</div>
        <div className="text-xs text-co-gold/70 mt-0.5">{Math.round(pct * 100)}%</div>
      </div>
    </div>
  );
}
