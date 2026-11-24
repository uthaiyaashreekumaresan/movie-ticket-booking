import 'dotenv/config';
import { app } from './app.js';
import { pool } from './db/pool.js';

const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, () => console.log(`CineGo API listening on ${port}`));
const holdCleanup = setInterval(async () => {
  try {
    await pool.query("UPDATE bookings SET status='expired' WHERE status='pending_payment' AND expires_at<=now()");
    await pool.query('DELETE FROM seat_holds WHERE expires_at<=now()');
  } catch (error) { console.error('Seat hold cleanup failed', error); }
}, 30_000);
holdCleanup.unref();
async function shutdown() {
  clearInterval(holdCleanup);
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
