import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

async function seedAdmin() {
  try {
    const hash = await bcrypt.hash('CineGo@Admin2026', 12);
    const r = await pool.query(
      `INSERT INTO admins(email, password_hash, role, active)
       VALUES('admin@cineverse.com', $1, 'super_admin', true)
       ON CONFLICT(email) DO UPDATE SET password_hash=$1, active=true
       RETURNING id, email, role`,
      [hash]
    );
    console.log('✅ Admin Account Ready:', r.rows[0]);
  } catch (err) {
    console.error('❌ Admin seed error:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
