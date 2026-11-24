import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.js';
import { pool, transaction } from '../../db/pool.js';
const router = Router();

router.post('/', authenticate('user'), async (req, res, next) => {
  const body = z.object({ showId:z.number().int().positive(), seatIds:z.array(z.number().int().positive()).min(1).max(10), sessionId:z.string().uuid() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error:'Invalid booking request' });
  const id = randomUUID();
  try {
    const booking = await transaction(async db => {
      const holds = await db.query(`SELECT h.seat_id,p.price_minor FROM seat_holds h
        JOIN show_seat_prices p ON p.show_id=h.show_id AND p.seat_id=h.seat_id
        WHERE h.show_id=$1 AND h.seat_id=ANY($2::bigint[]) AND h.user_id=$3 AND h.session_id=$4
          AND h.expires_at>now() FOR UPDATE`, [body.data.showId, body.data.seatIds, req.auth.sub, body.data.sessionId]);
      if (holds.rowCount !== body.data.seatIds.length) throw Object.assign(new Error('Hold expired'), { status:409, publicMessage:'Seat hold expired; please select seats again' });
      const total = holds.rows.reduce((sum, row) => sum + Number(row.price_minor), 0);
      const made = await db.query(`INSERT INTO bookings(id,user_id,show_id,status,total_minor,expires_at,seat_count)
        VALUES($1,$2,$3,'pending_payment',$4,now()+interval '8 minutes',$5) RETURNING id,status,total_minor,expires_at,seat_count`,
      [id, req.auth.sub, body.data.showId, total, holds.rowCount]);
      await db.query(`UPDATE seat_holds SET booking_id=$1 WHERE show_id=$2 AND seat_id=ANY($3::bigint[])`, [id, body.data.showId, body.data.seatIds]);
      return made.rows[0];
    });
    res.status(201).json({ booking, next:'Create a provider payment intent for this booking before checkout.' });
  } catch (e) { next(e); }
});

router.get('/mine', authenticate('user'), async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT b.id,b.status,b.total_minor,b.currency,b.created_at,m.title,s.starts_at,
      array_agg(se.row_label || se.seat_number ORDER BY se.row_label,se.seat_number) FILTER(WHERE se.id IS NOT NULL) AS seats
      FROM bookings b JOIN shows s ON s.id=b.show_id JOIN movies m ON m.id=s.movie_id
      LEFT JOIN booking_seats bs ON bs.booking_id=b.id LEFT JOIN seats se ON se.id=bs.seat_id
      WHERE b.user_id=$1 GROUP BY b.id,m.title,s.starts_at ORDER BY b.created_at DESC`, [req.auth.sub]);
    res.json({ bookings: result.rows });
  } catch (e) { next(e); }
});
export default router;
