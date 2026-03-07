const RANGE_COLORS = {
  'Sawatch Range': '#4A90D9',
  'Front Range': '#FFC72C',
  'Sangre de Cristo Range': '#BF0A30',
  'Elk Mountains': '#4ade80',
  'San Juan Mountains': '#a78bfa',
  'Tenmile/Mosquito Range': '#fb923c',
};

export default function RangeProgress({ byRange }) {
  if (!byRange) return null;

  const ranges = Object.entries(byRange).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-3">
      {ranges.map(([range, { total, completed }]) => {
        const pct = total > 0 ? (completed / total) * 100 : 0;
        const color = RANGE_COLORS[range] || '#9ca3af';
        return (
          <div key={range}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/80">{range}</span>
              <span className="text-sm font-semibold" style={{ color }}>
                {completed}/{total}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
