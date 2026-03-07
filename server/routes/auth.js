const express = require('express');
const axios = require('axios');
const { pool } = require('../db');

const router = express.Router();

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

// Redirect to Strava OAuth
router.get('/strava', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  res.redirect(`${STRAVA_AUTH_URL}?${params}`);
});

// Strava OAuth callback
router.get('/strava/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.APP_URL || ''}/?error=strava_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post(STRAVA_TOKEN_URL, {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_at, athlete } = tokenRes.data;

    // Upsert user in database
    const result = await pool.query(
      `INSERT INTO users (strava_id, username, firstname, lastname, profile_medium, city, state, access_token, refresh_token, token_expires_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (strava_id) DO UPDATE SET
         username = EXCLUDED.username,
         firstname = EXCLUDED.firstname,
         lastname = EXCLUDED.lastname,
         profile_medium = EXCLUDED.profile_medium,
         city = EXCLUDED.city,
         state = EXCLUDED.state,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expires_at = EXCLUDED.token_expires_at,
         updated_at = NOW()
       RETURNING id`,
      [
        athlete.id,
        athlete.username,
        athlete.firstname,
        athlete.lastname,
        athlete.profile_medium,
        athlete.city,
        athlete.state,
        access_token,
        refresh_token,
        expires_at,
      ]
    );

    req.session.userId = result.rows[0].id;
    req.session.stravaId = athlete.id;

    res.redirect(`${process.env.APP_URL || ''}/dashboard`);
  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.redirect(`${process.env.APP_URL || ''}/?error=auth_failed`);
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current session user info
router.get('/me', async (req, res) => {
  if (!req.session?.userId) {
    return res.json({ authenticated: false });
  }
  try {
    const result = await pool.query(
      'SELECT id, strava_id, username, firstname, lastname, profile_medium, city, state, last_synced_at FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (!result.rows.length) {
      return res.json({ authenticated: false });
    }
    res.json({ authenticated: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
