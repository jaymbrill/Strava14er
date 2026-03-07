const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { OFFICIAL_FOURTEENERS } = require('../data/fourteeners');

const router = express.Router();

// Get all 14ers with completion status for current user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    // Get all summits for this user
    const summitRes = await pool.query(
      `SELECT DISTINCT ON (fourteener_id)
        fourteener_id, id, strava_activity_id, activity_name, summited_at,
        elapsed_time, moving_time, distance, total_elevation_gain,
        avg_heartrate, max_heartrate, avg_speed, manual, notes,
        weather_temp_f, weather_wind_mph, weather_conditions
       FROM summits
       WHERE user_id = $1
       ORDER BY fourteener_id, summited_at DESC`,
      [userId]
    );

    const summitMap = {};
    for (const s of summitRes.rows) {
      summitMap[s.fourteener_id] = s;
    }

    const peaks = OFFICIAL_FOURTEENERS.map(peak => ({
      ...peak,
      completed: !!summitMap[peak.id],
      summit: summitMap[peak.id] || null,
    }));

    res.json(peaks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all summit history for a specific peak
router.get('/:id/history', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM summits WHERE user_id=$1 AND fourteener_id=$2 ORDER BY summited_at DESC`,
      [userId, id]
    );
    const peak = OFFICIAL_FOURTEENERS.find(p => p.id === id);
    if (!peak) return res.status(404).json({ error: 'Peak not found' });

    res.json({ peak, history: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get summary stats for current user
router.get('/stats/summary', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const [summitCount, totals, fastest, slowest, rangeSummary] = await Promise.all([
      // Distinct peaks completed
      pool.query(
        `SELECT COUNT(DISTINCT fourteener_id) AS completed FROM summits WHERE user_id=$1`,
        [userId]
      ),
      // Aggregate totals
      pool.query(
        `SELECT
          COALESCE(SUM(distance) / 1000 * 0.621371, 0) AS total_miles,
          COALESCE(SUM(total_elevation_gain) * 3.28084, 0) AS total_elev_ft,
          COALESCE(SUM(elapsed_time), 0) AS total_seconds,
          COALESCE(SUM(moving_time), 0) AS total_moving_seconds,
          COALESCE(AVG(avg_heartrate), 0) AS avg_hr,
          COALESCE(MAX(total_elevation_gain) * 3.28084, 0) AS max_elev_gain_ft
         FROM summits WHERE user_id=$1`,
        [userId]
      ),
      // Fastest summit (least elapsed time with distance)
      pool.query(
        `SELECT fourteener_id, activity_name, elapsed_time, summited_at, distance
         FROM summits WHERE user_id=$1 AND elapsed_time IS NOT NULL AND distance > 0
         ORDER BY elapsed_time ASC LIMIT 1`,
        [userId]
      ),
      // Longest/slowest outing
      pool.query(
        `SELECT fourteener_id, activity_name, elapsed_time, summited_at
         FROM summits WHERE user_id=$1 AND elapsed_time IS NOT NULL
         ORDER BY elapsed_time DESC LIMIT 1`,
        [userId]
      ),
      // Peaks by range
      pool.query(
        `SELECT fourteener_id FROM summits WHERE user_id=$1`,
        [userId]
      ),
    ]);

    // Build range breakdown
    const completedIds = new Set(rangeSummary.rows.map(r => r.fourteener_id));
    const rangeMap = {};
    for (const peak of OFFICIAL_FOURTEENERS) {
      if (!rangeMap[peak.range]) {
        rangeMap[peak.range] = { total: 0, completed: 0 };
      }
      rangeMap[peak.range].total++;
      if (completedIds.has(peak.id)) rangeMap[peak.range].completed++;
    }

    res.json({
      completed: parseInt(summitCount.rows[0].completed, 10),
      total: OFFICIAL_FOURTEENERS.length,
      totalMiles: parseFloat(totals.rows[0].total_miles || 0).toFixed(1),
      totalElevFt: Math.round(totals.rows[0].total_elev_ft || 0),
      totalSeconds: parseInt(totals.rows[0].total_seconds || 0, 10),
      totalMovingSeconds: parseInt(totals.rows[0].total_moving_seconds || 0, 10),
      avgHeartrate: Math.round(totals.rows[0].avg_hr || 0),
      maxElevGainFt: Math.round(totals.rows[0].max_elev_gain_ft || 0),
      fastest: fastest.rows[0] || null,
      longest: slowest.rows[0] || null,
      byRange: rangeMap,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
