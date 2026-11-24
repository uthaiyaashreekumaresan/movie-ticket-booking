import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.js';
import { pool, transaction } from '../../db/pool.js';
const router = Router();
const holdBody = z.object({ showId: z.number().int().positive(), seatIds: z.array(z.number().int().positive()).min(1).max(10), sessionId: z.string().uuid() });

router.get('/:showId', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT s.id,s.row_label,s.seat_number,s.category,p.price_minor,
      CASE WHEN bs.seat_id IS NOT NULL THEN 'booked'
           WHEN h.seat_id IS NOT NULL AND h.expires_at > now() THEN 'locked'
           ELSE 'available' END AS status
      FROM shows sh JOIN seats s ON s.screen_id=sh.screen_id
      JOIN show_seat_prices p ON p.show_id=sh.id AND p.seat_id=s.id
      LEFT JOIN booking_seats bs ON bs.show_id=sh.id AND bs.seat_id=s.id
      LEFT JOIN seat_holds h ON h.show_id=sh.id AND h.seat_id=s.id AND h.expires_at > now()
      WHERE sh.id=$1 AND s.active=true ORDER BY s.row_label,s.seat_number`, [req.params.showId]);
    res.json({ seats: result.rows });
  } catch (e) { next(e); }
});

router.post('/holds', authenticate('user'), async (req, res, next) => {
  const parsed = holdBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid hold request', details: parsed.error.flatten() });
  const { showId, seatIds, sessionId } = parsed.data;
  if (new Set(seatIds).size !== seatIds.length) return res.status(400).json({ error: 'Duplicate seat IDs' });
  try {
    const held = await transaction(async (db) => {
      const exists = await db.query(`SELECT s.id,p.price_minor FROM shows sh
        JOIN seats s ON s.screen_id=sh.screen_id JOIN show_seat_prices p ON p.show_id=sh.id AND p.seat_id=s.id
        WHERE sh.id=$1 AND s.id=ANY($2::bigint[]) AND sh.status='scheduled'`, [showId, seatIds]);
      if (exists.rowCount !== seatIds.length) throw Object.assign(new Error('One or more seats are invalid'), { status: 400, publicMessage: 'Invalid seat selection' });
      const acquired = await db.query(`INSERT INTO seat_holds(show_id,seat_id,user_id,session_id,expires_at)
        SELECT $1, x, $2, $3, now()+($4::text || ' minutes')::interval FROM unnest($5::bigint[]) x
        ON CONFLICT(show_id,seat_id) DO UPDATE SET user_id=EXCLUDED.user_id,session_id=EXCLUDED.session_id,
          booking_id=NULL,expires_at=EXCLUDED.expires_at
        WHERE seat_holds.expires_at <= now() OR (seat_holds.user_id=EXCLUDED.user_id AND seat_holds.session_id=EXCLUDED.session_id AND seat_holds.booking_id IS NULL)
        RETURNING seat_id`, [showId, req.auth.sub, sessionId, process.env.HOLD_MINUTES ?? '8', seatIds]);
      if (acquired.rowCount !== seatIds.length) throw Object.assign(new Error('Seat conflict'), { status: 409, publicMessage: 'One or more seats were just taken' });
      const booked = await db.query('SELECT seat_id FROM booking_seats WHERE show_id=$1 AND seat_id=ANY($2::bigint[])', [showId, seatIds]);
      if (booked.rowCount) throw Object.assign(new Error('Already booked'), { status: 409, publicMessage: 'One or more seats are already booked' });
      const prices = await db.query('SELECT seat_id,price_minor FROM show_seat_prices WHERE show_id=$1 AND seat_id=ANY($2::bigint[])', [showId, seatIds]);
      return { expiresAt: new Date(Date.now() + Number(process.env.HOLD_MINUTES ?? 8) * 60_000).toISOString(), seats: prices.rows,
        totalMinor: prices.rows.reduce((n, x) => n + Number(x.price_minor), 0) };
    });
    res.status(201).json({ ...held, currency: 'INR' });
  } catch (e) { next(e); }
});

router.delete('/holds/:showId/:seatId', authenticate('user'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM seat_holds WHERE show_id=$1 AND seat_id=$2 AND user_id=$3 AND session_id=$4',
      [req.params.showId, req.params.seatId, req.auth.sub, req.body.sessionId]);
    res.status(204).end();
  } catch (e) { next(e); }
});
router.delete('/holds', authenticate('user'), async (req,res,next)=>{
  try {
    await pool.query('DELETE FROM seat_holds WHERE show_id=$1 AND user_id=$2 AND session_id=$3 AND booking_id IS NULL',
      [req.body.showId,req.auth.sub,req.body.sessionId]);
    res.status(204).end();
  } catch(e) { next(e); }
});
export default router;
