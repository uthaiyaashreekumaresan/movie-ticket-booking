import { Router } from 'express';
import { pool } from '../../db/pool.js';
const router=Router();
router.get('/',async(req,res,next)=>{
  try{
    const {movieId,city,date}=req.query;
    if(!movieId)return res.status(400).json({error:'movieId is required'});
    const result=await pool.query(`SELECT sh.id,sh.starts_at,sh.ends_at,sc.name AS screen,
      t.id AS theatre_id,t.name AS theatre,t.city,t.address
      FROM shows sh JOIN screens sc ON sc.id=sh.screen_id JOIN theatres t ON t.id=sc.theatre_id
      WHERE sh.movie_id=$1 AND sh.status='scheduled' AND t.active=true
      AND ($2::text IS NULL OR t.city ILIKE $2)
      AND ($3::date IS NULL OR (sh.starts_at >= $3::date AND sh.starts_at < $3::date + interval '1 day'))
      ORDER BY t.name,sh.starts_at`,[movieId,city?`%${city}%`:null,date||null]);
    res.json({shows:result.rows});
  }catch(e){next(e)}
});
export default router;
