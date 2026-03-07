# Colorado 14er Tracker — Setup Guide

Track all 58 Colorado Fourteeners with automatic Strava integration.

## Prerequisites

- Node.js 18+
- A Strava account and API app (free at https://www.strava.com/settings/api)
- PostgreSQL database (or use Render's free tier)

---

## 1. Strava API Setup

1. Go to https://www.strava.com/settings/api
2. Create a new application:
   - **App Name**: Colorado 14er Tracker
   - **Category**: Other
   - **Club**: Leave blank
   - **Website**: Your app URL (or `http://localhost:3001`)
   - **Authorization Callback Domain**: `localhost` (dev) / your Render domain (prod)
3. Note your **Client ID** and **Client Secret**

---

## 2. Local Development

```bash
# Clone the repo
git clone <repo-url>
cd colorado-14er-tracker

# Copy and fill out environment variables
cp .env.example .env
# Edit .env with your Strava credentials, DATABASE_URL, etc.

# Install all dependencies
npm run setup

# Start development servers
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

### .env for local dev:
```
STRAVA_CLIENT_ID=your_id
STRAVA_CLIENT_SECRET=your_secret
STRAVA_REDIRECT_URI=http://localhost:3001/auth/strava/callback
SESSION_SECRET=any-long-random-string
DATABASE_URL=postgresql://user:pass@localhost:5432/fourteeners
APP_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

---

## 3. Deploy to Render

1. Push this repo to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your GitHub repo — Render reads `render.yaml` automatically
4. Set these environment variables in Render dashboard:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REDIRECT_URI` = `https://your-app.onrender.com/auth/strava/callback`
   - `APP_URL` = `https://your-app.onrender.com`
5. Click **Deploy**

### Update Strava app settings after deploy:
- Go back to https://www.strava.com/settings/api
- Set **Authorization Callback Domain** to `your-app.onrender.com`

---

## Features

- **Auto-detect summits** via GPS polyline matching (within 400m of summit)
- **Manual entry** for peaks summited without Strava tracking
- **58 official Colorado Fourteeners** with coordinates, difficulty, trailhead info
- **Summit stats**: pace, elevation gain, time, heart rate
- **Summit-day weather** via Open-Meteo API (free, no key needed)
- **Range progress** tracking across all 6 mountain ranges
- **Achievement badges** as you reach milestones
- **Strava link** from each summit to the original activity
- **Google Maps** link to each summit's coordinates
- **Sort & filter** by range, difficulty, completion status

## Tech Stack

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: Strava OAuth 2.0
- **Deploy**: Render (web service + PostgreSQL)
- **Weather**: Open-Meteo historical API (free)
