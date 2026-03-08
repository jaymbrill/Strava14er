require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initDb, pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Session Store ────────────────────────────────────────────────────────────
let sessionStore;
if (process.env.DATABASE_URL) {
  const PgSession = require('connect-pg-simple')(session);
  sessionStore = new PgSession({ pool, tableName: 'session' });
} else {
  console.warn('⚠️  No DATABASE_URL — using in-memory sessions (development only)');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    credentials: true,
  })
);

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/fourteeners', require('./routes/fourteeners'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve React Frontend ─────────────────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  if (process.env.DATABASE_URL) {
    await initDb();
  }
  app.listen(PORT, () => {
    console.log(`🏔️  Colorado 14er Tracker running on port ${PORT}`);
  });
};

start().catch(console.error);
