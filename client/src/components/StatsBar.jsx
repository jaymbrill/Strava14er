function formatTime(totalSeconds) {
  if (!totalSeconds || totalSeconds === 0) return '0h';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function StatItem({ label, value, sub, color = 'text-co-gold', icon }) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-3 rounded-xl bg-white/5 border border-white/8 min-w-0">
      {icon && <span className="text-2xl mb-1">{icon}</span>}
      <div className={`text-2xl font-bold ${color} leading-none`}>{value}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
      <div className="text-xs text-white/50 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function StatsBar({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const {
    completed, total, totalMiles, totalElevFt,
    totalSeconds, avgHeartrate, fastest, longest,
  } = stats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatItem
        icon="🏔️"
        label="Peaks"
        value={`${completed}/${total}`}
        sub={`${Math.round((completed / total) * 100)}% complete`}
        color="text-co-gold"
      />
      <StatItem
        icon="📏"
        label="Miles Hiked"
        value={parseFloat(totalMiles).toFixed(0)}
        sub="total trail miles"
        color="text-co-sky"
      />
      <StatItem
        icon="📈"
        label="Elevation"
        value={`${(totalElevFt / 1000).toFixed(1)}k`}
        sub="feet gained"
        color="text-green-400"
      />
      <StatItem
        icon="⏱️"
        label="Trail Time"
        value={formatTime(totalSeconds)}
        sub="total elapsed"
        color="text-purple-400"
      />
      {avgHeartrate > 0 && (
        <StatItem
          icon="❤️"
          label="Avg HR"
          value={`${avgHeartrate}`}
          sub="bpm average"
          color="text-red-400"
        />
      )}
      {fastest && (
        <StatItem
          icon="⚡"
          label="Fastest"
          value={formatTime(fastest.elapsed_time)}
          sub={fastest.fourteener_id?.replace(/-/g, ' ')}
          color="text-co-gold"
        />
      )}
      {!avgHeartrate && !fastest && (
        <StatItem
          icon="🎯"
          label="Remaining"
          value={total - completed}
          sub="peaks to go"
          color="text-orange-400"
        />
      )}
      {!fastest && avgHeartrate > 0 && (
        <StatItem
          icon="🎯"
          label="Remaining"
          value={total - completed}
          sub="peaks to go"
          color="text-orange-400"
        />
      )}
    </div>
  );
}
