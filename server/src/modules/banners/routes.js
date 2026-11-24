import { Router } from 'express';
import { pool } from '../../db/pool.js';

const router = Router();

// GET /api/banners — Fetch all active hero banners ordered by display_order
router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT b.*, m.id AS movie_id, COALESCE(b.trailer_url, m.trailer_url) AS trailer_url,
             COALESCE(b.duration_minutes, m.duration_minutes) AS duration_minutes,
             COALESCE(b.format, m.format) AS format,
             COALESCE(b.genre, m.genre) AS genre,
             COALESCE(b.language, m.language) AS language
      FROM banners b
      LEFT JOIN movies m ON m.id = b.movie_id
      WHERE b.active = true
      ORDER BY b.display_order ASC, b.created_at DESC
    `);
    res.json({ banners: result.rows });
  } catch (e) {
    next(e);
  }
});

export default router;
