import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import PeakCard from '../components/PeakCard';
import ProgressRing from '../components/ProgressRing';
import StatsBar from '../components/StatsBar';
import RangeProgress from '../components/RangeProgress';
import MountainSkyline from '../components/MountainSkyline';
import ManualAdd13erModal from '../components/ManualAdd13erModal';

const RANGES = ['All', 'Sawatch Range', 'Front Range', 'Sangre de Cristo Range', 'Elk Mountains', 'San Juan Mountains', 'Tenmile/Mosquito Range'];
const FILTERS = ['All', 'Completed', 'Not Completed'];
const DIFFICULTIES = ['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4'];
const SORTS = ['Elevation ↓', 'Elevation ↑', 'Name A-Z', 'Date Summited'];

const BG_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/1920px-24701-nature-natural-beauty.jpg';
const BG_FALLBACK = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Longs_Peak_from_Chasm_Lake_Trail.jpg/1920px-Longs_Peak_from_Chasm_Lake_Trail.jpg';

export default function ThirteenerDashboard() {
  const [peaks, setPeaks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);

  // Filters
  const [rangeFilter, setRangeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Elevation ↓');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [peaksRes, statsRes] = await Promise.all([
        axios.get('/api/thirteeners', { withCredentials: true }),
        axios.get('/api/thirteeners/stats/summary', { withCredentials: true }),
      ]);
      setPeaks(peaksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load 13er data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Apply filters + sort
  const filteredPeaks = peaks
    .filter(p => {
      if (rangeFilter !== 'All' && p.range !== rangeFilter) return false;
      if (statusFilter === 'Completed' && !p.completed) return false;
      if (statusFilter === 'Not Completed' && p.completed) return false;
      if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'Elevation ↓': return b.elevation - a.elevation;
        case 'Elevation ↑': return a.elevation - b.elevation;
        case 'Name A-Z': return a.name.localeCompare(b.name);
        case 'Date Summited':
          if (!a.summit && !b.summit) return 0;
          if (!a.summit) return 1;
          if (!b.summit) return -1;
          return new Date(b.summit.summited_at) - new Date(a.summit.summited_at);
        default: return 0;
      }
    });

  const completed = peaks.filter(p => p.completed).length;
  const total = peaks.length;

  // Achievement badges
  const badges = [];
  if (completed >= 1) badges.push({ icon: '🥾', label: 'First 13er' });
  if (completed >= 10) badges.push({ icon: '⛰️', label: '10 Peak Club' });
  if (completed >= 25) badges.push({ icon: '🌟', label: 'Halfway There!' });
  if (completed >= total && total > 0) badges.push({ icon: '🏆', label: '13er Finisher!' });
  if (stats?.byRange) {
    for (const [range, { total: t, completed: c }] of Object.entries(stats.byRange)) {
      if (c === t && t > 0) badges.push({ icon: '🎖️', label: `${range.split(' ')[0]} Complete` });
    }
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0a1628' }}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL}), url(${BG_FALLBACK})` }}
      />
      {/* Dark gradient overlay — slightly cooler blue tint to differentiate from 14ers */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,20,50,0.84) 0%, rgba(5,25,60,0.90) 40%, rgba(0,15,40,0.96) 100%)' }}
      />

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Top hero section */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f2347] to-[#091830] border border-co-blue/20 relative">
            <div className="absolute bottom-0 left-0 right-0 opacity-30 pointer-events-none">
              <MountainSkyline className="w-full h-40" />
            </div>
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Progress ring */}
                <div className="flex-shrink-0">
                  <ProgressRing completed={completed} total={total} size={160} color="#003DA5" />
                </div>

                {/* Text content */}
                <div className="flex-1">
                  {/* 13ers badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-co-blue/20 border border-co-blue/30 text-co-blue text-xs font-bold uppercase tracking-wider mb-3">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Colorado 13ers
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
                    Your 13er Journey
                  </h1>
                  <p className="text-white/50 text-sm mb-4">
                    {completed === 0
                      ? "13er summits are automatically detected when you sync Strava, or add them manually."
                      : completed === total
                      ? "🏆 You've summited all listed Colorado 13ers!"
                      : `${total - completed} peaks left to explore.`}
                  </p>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {badges.map(b => (
                        <span key={b.label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-co-blue/15 text-co-sky border border-co-blue/25 font-semibold">
                          {b.icon} {b.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowManual(true)}
                      className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-xl bg-co-blue text-white font-semibold hover:bg-co-blue/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Manually
                    </button>
                    <div className="text-xs text-white/40 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      13er summits auto-detected when you sync Strava on the 14ers dashboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <StatsBar stats={stats} loading={loading} />

          {/* Range breakdown + peaks grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Sidebar: Range progress */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">By Range</h2>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded shimmer" />)}
                  </div>
                ) : (
                  <RangeProgress byRange={stats?.byRange} />
                )}

                {/* Difficulty legend */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Difficulty</h2>
                  <div className="space-y-1.5">
                    {[
                      { cls: 'Class 1', color: 'bg-green-500', desc: 'Hiking trail' },
                      { cls: 'Class 2', color: 'bg-yellow-500', desc: 'Off-trail scramble' },
                      { cls: 'Class 3', color: 'bg-orange-500', desc: 'Hands required' },
                      { cls: 'Class 4', color: 'bg-red-500', desc: 'Technical climbing' },
                    ].map(d => (
                      <div key={d.cls} className="flex items-center gap-2 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                        <span className="text-white/60"><span className="text-white/80 font-medium">{d.cls}</span> · {d.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 13er info note */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="text-xs text-white/40 leading-relaxed">
                    Showing prominent Colorado 13ers (13,000–13,999 ft) with at least Class 2 approaches. Organized by the same mountain ranges as the 14ers list.
                  </div>
                </div>
              </div>
            </div>

            {/* Main peaks grid */}
            <div className="lg:col-span-3">
              {/* Filter controls */}
              <div className="mb-5 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search peaks…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-co-blue/40"
                  />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-co-blue/40"
                  >
                    {SORTS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Status filter */}
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        statusFilter === f
                          ? 'bg-co-gold text-co-peak border-co-gold font-semibold'
                          : 'bg-white/5 text-white/60 border-white/15 hover:bg-white/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                  <div className="w-px bg-white/15 self-stretch mx-1" />
                  {/* Difficulty filter */}
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => setDiffFilter(d)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        diffFilter === d
                          ? 'bg-co-blue text-white border-co-blue font-semibold'
                          : 'bg-white/5 text-white/60 border-white/15 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {/* Range tabs */}
                <div className="flex flex-wrap gap-2">
                  {RANGES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRangeFilter(r)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        rangeFilter === r
                          ? 'bg-co-blue text-white border-co-blue font-semibold'
                          : 'bg-white/5 text-white/60 border-white/15 hover:bg-white/10'
                      }`}
                    >
                      {r === 'All' ? 'All Ranges' : r.replace(' Range', '').replace(' Mountains', 's')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <div className="text-xs text-white/40 mb-4">
                Showing {filteredPeaks.length} peak{filteredPeaks.length !== 1 ? 's' : ''}
                {filteredPeaks.filter(p => p.completed).length > 0 &&
                  ` · ${filteredPeaks.filter(p => p.completed).length} completed`}
              </div>

              {/* Peaks grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-2xl shimmer" />
                  ))}
                </div>
              ) : filteredPeaks.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <div className="text-5xl mb-4">⛰️</div>
                  <div className="text-lg font-semibold text-white/60 mb-2">No peaks match your filters</div>
                  <button onClick={() => { setRangeFilter('All'); setStatusFilter('All'); setDiffFilter('All'); setSearch(''); }}
                    className="text-sm text-co-blue hover:text-co-sky underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPeaks.map(peak => (
                    <div key={peak.id} className="animate-fade-in">
                      <PeakCard peak={peak} basePath="/thirteener" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {showManual && (
          <ManualAdd13erModal
            peaks={peaks}
            onClose={() => setShowManual(false)}
            onAdded={fetchData}
          />
        )}
      </div>
    </div>
  );
}
