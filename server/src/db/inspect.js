import 'dotenv/config';
import { pool } from './pool.js';

async function main() {
  const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'movies';");
  console.log('MOVIES COLUMNS:', cols.rows);
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
  console.log('TABLES:', tables.rows.map(r => r.table_name));
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
