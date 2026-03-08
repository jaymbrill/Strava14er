import { useState } from 'react';
import axios from 'axios';

export default function ManualAddModal({ peaks, onClose, onAdded }) {
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
        '/api/activities/summit/manual',
        { fourteenerId: selectedPeak, summitedAt: date, notes },
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
        <h2 className="text-xl font-bold text-white mb-1">Add Summit Manually</h2>
        <p className="text-sm text-white/50 mb-5">
          Summited without Strava, or want to log another ascent? Add it here.
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
              style={{ colorScheme: 'dark' }}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-co-gold/50 focus:bg-white/12"
            >
              <option value="" className="bg-gray-900">Select a peak…</option>
              {sortedPeaks.map(p => (
                <option key={p.id} value={p.id} className="bg-gray-900">
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
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-co-gold/50 focus:bg-white/12"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Route taken, conditions, memories…"
              rows={3}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-co-gold/50 focus:bg-white/12 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Adding…' : 'Add Summit 🏔️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
