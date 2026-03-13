import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

function formatTime(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPace(movingTime, distanceMeters) {
  if (!movingTime || !distanceMeters || distanceMeters === 0) return '—';
  const miles = distanceMeters / 1609.34;
  const minPerMile = movingTime / 60 / miles;
  const m = Math.floor(minPerMile);
  const s = Math.round((minPerMile - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')} /mi`;
}

function formatMiles(meters) {
  if (!meters) return '—';
  return `${(meters / 1609.34).toFixed(1)} mi`;
}

function formatElevGain(meters) {
  if (!meters) return '—';
  return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
}

const difficultyColors = {
  'Class 1': 'text-green-400 bg-green-400/15 border-green-400/30',
  'Class 2': 'text-yellow-400 bg-yellow-400/15 border-yellow-400/30',
  'Class 3': 'text-orange-400 bg-orange-400/15 border-orange-400/30',
  'Class 4': 'text-red-400 bg-red-400/15 border-red-400/30',
};

function StatBlock({ icon, label, value, sub }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
      <div className="text-xs text-white/50 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function SummitHistoryCard({ summit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this summit record?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/thirteeners/summit/${summit.id}`, { withCredentials: true });
      onDelete(summit.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-semibold text-white">
            {new Date(summit.summited_at).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
          {summit.activity_name && (
            <div className="text-sm text-white/50 mt-0.5">{summit.activity_name}</div>
          )}
          {summit.manual && (
            <span className="text-xs text-white/40 italic">Manually added</span>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400/60 hover:text-red-400 transition-colors p-1.5 hover:bg-red-400/10 rounded-lg"
          title="Delete summit record"
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40">Total Time</div>
          <div className="font-semibold text-white text-sm mt-0.5">{formatTime(summit.elapsed_time)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40">Moving Time</div>
          <div className="font-semibold text-white text-sm mt-0.5">{formatTime(summit.moving_time)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40">Distance</div>
          <div className="font-semibold text-white text-sm mt-0.5">{formatMiles(summit.distance)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40">Pace</div>
          <div className="font-semibold text-white text-sm mt-0.5">{formatPace(summit.moving_time, summit.distance)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40">Elev Gain</div>
          <div className="font-semibold text-white text-sm mt-0.5">{formatElevGain(summit.total_elevation_gain)}</div>
        </div>
        {summit.avg_heartrate && (
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xs text-white/40">Avg HR</div>
            <div className="font-semibold text-red-400 text-sm mt-0.5">{Math.round(summit.avg_heartrate)} bpm</div>
          </div>
        )}
        {summit.max_heartrate && (
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xs text-white/40">Max HR</div>
            <div className="font-semibold text-red-400 text-sm mt-0.5">{Math.round(summit.max_heartrate)} bpm</div>
          </div>
        )}
        {summit.avg_speed && (
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xs text-white/40">Avg Speed</div>
            <div className="font-semibold text-white text-sm mt-0.5">
              {(summit.avg_speed * 2.23694).toFixed(1)} mph
            </div>
          </div>
        )}
      </div>

      {/* Weather */}
      {(summit.weather_conditions || summit.weather_temp_f) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 px-4 py-3 bg-co-blue/10 border border-co-blue/20 rounded-xl text-sm text-white/70">
          <span>🌤️ Summit day weather:</span>
          {summit.weather_conditions && <span className="text-white/90">{summit.weather_conditions}</span>}
          {summit.weather_temp_f && <span>High {Math.round(summit.weather_temp_f)}°F</span>}
          {summit.weather_wind_mph && <span>Wind {Math.round(summit.weather_wind_mph)} mph</span>}
        </div>
      )}

      {/* Notes */}
      {summit.notes && (
        <div className="mt-3 text-sm text-white/60 italic px-4 py-3 bg-white/5 rounded-xl border border-white/8">
          "{summit.notes}"
        </div>
      )}

      {/* Strava link */}
      {summit.strava_activity_id && (
        <div className="mt-3">
          <a
            href={`https://www.strava.com/activities/${summit.strava_activity_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#FC4C02] hover:text-orange-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            View on Strava
          </a>
        </div>
      )}
    </div>
  );
}

export default function ThirteenerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/thirteeners/${id}/history`, { withCredentials: true })
      .then(res => setData(res.data))
      .catch(() => navigate('/thirteeners'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDeleteSummit = (deletedId) => {
    setData(prev => ({ ...prev, history: prev.history.filter(s => s.id !== deletedId) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-co-peak to-[#0a1628]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-64 rounded-3xl shimmer mb-6" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { peak, history } = data;
  const completed = history.length > 0;
  const latest = history[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040f24] via-[#071530] to-[#0a1628]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link to="/thirteeners" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All 13ers
        </Link>

        {/* Hero card */}
        <div className={`rounded-3xl border p-6 sm:p-8 mb-6 relative overflow-hidden
          ${completed
            ? 'bg-gradient-to-br from-co-blue/10 to-white/5 border-co-blue/30'
            : 'bg-white/5 border-white/10'
          }`}
        >
          {/* Background mountain SVG */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 160" className="w-64 h-52">
              <path d="M100 10 L190 150 L10 150 Z" fill="white" />
              <path d="M100 10 L125 55 L100 42 L75 55 Z" fill="white" opacity="0.8" />
              <path d="M20 150 L60 80 L100 150 Z" fill="white" opacity="0.4" />
              <path d="M100 150 L145 70 L190 150 Z" fill="white" opacity="0.3" />
            </svg>
          </div>

          {/* 13er label */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-co-blue/20 border border-co-blue/30 text-co-sky uppercase tracking-wider">
              13er
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              {completed && (
                <span className="flex items-center gap-1 text-sm font-bold text-green-400 bg-green-400/15 px-3 py-1 rounded-full border border-green-400/30">
                  ✓ Summited
                </span>
              )}
              <span className={`text-sm px-3 py-1 rounded-full border font-medium ${difficultyColors[peak.difficulty] || 'text-white/60 bg-white/10 border-white/20'}`}>
                {peak.difficulty}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">{peak.name}</h1>
            <p className="text-white/50 text-base mb-5">{peak.range}</p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-white/40">Elevation</span>
                <div className="text-2xl font-bold text-co-sky font-mono">{peak.elevation.toLocaleString()}′</div>
              </div>
              <div>
                <span className="text-white/40">Best Season</span>
                <div className="text-white font-semibold">{peak.bestSeason}</div>
              </div>
              <div>
                <span className="text-white/40">Trailhead</span>
                <div className="text-white font-semibold text-sm">{peak.trailhead}</div>
              </div>
            </div>

            <p className="mt-5 text-white/60 leading-relaxed max-w-2xl">{peak.description}</p>
          </div>
        </div>

        {/* Quick stats (from latest summit) */}
        {completed && latest && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatBlock icon="⏱️" label="Total Time" value={formatTime(latest.elapsed_time)} sub="elapsed" />
            <StatBlock icon="📏" label="Distance" value={formatMiles(latest.distance)} sub="round trip" />
            <StatBlock icon="📈" label="Elev Gain" value={formatElevGain(latest.total_elevation_gain)} sub="feet" />
            <StatBlock icon="⚡" label="Pace" value={formatPace(latest.moving_time, latest.distance)} sub="moving avg" />
          </div>
        )}

        {/* Summit history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Summit History
              {history.length > 0 && (
                <span className="ml-2 text-sm font-normal text-white/40">{history.length} trip{history.length > 1 ? 's' : ''}</span>
              )}
            </h2>
            {history.length > 1 && (
              <span className="text-xs text-co-sky bg-co-blue/10 px-3 py-1 rounded-full border border-co-blue/20">
                🔁 You've done this {history.length}x!
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <div className="text-5xl mb-4">⛰️</div>
              <div className="text-lg font-semibold text-white/60 mb-2">Not yet summited</div>
              <p className="text-sm max-w-xs mx-auto mb-5">
                Sync your Strava activities from the 14ers dashboard, or add this summit manually.
              </p>
              <Link to="/thirteeners" className="btn-secondary text-sm inline-block">
                ← Back to 13ers
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(summit => (
                <SummitHistoryCard
                  key={summit.id}
                  summit={summit}
                  onDelete={handleDeleteSummit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map link (Google Maps) */}
        <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white text-sm">Summit Coordinates</div>
            <div className="text-white/50 text-sm mt-0.5 font-mono">
              {peak.lat.toFixed(4)}°N, {Math.abs(peak.lng).toFixed(4)}°W
            </div>
          </div>
          <a
            href={`https://www.google.com/maps?q=${peak.lat},${peak.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Map
          </a>
        </div>

        {/* SummitPost / 14ers.com link */}
        <div className="mt-4 text-center">
          <a
            href={`https://www.summitpost.org/search/basic?type=mountain&query=${encodeURIComponent(peak.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-co-sky transition-colors"
          >
            View routes &amp; beta on SummitPost →
          </a>
        </div>
      </main>
    </div>
  );
}
