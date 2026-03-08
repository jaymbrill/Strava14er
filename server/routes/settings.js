const express = require('express');
const multer = require('multer');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Store upload in memory so we can base64-encode it into the DB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// GET /api/settings/background — returns the stored image as a data URL
router.get('/background', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT background_image FROM users WHERE id = $1',
    [req.session.userId]
  );
  const dataUrl = rows[0]?.background_image || null;
  res.json({ backgroundImage: dataUrl });
});

// PUT /api/settings/background — upload a new background image
router.put('/background', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  await pool.query(
    'UPDATE users SET background_image = $1 WHERE id = $2',
    [dataUrl, req.session.userId]
  );

  res.json({ backgroundImage: dataUrl });
});

// DELETE /api/settings/background — revert to the default Longs Peak photo
router.delete('/background', requireAuth, async (req, res) => {
  await pool.query(
    'UPDATE users SET background_image = NULL WHERE id = $1',
    [req.session.userId]
  );
  res.json({ backgroundImage: null });
});

module.exports = router;
