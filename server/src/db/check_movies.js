import 'dotenv/config';
import { pool } from './pool.js';

async function test() {
  const r = await pool.query("SELECT id, title, genre, status, poster_url FROM movies ORDER BY id");
  console.log('ALL MOVIES IN DB:');
  console.table(r.rows);
  await pool.end();
}
test();
