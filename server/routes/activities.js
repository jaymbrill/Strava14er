const express = require('express');
const axios = require('axios');
const polyline = require('@mapbox/polyline');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { OFFICIAL_FOURTEENERS } = require('../data/fourteeners');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SUMMIT_RADIUS_METERS = 400; // within 400m of summit coords = summited
const TRIP_WINDOW_DAYS = 3;       // look ±3 days around summit for related activities

// For peaks with tripRadiusKm set (e.g. train-access Needleton peaks), scan allActivities
// for approach/return day activities in the same geographic area and time window,
// then concatenate their elapsed/moving times to produce a total trip duration.
function findTripActivities(summitActivity, allActivities, peak) {
  if (!peak.tripRadiusKm) return [summitActivity];
  const tripRadiusMeters = peak.tripRadiusKm * 1000;
  const summitDate = new Date(summitActivity.start_date);
  const windowMs = TRIP_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return allActivities.filter(a => {
    if (a.id === summitActivity.id) return true; // always include the summit activity itself
    if (Math.abs(new Date(a.start_date) - summitDate) > windowMs) return false;
    if (!a.map?.summary_polyline) return false;
    try {
      const pts = polyline.decode(a.map.summary_polyline);
      return pts.some(([lat, lng]) =>
        haversineMeters(lat, lng, peak.lat, peak.lng) < tripRadiusMeters
      );
    } catch { return false; }
  });
}

function findMatchedPeaks(activityPolyline) {
  if (!activityPolyline) return [];
  let points;
  try {
    points = polyline.decode(activityPolyline); // [[lat, lng], ...]
  } catch {
    return [];
  }

  const matched = [];
  for (const peak of OFFICIAL_FOURTEENERS) {
    let closest = Infinity;
    for (const [lat, lng] of points) {
      const d = haversineMeters(lat, lng, peak.lat, peak.lng);
      if (d < closest) closest = d;
      if (d < SUMMIT_RADIUS_METERS) break; // early exit
    }
    if (closest < SUMMIT_RADIUS_METERS) {
      matched.push({ peak, distanceMeters: closest });
    }
  }
  return matched;
}

async function getValidAccessToken(userId) {
  const result = await pool.query(
    'SELECT access_token, refresh_token, token_expires_at FROM users WHERE id = $1',
    [userId]
  );
  const user = result.rows[0];
  if (!user) throw new Error('User not found');

  const nowSecs = Math.floor(Date.now() / 1000);
  if (user.token_expires_at > nowSecs + 60) {
    return user.access_token;
  }

  // Refresh token
  const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    refresh_token: user.refresh_token,
    grant_type: 'refresh_token',
  });

  const { access_token, refresh_token, expires_at } = tokenRes.data;
  await pool.query(
    'UPDATE users SET access_token=$1, refresh_token=$2, token_expires_at=$3, updated_at=NOW() WHERE id=$4',
    [access_token, refresh_token, expires_at, userId]
  );
  return access_token;
}

// Fetch historical weather for a summit day using Open-Meteo (free, no key needed)
async function fetchWeather(lat, lng, date) {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FDenver`;
    const res = await axios.get(url, { timeout: 5000 });
    const d = res.data.daily;
    if (!d || !d.temperature_2m_max?.[0]) return null;

    const weatherCodes = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      61: 'Rain', 63: 'Rain', 65: 'Heavy Rain',
      71: 'Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
      80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
      85: 'Snow Showers', 86: 'Heavy Snow Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Severe Thunderstorm',
    };

    return {
      tempHighF: d.temperature_2m_max[0],
      tempLowF: d.temperature_2m_min[0],
      windMph: d.windspeed_10m_max[0],
      precipIn: d.precipitation_sum[0],
      conditions: weatherCodes[d.weathercode[0]] || 'Unknown',
    };
  } catch {
    return null;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Sync Strava activities and detect summit matches
router.post('/sync', requireAuth, async (req, res) => {
  const userId = req.session.userId;

  try {
    const accessToken = await getValidAccessToken(userId);

    // Get last sync time
    const userRes = await pool.query('SELECT last_synced_at FROM users WHERE id=$1', [userId]);
    const lastSynced = userRes.rows[0]?.last_synced_at;
    const afterEpoch = lastSynced ? Math.floor(new Date(lastSynced).getTime() / 1000) : 0;

    // Fetch activities from Strava (hiking/walking/running types)
    const ACTIVITY_TYPES = ['Hike', 'Walk', 'Trail Run', 'Run', 'BackcountrySki', 'Snowshoe'];
    let page = 1;
    let allActivities = [];
    let fetched = true;

    while (fetched) {
      const actRes = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { after: afterEpoch, page, per_page: 200 },
      });

      const activities = actRes.data;
      if (!activities.length) { fetched = false; break; }

      const relevant = activities.filter(a => ACTIVITY_TYPES.includes(a.type));
      allActivities = allActivities.concat(relevant);
      if (activities.length < 200) break;
      page++;
    }

    let newSummits = 0;
    const summitsFound = [];

    for (const activity of allActivities) {
      const summitLine = activity.map?.summary_polyline;
      if (!summitLine) continue;

      const matches = findMatchedPeaks(summitLine);
      for (const { peak } of matches) {
        const summitedAt = new Date(activity.start_date);

        // Concatenate approach/return day activities for train-access peaks
        const tripActivities = findTripActivities(activity, allActivities, peak);
        const tripElapsedTime = tripActivities.reduce((s, a) => s + (a.elapsed_time || 0), 0);
        const tripMovingTime  = tripActivities.reduce((s, a) => s + (a.moving_time  || 0), 0);
        const tripActivityCount = tripActivities.length;

        // Fetch weather for the summit day (non-blocking)
        const weather = await fetchWeather(peak.lat, peak.lng, summitedAt).catch(() => null);

        try {
          await pool.query(
            `INSERT INTO summits (user_id, fourteener_id, strava_activity_id, activity_name, summited_at,
              elapsed_time, moving_time, distance, total_elevation_gain, avg_heartrate, max_heartrate,
              avg_speed, weather_temp_f, weather_wind_mph, weather_conditions,
              trip_elapsed_time, trip_moving_time, trip_activity_count)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
             ON CONFLICT (user_id, fourteener_id, strava_activity_id) DO NOTHING`,
            [
              userId, peak.id, activity.id, activity.name, summitedAt,
              activity.elapsed_time, activity.moving_time, activity.distance,
              activity.total_elevation_gain, activity.average_heartrate || null,
              activity.max_heartrate || null, activity.average_speed,
              weather?.tempHighF || null, weather?.windMph || null,
              weather?.conditions || null,
              tripElapsedTime || null, tripMovingTime || null, tripActivityCount,
            ]
          );
          newSummits++;
          summitsFound.push(peak.name);
        } catch {
          // duplicate or constraint error — skip
        }
      }
    }

    await pool.query('UPDATE users SET last_synced_at=NOW() WHERE id=$1', [userId]);

    res.json({
      success: true,
      activitiesScanned: allActivities.length,
      newSummits,
      summitsFound,
    });
  } catch (err) {
    console.error('Sync error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// Manually add a summit
router.post('/summit/manual', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { fourteenerId, summitedAt, notes } = req.body;

  if (!fourteenerId || !summitedAt) {
    return res.status(400).json({ error: 'fourteenerId and summitedAt required' });
  }

  const peak = OFFICIAL_FOURTEENERS.find(p => p.id === fourteenerId);
  if (!peak) return res.status(404).json({ error: 'Peak not found' });

  try {
    const weather = await fetchWeather(peak.lat, peak.lng, new Date(summitedAt)).catch(() => null);

    await pool.query(
      `INSERT INTO summits (user_id, fourteener_id, summited_at, manual, notes,
        weather_temp_f, weather_wind_mph, weather_conditions)
       VALUES ($1,$2,$3,TRUE,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING`,
      [
        userId, fourteenerId, new Date(summitedAt), notes || null,
        weather?.tempHighF || null, weather?.windMph || null, weather?.conditions || null,
      ]
    );
    res.json({ success: true, peak: peak.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add summit', details: err.message });
  }
});

// Delete a summit record
router.delete('/summit/:id', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const summitId = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM summits WHERE id=$1 AND user_id=$2', [summitId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
