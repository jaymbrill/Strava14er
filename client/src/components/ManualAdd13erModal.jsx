import { useState } from 'react';
import axios from 'axios';

export default function ManualAdd13erModal({ peaks, onClose, onAdded }) {
  const [selectedPeak, setSelectedPeak] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sortedPeaks = [...peaks].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeak || !date) {
      setError('Please select a peak and date.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(
        '/api/thirteeners/summit/manual',
        { thirteenerId: selectedPeak, summitedAt: date, notes },
        { withCredentials: true }
      );
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add summit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-co-peak border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-1">Add 13er Summit Manually</h2>
        <p className="text-sm text-white/50 mb-5">
          Summited without Strava, or want to log an ascent? Add it here.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Peak</label>
            <select
              value={selectedPeak}
              onChange={e => setSelectedPeak(e.target.value)}
              className="w-full bg-white border border-white/20 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-co-blue/60"
            >
              <option value="">Select a 13er…</option>
              {sortedPeaks.map(p => (
                <option key={p.id} value={p.id}>
                  {p.completed ? '✓ ' : ''}{p.name} — {p.elevation.toLocaleString()}′
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Summit Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-white border border-white/20 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-co-blue/60"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Route taken, conditions, memories…"
              rows={3}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-co-blue/50 focus:bg-white/12 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-co-blue text-white font-semibold hover:bg-co-blue/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding…' : 'Add Summit ⛰️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
