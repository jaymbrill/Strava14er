import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import PeakCard from '../components/PeakCard';
import ProgressRing from '../components/ProgressRing';
import StatsBar from '../components/StatsBar';
import RangeProgress from '../components/RangeProgress';
import ManualAddModal from '../components/ManualAddModal';
import MountainSkyline from '../components/MountainSkyline';

const RANGES = ['All', 'Sawatch Range', 'Front Range', 'Sangre de Cristo Range', 'Elk Mountains', 'San Juan Mountains', 'Tenmile/Mosquito Range'];
const FILTERS = ['All', 'Completed', 'Not Completed'];
const DIFFICULTIES = ['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4'];
const SORTS = ['Elevation ↓', 'Elevation ↑', 'Name A-Z', 'Date Summited'];

const DEFAULT_BG = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Longs_Peak_from_Chasm_Lake_Trail.jpg/1920px-Longs_Peak_from_Chasm_Lake_Trail.jpg') center/cover no-repeat fixed";

export default function Dashboard() {
  const [peaks, setPeaks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [bgImage, setBgImage] = useState(null); // null = use default

  // Filters
  const [rangeFilter, setRangeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Elevation ↓');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [peaksRes, statsRes, bgRes] = await Promise.all([
        axios.get('/api/fourteeners', { withCredentials: true }),
        axios.get('/api/fourteeners/stats/summary', { withCredentials: true }),
        axios.get('/api/settings/background', { withCredentials: true }),
      ]);
      setPeaks(peaksRes.data);
      setStats(statsRes.data);
      setBgImage(bgRes.data.backgroundImage || null);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.put('/api/settings/background', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBgImage(res.data.backgroundImage);
    } catch (err) {
      console.error('Background upload failed:', err);
    }
  };

  const handleBgReset = async () => {
    await axios.delete('/api/settings/background', { withCredentials: true });
    setBgImage(null);
  };

  const bgStyle = bgImage
    ? `url('${bgImage}') center/cover no-repeat fixed`
    : DEFAULT_BG;

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await axios.post('/api/activities/sync', {}, { withCredentials: true });
      setSyncResult(res.data);
      await fetchData();
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

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
  if (completed >= 1) badges.push({ icon: '🥾', label: 'First Summit' });
  if (completed >= 10) badges.push({ icon: '⛰️', label: '10 Peak Club' });
  if (completed >= 25) badges.push({ icon: '🌟', label: 'Halfway There!' });
  if (completed >= 50) badges.push({ icon: '🦅', label: 'Colorado Legend' });
  if (completed >= 58) badges.push({ icon: '🏆', label: 'Fourteener Finisher!' });
  // Range completions
  if (stats?.byRange) {
    for (const [range, { total: t, completed: c }] of Object.entries(stats.byRange)) {
      if (c === t && t > 0) badges.push({ icon: '🎖️', label: `${range.split(' ')[0]} Complete` });
    }
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: [
          'linear-gradient(to bottom, rgba(10,22,40,0.82) 0%, rgba(15,30,53,0.88) 40%, rgba(10,22,40,0.95) 100%)',
          bgStyle,
        ].join(', '),
        backgroundColor: '#0a1628',
      }}
    >
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Top hero section */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a2d4f] to-[#0f1e35] border border-white/10 relative">
          <div className="absolute bottom-0 left-0 right-0 opacity-30 pointer-events-none">
            <MountainSkyline className="w-full h-40" />
          </div>
          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Progress ring */}
              <div className="flex-shrink-0">
                <ProgressRing completed={completed} total={total} size={160} />
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
                  Your 14er Journey
                </h1>
                <p className="text-white/50 text-sm mb-4">
                  {completed === 0
                    ? "Sync your Strava activities to detect your summits automatically."
                    : completed === total
                    ? "🏆 You've summited all 58 Colorado Fourteeners!"
                    : `${total - completed} peaks left to complete your Colorado quest.`}
                </p>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {badges.map(b => (
                      <span key={b.label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-co-gold/15 text-co-gold border border-co-gold/25 font-semibold">
                        {b.icon} {b.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="btn-primary flex items-center gap-2 text-sm py-2.5"
                  >
                    {syncing ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Syncing…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync Strava
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowManual(true)}
                    className="btn-secondary text-sm py-2.5 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Manually
                  </button>

                  {/* Background photo controls */}
                  <label
                    className="btn-secondary text-sm py-2.5 flex items-center gap-2 cursor-pointer"
                    title="Upload a custom background photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Change Background
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBgUpload}
                    />
                  </label>
                  {bgImage && (
                    <button
                      onClick={handleBgReset}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                      title="Restore default Longs Peak photo"
                    >
                      Reset photo
                    </button>
                  )}
                </div>

                {/* Sync result */}
                {syncResult && !syncing && (
                  <div className={`mt-3 text-sm px-4 py-2.5 rounded-xl border ${
                    syncResult.error
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-green-500/15 border-green-500/30 text-green-400'
                  }`}>
                    {syncResult.error ? (
                      syncResult.error
                    ) : (
                      <>
                        ✓ Scanned {syncResult.activitiesScanned} activities.
                        {syncResult.newSummits > 0
                          ? ` Found ${syncResult.newSummits} new summit${syncResult.newSummits > 1 ? 's' : ''}: ${syncResult.summitsFound.join(', ')}!`
                          : ' No new summits found.'}
                      </>
                    )}
                  </div>
                )}
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
                  className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-co-gold/40"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-co-gold/40"
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
                        ? 'bg-co-red text-white border-co-red font-semibold'
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
                <div className="text-5xl mb-4">🏔️</div>
                <div className="text-lg font-semibold text-white/60 mb-2">No peaks match your filters</div>
                <button onClick={() => { setRangeFilter('All'); setStatusFilter('All'); setDiffFilter('All'); setSearch(''); }}
                  className="text-sm text-co-gold hover:text-co-gold/80 underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPeaks.map(peak => (
                  <div key={peak.id} className="animate-fade-in">
                    <PeakCard peak={peak} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showManual && (
        <ManualAddModal
          peaks={peaks}
          onClose={() => setShowManual(false)}
          onAdded={fetchData}
        />
      )}
    </div>
  );
}
