const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        strava_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        firstname VARCHAR(255),
        lastname VARCHAR(255),
        profile_medium VARCHAR(500),
        city VARCHAR(255),
        state VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at BIGINT,
        last_synced_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS summits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        fourteener_id VARCHAR(100) NOT NULL,
        strava_activity_id BIGINT,
        activity_name VARCHAR(500),
        summited_at TIMESTAMP,
        elapsed_time INTEGER,
        moving_time INTEGER,
        distance FLOAT,
        total_elevation_gain FLOAT,
        avg_heartrate FLOAT,
        max_heartrate FLOAT,
        avg_speed FLOAT,
        manual BOOLEAN DEFAULT FALSE,
        notes TEXT,
        weather_temp_f FLOAT,
        weather_wind_mph FLOAT,
        weather_conditions VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, fourteener_id, strava_activity_id)
      );

      CREATE TABLE IF NOT EXISTS thirteener_summits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        thirteener_id VARCHAR(100) NOT NULL,
        strava_activity_id BIGINT,
        activity_name VARCHAR(500),
        summited_at TIMESTAMP,
        elapsed_time INTEGER,
        moving_time INTEGER,
        distance FLOAT,
        total_elevation_gain FLOAT,
        avg_heartrate FLOAT,
        max_heartrate FLOAT,
        avg_speed FLOAT,
        manual BOOLEAN DEFAULT FALSE,
        notes TEXT,
        weather_temp_f FLOAT,
        weather_wind_mph FLOAT,
        weather_conditions VARCHAR(255),
        trailhead_name TEXT,
        route_name TEXT,
        start_lat FLOAT,
        start_lng FLOAT,
        end_lat FLOAT,
        end_lng FLOAT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, thirteener_id, strava_activity_id)
      );

      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        PRIMARY KEY (sid)
      );

      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
    `);
    console.log('✅ Database initialized');

    // Migrations
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS background_image TEXT;
      ALTER TABLE summits ADD COLUMN IF NOT EXISTS trailhead_name TEXT;
      ALTER TABLE summits ADD COLUMN IF NOT EXISTS route_name TEXT;
      ALTER TABLE summits ADD COLUMN IF NOT EXISTS start_lat FLOAT;
      ALTER TABLE summits ADD COLUMN IF NOT EXISTS start_lng FLOAT;
      ALTER TABLE summits ADD COLUMN IF NOT EXISTS end_lat FLOAT;
      ALTER TABLE summits ADD COLUMN IF NOT EXISTS end_lng FLOAT;
    `);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDb };
