import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MountainSkyline from '../components/MountainSkyline';

const PEAKS = [
  'Mount Elbert', 'Longs Peak', 'Pikes Peak', 'Maroon Bells',
  'Capitol Peak', 'Mount Sneffels', 'Crestone Needle', 'Uncompahgre Peak',
];

function Snowflake({ style }) {
  return (
    <div className="absolute text-white/20 snow-drift select-none pointer-events-none" style={style}>
      ❄
    </div>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages = {
    strava_denied: 'Strava authorization was denied. Please try again.',
    auth_failed: 'Something went wrong during sign-in. Please try again.',
  };

  const snowflakes = Array.from({ length: 12 }, (_, i) => ({
    left: `${(i * 8.3) % 100}%`,
    fontSize: `${0.8 + (i % 3) * 0.4}rem`,
    animationDelay: `${i * 0.7}s`,
    animationDuration: `${7 + (i % 4) * 2}s`,
  }));

  return (
    <div className="min-h-screen bg-mountain-gradient relative overflow-hidden flex flex-col">
      {/* Snowflakes */}
      {snowflakes.map((style, i) => <Snowflake key={i} style={style} />)}

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: 0.3 + Math.random() * 0.5,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 32" className="w-10 h-8" fill="none">
            <path d="M20 2 L38 30 L2 30 Z" fill="#FFC72C" />
            <path d="M20 2 L28 14 L20 10 L14 16 L20 2Z" fill="white" opacity="0.9" />
          </svg>
          <div>
            <div className="font-display text-co-gold font-bold text-lg leading-none">Colorado</div>
            <div className="text-xs text-white/50 uppercase tracking-widest">14er Tracker</div>
          </div>
        </div>
        {/* Colorado flag stripes */}
        <div className="flex items-center gap-0.5 h-5 opacity-70">
          <div className="w-10 h-full bg-co-blue rounded-sm" />
          <div className="w-2 h-full bg-co-gold rounded-sm" />
          <div className="w-10 h-full bg-co-red rounded-sm" />
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pb-32">
        {error && (
          <div className="mb-6 max-w-md px-5 py-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm animate-fade-in">
            {errorMessages[error] || 'An error occurred.'}
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-co-gold/15 border border-co-gold/30 text-co-gold text-sm font-semibold mb-8 animate-fade-in">
          🏔️ 58 Peaks. One Quest.
        </div>

        <h1 className="text-5xl sm:text-7xl font-display font-bold text-white leading-tight mb-4 animate-slide-up">
          Conquer<br />
          <span className="text-co-gold">Colorado's</span><br />
          Highest Peaks
        </h1>

        <p className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Connect your Strava account to automatically track which Colorado Fourteeners you've summited —
          with pace, elevation, weather, and more.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <a
            href="/auth/strava"
            className="btn-strava text-lg"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Connect with Strava
          </a>
          <span className="text-white/30 text-sm">Free · No credit card · Read-only access</span>
        </div>

        {/* Peak ticker */}
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Includes all 58 official Colorado Fourteeners</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {PEAKS.map(peak => (
              <span key={peak} className="text-xs px-3 py-1 rounded-full bg-white/8 text-white/50 border border-white/10">
                {peak}
              </span>
            ))}
            <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/30 border border-white/8">
              + 50 more…
            </span>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 max-w-3xl w-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {[
            { icon: '⚡', title: 'Auto-detect summits', desc: 'GPS polyline matching finds your 14er summits from any Strava hike or run.' },
            { icon: '📊', title: 'Rich stats', desc: 'Pace, elevation gain, heart rate, time, and summit-day weather for every peak.' },
            { icon: '🗺️', title: 'Progress by range', desc: 'Track how many peaks you\'ve bagged in each mountain range.' },
          ].map(f => (
            <div key={f.title} className="card text-left">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{f.title}</div>
              <div className="text-xs text-white/50">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <MountainSkyline className="w-full h-64 sm:h-80" />
      </div>
    </div>
  );
}
