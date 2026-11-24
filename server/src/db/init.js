import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';
try {
  const sql = await readFile(new URL('../../../database/schema.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('Database schema ready');
} finally { await pool.end(); }
