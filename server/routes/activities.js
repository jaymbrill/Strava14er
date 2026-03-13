const express = require('express');
const axios = require('axios');
const polyline = require('@mapbox/polyline');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { OFFICIAL_FOURTEENERS } = require('../data/fourteeners');
const { TRAILHEADS } = require('../data/trailheads');

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

const SUMMIT_RADIUS_METERS = 300;  // within 300 m of summit = summited
const COMBINE_RADIUS_METERS = 500; // start/finish within 500 m → merge as one hike

// Returns { matches, startPoint, endPoint } so the polyline is only decoded once.
function findMatchedPeaks(activityPolyline) {
  if (!activityPolyline) return { matches: [], startPoint: null, endPoint: null };
  let points;
  try {
    points = polyline.decode(activityPolyline); // [[lat, lng], ...]
  } catch {
    return { matches: [], startPoint: null, endPoint: null };
  }

  const matches = [];
  for (const peak of OFFICIAL_FOURTEENERS) {
    let closest = Infinity;
    for (const [lat, lng] of points) {
      const d = haversineMeters(lat, lng, peak.lat, peak.lng);
      if (d < closest) closest = d;
      if (d < SUMMIT_RADIUS_METERS) break; // early exit once confirmed
    }
    if (closest < SUMMIT_RADIUS_METERS) {
      matches.push({ peak, distanceMeters: closest });
    }
  }
  return { matches, startPoint: points[0] || null, endPoint: points[points.length - 1] || null };
}

// Find the closest known trailhead for a peak to the hike's start GPS point.
// Returns { name, trailhead } or null if no data / start is too far away.
const TRAILHEAD_MATCH_RADIUS_METERS = 3000; // 3 km — generous to cover parking areas
function findNearestTrailhead(peakId, startLat, startLng) {
  const routes = TRAILHEADS[peakId];
  if (!routes || !routes.length || startLat == null || startLng == null) return null;

  let nearest = null;
  let nearestDist = Infinity;
  for (const route of routes) {
    const d = haversineMeters(startLat, startLng, route.lat, route.lng);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = route;
    }
  }
  return nearestDist <= TRAILHEAD_MATCH_RADIUS_METERS ? nearest : null;
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
      windMph: d.windspeed_10m_max[0],
      conditions: weatherCodes[d.weathercode[0]] || 'Unknown',
    };
  } catch {
    return null;
  }
}

// ─── Shared sync logic ────────────────────────────────────────────────────────

async function runSync(userId, accessToken, afterEpoch) {
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
    allActivities = allActivities.concat(activities);
    if (activities.length < 200) break;
    page++;
  }

  let newSummits = 0;
  const summitsFound = [];

  for (const activity of allActivities) {
    const summitLine = activity.map?.summary_polyline;
    if (!summitLine) continue;

    const { matches, startPoint, endPoint } = findMatchedPeaks(summitLine);

    for (const { peak } of matches) {
      const summitedAt = new Date(activity.start_date);
      const newGain = activity.total_elevation_gain || 0;

      const th = startPoint
        ? findNearestTrailhead(peak.id, startPoint[0], startPoint[1])
        : null;

      const [sLat, sLng] = startPoint || [null, null];
      const [eLat, eLng] = endPoint || [null, null];

      // ── Merge split GPX uploads (ascent + descent as separate files) ──────
      // Find any existing summit for this peak within 24 hours, then check
      // whether the start/finish points are within 500 m of each other.
      // Handles both same-direction tracks and ascent/descent splits:
      //   same-direction:  startA≈startB AND endA≈endB
      //   split track:     startA≈endB   AND endA≈startB
      // When merged, totals (distance, time, gain) are accumulated.
      const nearby = await pool.query(
        `SELECT id, strava_activity_id, activity_name, summited_at,
                total_elevation_gain, distance, elapsed_time, moving_time,
                avg_heartrate, max_heartrate, trailhead_name, route_name,
                start_lat, start_lng, end_lat, end_lng
         FROM summits
         WHERE user_id=$1 AND fourteener_id=$2 AND NOT manual
           AND ABS(EXTRACT(EPOCH FROM (summited_at - $3))) <= 86400`,
        [userId, peak.id, summitedAt]
      );

      let matchedRow = null;
      for (const row of nearby.rows) {
        if (sLat == null || row.start_lat == null) continue;
        const ss = haversineMeters(sLat, sLng, row.start_lat, row.start_lng);
        const ee = haversineMeters(eLat, eLng, row.end_lat, row.end_lng);
        const se = haversineMeters(sLat, sLng, row.end_lat, row.end_lng);
        const es = haversineMeters(eLat, eLng, row.start_lat, row.start_lng);
        if (
          (ss < COMBINE_RADIUS_METERS && ee < COMBINE_RADIUS_METERS) ||
          (se < COMBINE_RADIUS_METERS && es < COMBINE_RADIUS_METERS)
        ) {
          matchedRow = row;
          break;
        }
      }

      if (matchedRow) {
        // Accumulate totals across both activities
        const combinedGain    = newGain + (matchedRow.total_elevation_gain || 0);
        const combinedDist    = (activity.distance || 0) + (matchedRow.distance || 0);
        const combinedElapsed = (activity.elapsed_time || 0) + (matchedRow.elapsed_time || 0);
        const combinedMoving  = (activity.moving_time || 0) + (matchedRow.moving_time || 0);
        const combinedMaxHR   = Math.max(activity.max_heartrate || 0, matchedRow.max_heartrate || 0) || null;
        // Weighted average heart rate by moving time
        const newHR = activity.average_heartrate;
        const exHR  = matchedRow.avg_heartrate;
        const newMT = activity.moving_time || 0;
        const exMT  = matchedRow.moving_time || 0;
        const combinedAvgHR =
          newHR && exHR ? (newHR * newMT + exHR * exMT) / (newMT + exMT || 1)
          : newHR || exHR || null;
        // Avg speed = total distance / total moving time
        const combinedAvgSpeed = combinedMoving > 0 ? combinedDist / combinedMoving : null;

        // Use the higher-gain activity as the canonical record (name/id/date/trailhead)
        const isPrimaryNew  = newGain >= (matchedRow.total_elevation_gain || 0);
        const canonicalId   = isPrimaryNew ? activity.id   : matchedRow.strava_activity_id;
        const canonicalName = isPrimaryNew ? activity.name : matchedRow.activity_name;
        const canonicalAt   = isPrimaryNew ? summitedAt    : matchedRow.summited_at;
        const canonicalTH   = isPrimaryNew ? (th?.trailhead || null) : matchedRow.trailhead_name;
        const canonicalRN   = isPrimaryNew ? (th?.name || null)      : matchedRow.route_name;

        const weather = await fetchWeather(peak.lat, peak.lng, canonicalAt).catch(() => null);
        await pool.query(
          `UPDATE summits SET
             strava_activity_id=$1, activity_name=$2, summited_at=$3,
             elapsed_time=$4, moving_time=$5, distance=$6,
             total_elevation_gain=$7, avg_heartrate=$8, max_heartrate=$9,
             avg_speed=$10, weather_temp_f=$11, weather_wind_mph=$12,
             weather_conditions=$13, trailhead_name=$14, route_name=$15,
             start_lat=$16, start_lng=$17, end_lat=$18, end_lng=$19
           WHERE id=$20`,
          [
            canonicalId, canonicalName, canonicalAt,
            combinedElapsed, combinedMoving, combinedDist,
            combinedGain, combinedAvgHR, combinedMaxHR,
            combinedAvgSpeed,
            weather?.tempHighF || null, weather?.windMph || null,
            weather?.conditions || null,
            canonicalTH, canonicalRN,
            sLat, sLng, eLat, eLng,
            matchedRow.id,
          ]
        );
        summitsFound.push(peak.name);
      } else {
        // No nearby matching activity for this same peak.
        // Check for a sequential chain: another same-day activity (any peak) that
        // ended where this one started AND started where this one ended — i.e., the
        // user split a single round trip into two Strava activities (common for
        // paired peaks like Redcloud → Sunshine).  If found, fold that leg's time
        // into this summit so the total reflects the full outing.
        let insertElapsed = activity.elapsed_time || 0;
        let insertMoving  = activity.moving_time  || 0;

        if (sLat != null && eLat != null) {
          const chainRows = await pool.query(
            `SELECT elapsed_time, moving_time, start_lat, start_lng, end_lat, end_lng
               FROM summits
              WHERE user_id=$1 AND NOT manual
                AND ABS(EXTRACT(EPOCH FROM (summited_at - $2))) <= 86400
                AND (elapsed_time IS NOT NULL OR moving_time IS NOT NULL)`,
            [userId, summitedAt]
          );
          for (const row of chainRows.rows) {
            if (row.start_lat == null || row.end_lat == null) continue;
            // chain: row.end ≈ current.start  AND  row.start ≈ current.end
            const chainSE = haversineMeters(sLat, sLng, row.end_lat,   row.end_lng);
            const chainES = haversineMeters(eLat, eLng, row.start_lat, row.start_lng);
            if (chainSE < COMBINE_RADIUS_METERS && chainES < COMBINE_RADIUS_METERS) {
              insertElapsed += (row.elapsed_time || 0);
              insertMoving  += (row.moving_time  || 0);
              break;
            }
          }
        }

        const weather = await fetchWeather(peak.lat, peak.lng, summitedAt).catch(() => null);
        try {
          await pool.query(
            `INSERT INTO summits (
               user_id, fourteener_id, strava_activity_id, activity_name, summited_at,
               elapsed_time, moving_time, distance, total_elevation_gain,
               avg_heartrate, max_heartrate, avg_speed,
               weather_temp_f, weather_wind_mph, weather_conditions,
               trailhead_name, route_name,
               start_lat, start_lng, end_lat, end_lng)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
             ON CONFLICT (user_id, fourteener_id, strava_activity_id) DO NOTHING`,
            [
              userId, peak.id, activity.id, activity.name, summitedAt,
              insertElapsed || null, insertMoving || null, activity.distance,
              activity.total_elevation_gain, activity.average_heartrate || null,
              activity.max_heartrate || null, activity.average_speed,
              weather?.tempHighF || null, weather?.windMph || null,
              weather?.conditions || null,
              th?.trailhead || null, th?.name || null,
              sLat, sLng, eLat, eLng,
            ]
          );
          newSummits++;
          summitsFound.push(peak.name);
        } catch {
          // constraint violation — skip
        }
      }
    }
  }

  return { activitiesScanned: allActivities.length, newSummits, summitsFound };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/sync', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const accessToken = await getValidAccessToken(userId);
    const userRes = await pool.query('SELECT last_synced_at FROM users WHERE id=$1', [userId]);
    const lastSynced = userRes.rows[0]?.last_synced_at;
    const afterEpoch = lastSynced ? Math.floor(new Date(lastSynced).getTime() / 1000) : 0;

    const result = await runSync(userId, accessToken, afterEpoch);
    await pool.query('UPDATE users SET last_synced_at=NOW() WHERE id=$1', [userId]);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Sync error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// Recalculate all summits from scratch using the current combine methodology.
// Deletes all non-manual summit records, then re-processes every Strava
// activity from the beginning (afterEpoch = 0).
router.post('/recalculate', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const accessToken = await getValidAccessToken(userId);
    await pool.query('DELETE FROM summits WHERE user_id=$1 AND NOT manual', [userId]);
    const result = await runSync(userId, accessToken, 0);
    await pool.query('UPDATE users SET last_synced_at=NOW() WHERE id=$1', [userId]);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Recalculate error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Recalculate failed', details: err.message });
  }
});

// Manually add a summit
router.post('/summit/manual', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { fourteenerId, summitedAt, notes, elapsedTime } = req.body;

  if (!fourteenerId || !summitedAt) {
    return res.status(400).json({ error: 'fourteenerId and summitedAt required' });
  }

  const peak = OFFICIAL_FOURTEENERS.find(p => p.id === fourteenerId);
  if (!peak) return res.status(404).json({ error: 'Peak not found' });

  try {
    const weather = await fetchWeather(peak.lat, peak.lng, new Date(summitedAt)).catch(() => null);
    await pool.query(
      `INSERT INTO summits (user_id, fourteener_id, summited_at, manual, notes,
        elapsed_time, weather_temp_f, weather_wind_mph, weather_conditions)
       VALUES ($1,$2,$3,TRUE,$4,$5,$6,$7,$8)`,
      [
        userId, fourteenerId, new Date(summitedAt), notes || null,
        elapsedTime || null,
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
