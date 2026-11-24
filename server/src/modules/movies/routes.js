import { Router } from 'express';
import { pool } from '../../db/pool.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const { city, genre, q } = req.query;
    let result = await pool.query(
      `SELECT DISTINCT m.* FROM movies m
       LEFT JOIN movie_genres mg ON mg.movie_id=m.id LEFT JOIN genres g ON g.id=mg.genre_id
       WHERE m.status IN ('now_showing','coming_soon')
       AND ($1::text IS NULL OR m.title ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR g.name ILIKE $2 OR m.genre ILIKE '%' || $2 || '%')
       AND ($3::text IS NULL OR EXISTS (SELECT 1 FROM shows s JOIN screens sc ON sc.id=s.screen_id JOIN theatres t ON t.id=sc.theatre_id WHERE s.movie_id=m.id AND t.city ILIKE $3))
       ORDER BY m.featured DESC, m.release_date DESC NULLS LAST`,
      [q || null, genre || null, city ? `%${city}%` : null]);

    // If city has no specific shows scheduled yet, return all active movies
    if (result.rowCount === 0 && city) {
      result = await pool.query(
        `SELECT DISTINCT m.* FROM movies m
         LEFT JOIN movie_genres mg ON mg.movie_id=m.id LEFT JOIN genres g ON g.id=mg.genre_id
         WHERE m.status IN ('now_showing','coming_soon')
         AND ($1::text IS NULL OR m.title ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR g.name ILIKE $2 OR m.genre ILIKE '%' || $2 || '%')
         ORDER BY m.featured DESC, m.release_date DESC NULLS LAST`,
        [q || null, genre || null]);
    }

    res.json({ movies: result.rows });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM movies WHERE id=$1', [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Movie not found' });
    res.json({ movie: r.rows[0] });
  } catch (e) { next(e); }
});
export default router;
