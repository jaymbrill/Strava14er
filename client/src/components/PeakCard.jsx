import { Link } from 'react-router-dom';

function formatTime(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPace(movingTimeSec, distanceMeters) {
  if (!movingTimeSec || !distanceMeters || distanceMeters === 0) return '—';
  const miles = distanceMeters / 1609.34;
  const minPerMile = movingTimeSec / 60 / miles;
  const m = Math.floor(minPerMile);
  const s = Math.round((minPerMile - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')} /mi`;
}

function MountainSVG({ completed, difficulty }) {
  const color = completed
    ? difficulty === 'Class 4' ? '#BF0A30' :
      difficulty === 'Class 3' ? '#FFC72C' : '#4ade80'
    : 'rgba(255,255,255,0.15)';

  return (
    <svg viewBox="0 0 60 50" className="w-14 h-12" fill="none">
      {/* Main peak */}
      <path d="M30 4 L56 46 L4 46 Z" fill={color} opacity={completed ? 0.9 : 0.3} />
      {/* Snow cap */}
      {completed && (
        <path d="M30 4 L38 18 L30 14 L22 18 Z" fill="white" opacity="0.85" />
      )}
      {/* Second smaller peak */}
      <path d="M10 46 L22 26 L34 46 Z" fill={completed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'} />
      {/* Third peak */}
      <path d="M40 46 L50 30 L60 46 Z" fill={completed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'} />
    </svg>
  );
}

const difficultyColors = {
  'Class 1': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Class 2': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Class 3': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Class 4': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Class 5': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function PeakCard({ peak }) {
  const { id, name, elevation, range, difficulty, completed, summit, trailhead } = peak;
  const elevFt = elevation.toLocaleString();

  return (
    <Link
      to={`/peak/${id}`}
      className={`block rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl overflow-hidden
        ${completed
          ? 'bg-gradient-to-br from-white/8 to-white/4 border-co-gold/30 hover:border-co-gold/60'
          : 'bg-white/3 border-white/8 hover:border-white/20'
        }`}
    >
      {/* Top section */}
      <div className={`px-4 pt-4 pb-3 ${completed ? 'bg-gradient-to-b from-co-gold/5 to-transparent' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <MountainSVG completed={completed} difficulty={difficulty} />
          <div className="flex flex-col items-end gap-1.5">
            {completed && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-400/15 px-2 py-0.5 rounded-full border border-green-400/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Summited
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[difficulty] || 'bg-white/10 text-white/60 border-white/20'}`}>
              {difficulty}
            </span>
          </div>
        </div>

        <h3 className={`mt-2 font-bold text-base leading-tight ${completed ? 'text-white' : 'text-white/70'}`}>
          {name}
        </h3>
        <p className="text-xs text-white/40 mt-0.5">{range}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm font-mono font-semibold ${completed ? 'text-co-gold' : 'text-white/40'}`}>
            {elevFt}′
          </span>
          <span className="text-white/20 text-xs">elev</span>
        </div>
      </div>

      {/* Summit stats */}
      {completed && summit && (
        <div className="px-4 pb-4 border-t border-white/8 pt-3">
          <div className="text-xs text-white/40 mb-2">
            {new Date(summit.summited_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
            {summit.manual && <span className="ml-2 text-white/30 italic">manual</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg px-2 py-1.5">
              <div className="text-xs text-white/40">Time</div>
              <div className="text-xs font-semibold text-white/80">{formatTime(summit.elapsed_time)}</div>
            </div>
            <div className="bg-white/5 rounded-lg px-2 py-1.5">
              <div className="text-xs text-white/40">Pace</div>
              <div className="text-xs font-semibold text-white/80">{formatPace(summit.moving_time, summit.distance)}</div>
            </div>
            {summit.total_elevation_gain && (
              <div className="bg-white/5 rounded-lg px-2 py-1.5">
                <div className="text-xs text-white/40">Gain</div>
                <div className="text-xs font-semibold text-white/80">
                  {Math.round(summit.total_elevation_gain * 3.28084).toLocaleString()}′
                </div>
              </div>
            )}
            {summit.avg_heartrate && (
              <div className="bg-white/5 rounded-lg px-2 py-1.5">
                <div className="text-xs text-white/40">Avg HR</div>
                <div className="text-xs font-semibold text-white/80">{Math.round(summit.avg_heartrate)} bpm</div>
              </div>
            )}
          </div>
          {(summit.route_name || summit.trailhead_name) && (
            <div className="mt-2 text-xs text-white/40 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {summit.route_name || summit.trailhead_name}
            </div>
          )}
          {summit.weather_conditions && (
            <div className="mt-1 text-xs text-white/40">
              🌤 {summit.weather_conditions}
              {summit.weather_temp_f && ` · ${Math.round(summit.weather_temp_f)}°F`}
              {summit.weather_wind_mph && ` · ${Math.round(summit.weather_wind_mph)} mph wind`}
            </div>
          )}
        </div>
      )}

      {/* Not summited placeholder */}
      {!completed && (
        <div className="px-4 pb-4 text-xs text-white/25 italic">Not yet summited</div>
      )}
    </Link>
  );
}
