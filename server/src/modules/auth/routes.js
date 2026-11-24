import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
const router = Router();
const credentials = z.object({ email:z.string().email().max(254), password:z.string().min(8).max(128) });

router.post('/register', async (req,res,next) => {
  const data=credentials.extend({ name:z.string().trim().min(2).max(100) }).safeParse(req.body);
  if (!data.success) return res.status(400).json({error:'Name, valid email, and password (8+ characters) required'});
  try {
    const hash=await bcrypt.hash(data.data.password,12);
    const r=await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email', [data.data.name,data.data.email,hash]);
    const user=r.rows[0];
    const token=jwt.sign({sub:user.id,kind:'user'},process.env.JWT_SECRET,{expiresIn:'2h'});
    res.status(201).json({user,token});
  } catch(e) { if(e.code==='23505') return res.status(409).json({error:'Email already registered'}); next(e); }
});
router.post('/login', async (req,res,next) => {
  const data=credentials.safeParse(req.body); if(!data.success) return res.status(400).json({error:'Valid email and password required'});
  try {
    const r=await pool.query('SELECT id,name,email,password_hash FROM users WHERE email=$1',[data.data.email]);
    if(!r.rowCount || !(await bcrypt.compare(data.data.password,r.rows[0].password_hash))) return res.status(401).json({error:'Email or password incorrect'});
    const {password_hash,...user}=r.rows[0];
    res.json({user,token:jwt.sign({sub:user.id,kind:'user'},process.env.JWT_SECRET,{expiresIn:'2h'})});
  } catch(e) { next(e); }
});
export default router;
