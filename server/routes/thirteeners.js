const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { OFFICIAL_THIRTEENERS } = require('../data/thirteeners');

const router = express.Router();

// Get all 13ers with completion status for current user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const [summitRes, countRes] = await Promise.all([
      pool.query(
        `SELECT DISTINCT ON (thirteener_id)
          thirteener_id, id, strava_activity_id, activity_name, summited_at,
          elapsed_time, moving_time, distance, total_elevation_gain,
          avg_heartrate, max_heartrate, avg_speed, manual, notes,
          weather_temp_f, weather_wind_mph, weather_conditions,
          trailhead_name, route_name
         FROM thirteener_summits
         WHERE user_id = $1
         ORDER BY thirteener_id, summited_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT thirteener_id, COUNT(*) AS summit_count
         FROM thirteener_summits WHERE user_id = $1
         GROUP BY thirteener_id`,
        [userId]
      ),
    ]);

    const summitMap = {};
    for (const s of summitRes.rows) {
      summitMap[s.thirteener_id] = s;
    }
    const countMap = {};
    for (const c of countRes.rows) {
      countMap[c.thirteener_id] = parseInt(c.summit_count, 10);
    }

    const peaks = OFFICIAL_THIRTEENERS.map(peak => ({
      ...peak,
      completed: !!summitMap[peak.id],
      summit: summitMap[peak.id] || null,
      summitCount: countMap[peak.id] || 0,
    }));

    res.json(peaks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all summit history for a specific 13er
router.get('/:id/history', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM thirteener_summits WHERE user_id=$1 AND thirteener_id=$2 ORDER BY summited_at DESC`,
      [userId, id]
    );
    const peak = OFFICIAL_THIRTEENERS.find(p => p.id === id);
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
      pool.query(
        `SELECT COUNT(DISTINCT thirteener_id) AS completed FROM thirteener_summits WHERE user_id=$1`,
        [userId]
      ),
      pool.query(
        `SELECT
          COALESCE(SUM(distance) / 1000 * 0.621371, 0) AS total_miles,
          COALESCE(SUM(total_elevation_gain) * 3.28084, 0) AS total_elev_ft,
          COALESCE(SUM(elapsed_time), 0) AS total_seconds,
          COALESCE(SUM(moving_time), 0) AS total_moving_seconds,
          COALESCE(AVG(avg_heartrate), 0) AS avg_hr,
          COALESCE(MAX(total_elevation_gain) * 3.28084, 0) AS max_elev_gain_ft
         FROM thirteener_summits WHERE user_id=$1`,
        [userId]
      ),
      pool.query(
        `SELECT thirteener_id, activity_name, elapsed_time, summited_at, distance
         FROM thirteener_summits WHERE user_id=$1 AND elapsed_time IS NOT NULL AND distance > 0
         ORDER BY elapsed_time ASC LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT thirteener_id, activity_name, elapsed_time, summited_at
         FROM thirteener_summits WHERE user_id=$1 AND elapsed_time IS NOT NULL
         ORDER BY elapsed_time DESC LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT thirteener_id FROM thirteener_summits WHERE user_id=$1`,
        [userId]
      ),
    ]);

    const completedIds = new Set(rangeSummary.rows.map(r => r.thirteener_id));
    const rangeMap = {};
    for (const peak of OFFICIAL_THIRTEENERS) {
      if (!rangeMap[peak.range]) {
        rangeMap[peak.range] = { total: 0, completed: 0 };
      }
      rangeMap[peak.range].total++;
      if (completedIds.has(peak.id)) rangeMap[peak.range].completed++;
    }

    res.json({
      completed: parseInt(summitCount.rows[0].completed, 10),
      total: OFFICIAL_THIRTEENERS.length,
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

// Manually add a 13er summit
router.post('/summit/manual', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { thirteenerId, summitedAt, notes } = req.body;

  if (!thirteenerId || !summitedAt) {
    return res.status(400).json({ error: 'thirteenerId and summitedAt required' });
  }

  const peak = OFFICIAL_THIRTEENERS.find(p => p.id === thirteenerId);
  if (!peak) return res.status(404).json({ error: 'Peak not found' });

  try {
    // Fetch weather for the summit date
    let weather = null;
    try {
      const axios = require('axios');
      const dateStr = new Date(summitedAt).toISOString().split('T')[0];
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${peak.lat}&longitude=${peak.lng}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,windspeed_10m_max,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FDenver`;
      const res2 = await axios.get(url, { timeout: 5000 });
      const d = res2.data.daily;
      if (d && d.temperature_2m_max?.[0]) {
        const weatherCodes = {
          0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
          45: 'Foggy', 51: 'Drizzle', 61: 'Rain', 71: 'Snow',
          80: 'Showers', 95: 'Thunderstorm',
        };
        weather = {
          tempHighF: d.temperature_2m_max[0],
          windMph: d.windspeed_10m_max[0],
          conditions: weatherCodes[d.weathercode[0]] || 'Unknown',
        };
      }
    } catch { /* weather is optional */ }

    await pool.query(
      `INSERT INTO thirteener_summits (user_id, thirteener_id, summited_at, manual, notes,
        weather_temp_f, weather_wind_mph, weather_conditions)
       VALUES ($1,$2,$3,TRUE,$4,$5,$6,$7)`,
      [
        userId, thirteenerId, new Date(summitedAt), notes || null,
        weather?.tempHighF || null, weather?.windMph || null, weather?.conditions || null,
      ]
    );
    res.json({ success: true, peak: peak.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add summit', details: err.message });
  }
});

// Delete a 13er summit record
router.delete('/summit/:id', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const summitId = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM thirteener_summits WHERE id=$1 AND user_id=$2', [summitId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
