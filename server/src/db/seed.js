import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';
try {
  await pool.query(await readFile(new URL('../../../database/seed.sql', import.meta.url), 'utf8'));
  console.log('Sample movies, theatre, show, and seats ready');
} finally { await pool.end(); }
