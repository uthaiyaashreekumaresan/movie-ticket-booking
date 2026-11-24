import 'dotenv/config';
import { pool } from './pool.js';

async function migrateCineva() {
  console.log('Seeding CINÉVA movies and banners into database...');

  // 1. Seed or update banners
  await pool.query('DELETE FROM banners WHERE title = $1', ['Stories Worth Watching']);
  await pool.query(`
    INSERT INTO banners (title, description, image_url, button_text, language, genre, format, display_order, active)
    VALUES (
      'Stories Worth Watching',
      'Book your tickets and experience the magic of cinema like never before.',
      '/assets/hero-banner.png',
      'Explore Movies',
      'Tamil',
      'Cinema Spectacle',
      'CINÉVA Premiere',
      0,
      true
    )
  `);

  // 2. Ensure movies exist with exact titles and posters
  const movies = [
    {
      title: 'Velicham',
      synopsis: 'An intense action drama set against the glowing horizon of courage, justice and sacrifice.',
      language: 'Tamil',
      duration_minutes: 152,
      release_date: '2025-11-15',
      poster_url: '/assets/velicham.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.4,
      status: 'now_showing',
      featured: true,
      genre: 'Action | Drama',
      cast_members: 'Karthi, Sai Pallavi, Prakash Raj',
      director: 'Lokesh Kanagaraj',
      format: 'Tamil • Action | Drama'
    },
    {
      title: 'Meendum',
      synopsis: 'A poignant romantic drama capturing the return of lost memories and enduring love across eras.',
      language: 'Tamil',
      duration_minutes: 138,
      release_date: '2025-11-10',
      poster_url: '/assets/meendum.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.1,
      status: 'now_showing',
      featured: true,
      genre: 'Drama | Romance',
      cast_members: 'Suriya, Trisha Krishnan, Madhavan',
      director: 'Gautham Vasudev Menon',
      format: 'Tamil • Drama | Romance'
    },
    {
      title: 'Thiraiyil',
      synopsis: 'A gripping suspense thriller tracing secrets hidden behind the curtain of high stakes intrigue.',
      language: 'Tamil',
      duration_minutes: 140,
      release_date: '2025-11-18',
      poster_url: '/assets/thiraiyil.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.3,
      status: 'now_showing',
      featured: true,
      genre: 'Thriller | Action',
      cast_members: 'Vijay Sethupathi, Fahadh Faasil, Nayanthara',
      director: 'Thiagarajan Kumararaja',
      format: 'Tamil • Thriller | Action'
    },
    {
      title: 'Little Hero',
      synopsis: 'A delightful animated family adventure following an adventurous young boy and his loyal golden companion.',
      language: 'Tamil',
      duration_minutes: 170,
      release_date: '2025-11-20',
      poster_url: '/assets/little-hero.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.6,
      status: 'now_showing',
      featured: true,
      genre: 'Animation | Family',
      cast_members: 'Animated Voices: Sivakarthikeyan, Anirudh',
      director: 'Karthik Subbaraj',
      format: 'Tamil • Animation | Family'
    },
    {
      title: 'Shadow Time',
      synopsis: 'An adrenaline-fueled chase across shadows of destiny in a dystopian landscape.',
      language: 'Tamil',
      duration_minutes: 135,
      release_date: '2025-12-12',
      poster_url: '/assets/shadow-time.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.5,
      status: 'coming_soon',
      featured: false,
      genre: 'Tamil | Action',
      cast_members: 'Vikram, Malavika Mohanan',
      director: 'Pa. Ranjith',
      format: 'Tamil | Action'
    },
    {
      title: 'Dream Again',
      synopsis: 'A heartwarming story of second chances, hope and passionate dreams.',
      language: 'Tamil',
      duration_minutes: 125,
      release_date: '2025-12-19',
      poster_url: '/assets/dream-again.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.7,
      status: 'coming_soon',
      featured: false,
      genre: 'Tamil | Romance',
      cast_members: 'Dulquer Salmaan, Nithya Menen',
      director: 'Mani Ratnam',
      format: 'Tamil | Romance'
    },
    {
      title: 'Beyond Earth',
      synopsis: 'A visionary space odyssey pushing the boundaries of human courage and cosmic discovery.',
      language: 'Tamil',
      duration_minutes: 145,
      release_date: '2025-12-26',
      poster_url: '/assets/beyond-earth.png',
      banner_url: '/assets/hero-banner.png',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 8.9,
      status: 'coming_soon',
      featured: false,
      genre: 'Tamil | Sci-Fi',
      cast_members: 'Jayam Ravi, Samantha Ruth Prabhu',
      director: 'Shankar',
      format: 'Tamil | Sci-Fi'
    }
  ];

  for (const m of movies) {
    const existing = await pool.query('SELECT id FROM movies WHERE title = $1', [m.title]);
    let movieId;
    if (existing.rows.length > 0) {
      movieId = existing.rows[0].id;
      await pool.query(
        `UPDATE movies SET
          poster_url = $1, banner_url = $2, genre = $3, rating = $4,
          duration_minutes = $5, status = $6, language = $7, synopsis = $8
         WHERE id = $9`,
        [m.poster_url, m.banner_url, m.genre, m.rating, m.duration_minutes, m.status, m.language, m.synopsis, movieId]
      );
    } else {
      const ins = await pool.query(
        `INSERT INTO movies (title, synopsis, language, duration_minutes, release_date, poster_url, banner_url, trailer_url, rating, status, featured, genre, cast_members, director)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        [m.title, m.synopsis, m.language, m.duration_minutes, m.release_date, m.poster_url, m.banner_url, m.trailer_url, m.rating, m.status, m.featured, m.genre, m.cast_members, m.director]
      );
      movieId = ins.rows[0].id;
    }

    // If now_showing, ensure there are showtimes today
    if (m.status === 'now_showing') {
      const screenRes = await pool.query('SELECT id FROM screens LIMIT 1');
      if (screenRes.rows.length > 0) {
        const screenId = screenRes.rows[0].id;
        const showCount = await pool.query('SELECT count(*)::int AS count FROM shows WHERE movie_id = $1', [movieId]);
        if (showCount.rows[0].count === 0) {
          const times = [
            { start: '10:30:00', end: '13:00:00' },
            { start: '14:15:00', end: '16:45:00' },
            { start: '18:45:00', end: '21:15:00' },
            { start: '21:30:00', end: '23:55:00' }
          ];
          const today = new Date().toISOString().split('T')[0];
          for (const t of times) {
            const insShow = await pool.query(
              `INSERT INTO shows (screen_id, movie_id, starts_at, ends_at, status)
               VALUES ($1, $2, $3, $4, 'scheduled') RETURNING id`,
              [screenId, movieId, `${today}T${t.start}+05:30`, `${today}T${t.end}+05:30`]
            );
            const showId = insShow.rows[0].id;
            // populate show_seat_prices
            await pool.query(
              `INSERT INTO show_seat_prices (show_id, seat_id, price_minor)
               SELECT $1, id, CASE WHEN category = 'premium' THEN 35000 ELSE 22000 END
               FROM seats WHERE screen_id = $2
               ON CONFLICT DO NOTHING`,
              [showId, screenId]
            );
          }
        }
      }
    }
  }

  console.log('✓ Successfully migrated CINÉVA movies & showtimes!');
  await pool.end();
}

migrateCineva().catch((err) => {
  console.error(err);
  process.exit(1);
});
