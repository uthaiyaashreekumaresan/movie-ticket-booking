import 'dotenv/config';
import { pool } from './pool.js';

async function migrate() {
  console.log('--- Starting Database Migration for PVR Redesign ---');

  // 1. Alter movies table to add enhanced columns
  await pool.query(`
    ALTER TABLE movies 
    ADD COLUMN IF NOT EXISTS banner_url TEXT,
    ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT 'Action · Drama',
    ADD COLUMN IF NOT EXISTS cast_members TEXT DEFAULT 'Lead Cast',
    ADD COLUMN IF NOT EXISTS director TEXT DEFAULT 'Renowned Director',
    ADD COLUMN IF NOT EXISTS format TEXT DEFAULT '2D · Dolby Atmos';
  `);
  console.log('✓ Added enhanced columns to movies table');

  // 2. Create banners table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      trailer_url TEXT,
      movie_id BIGINT REFERENCES movies(id) ON DELETE SET NULL,
      language TEXT DEFAULT 'English',
      genre TEXT DEFAULT 'Action · Sci-Fi',
      duration_minutes INT DEFAULT 135,
      format TEXT DEFAULT 'IMAX 4K Laser · Dolby Atmos',
      button_text TEXT DEFAULT 'Book Tickets',
      destination_url TEXT DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT true,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ Created banners table');

  // 3. Update existing movies with rich poster, banner, trailer, cast, and genre info
  const updates = [
    {
      title: 'The Last Horizon',
      banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=90',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      genre: 'Sci-Fi · Adventure · Mystery',
      cast_members: 'David Sterling, Elena Rostova, Marcus Chen',
      director: 'Christopher Vance',
      format: 'IMAX 4K Laser · Dolby Atmos',
      poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=700&q=85',
      synopsis: 'An expedition follows an enigmatic deep-space signal beyond the edge of known civilization, unveiling cosmic anomalies that fundamentally question human origins.'
    },
    {
      title: 'Neon Afterglow',
      banner_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2200&q=90',
      trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genre: 'Drama · Cyber Noir · Thriller',
      cast_members: 'Nicolas Ward, Sarah Jenkins, Liam O’Connor',
      director: 'Kavita Sundaram',
      format: 'Dolby Cinema · 4K RGB',
      poster_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85',
      synopsis: 'Two strangers find a second chance in a sprawling nocturnal metropolis that never sleeps, navigating secrets, art, and high-stakes syndicate intrigue.'
    },
    {
      title: 'The Quiet Wild',
      banner_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2200&q=90',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      genre: 'Thriller · Mystery · Crime',
      cast_members: 'Vijay Sethupathi, Priya Bhavani, Gautham Menon',
      director: 'Vignesh Shivan',
      format: '4K Laser · 7.1 Surround',
      poster_url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85',
      synopsis: 'A missing-person investigation takes a seasoned detective deep into ancient Western Ghats rainforests, where folklore and cold reality collide.'
    }
  ];

  for (const u of updates) {
    await pool.query(`
      UPDATE movies 
      SET banner_url = COALESCE($1, banner_url),
          trailer_url = COALESCE($2, trailer_url),
          genre = $3,
          cast_members = $4,
          director = $5,
          format = $6,
          poster_url = COALESCE($7, poster_url),
          synopsis = COALESCE($8, synopsis)
      WHERE title = $9
    `, [u.banner_url, u.trailer_url, u.genre, u.cast_members, u.director, u.format, u.poster_url, u.synopsis, u.title]);
  }
  console.log('✓ Updated existing movies metadata');

  // 4. Seed additional popular movies if fewer than 6
  const countRes = await pool.query('SELECT count(*)::int AS count FROM movies');
  if (countRes.rows[0].count < 6) {
    const additional = [
      {
        title: 'Cyberpunk Chronicles: 2099',
        synopsis: 'In a dystopian mega-city ruled by neural networks, a rogue hacker and an android samurai fight for human autonomy.',
        language: 'English',
        duration_minutes: 138,
        release_date: '2026-12-01',
        poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=85',
        banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        rating: 8.8,
        status: 'now_showing',
        featured: true,
        genre: 'Action · Sci-Fi · Cyberpunk',
        cast_members: 'Keanu Vance, Zoe Kravitz, Hiroyuki Sanada',
        director: 'Dennis Villeneuve',
        format: 'IMAX 3D Laser · Dolby Atmos'
      },
      {
        title: 'Golden Sands: The Empire',
        synopsis: 'An epic historic saga chronicling the rise of desert empires, dynasty battles, and legendary conquerors of antiquity.',
        language: 'Tamil',
        duration_minutes: 165,
        release_date: '2026-11-28',
        poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=85',
        banner_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        rating: 9.3,
        status: 'now_showing',
        featured: true,
        genre: 'Historical · Period Epic · Action',
        cast_members: 'Vikram, Karthi, Trisha Krishnan, Jayam Ravi',
        director: 'Mani Ratnam',
        format: '4K Ultra HD · Dolby Atmos'
      },
      {
        title: 'Echoes of Eternity',
        synopsis: 'A heartfelt romantic drama about two musicians whose lives intertwine across European cities over three decades.',
        language: 'English',
        duration_minutes: 122,
        release_date: '2026-12-15',
        poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=700&q=85',
        banner_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        rating: 8.5,
        status: 'coming_soon',
        featured: false,
        genre: 'Romance · Musical · Drama',
        cast_members: 'Timothée Chalamet, Florence Pugh',
        director: 'Greta Gerwig',
        format: 'Dolby Cinema 4K'
      },
      {
        title: 'Speed Velocity: Apex',
        synopsis: 'Formula racing prodigies clash on world circuits under unprecedented telemetry stakes and high-octane rivalries.',
        language: 'English',
        duration_minutes: 130,
        release_date: '2026-12-24',
        poster_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=700&q=85',
        banner_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        rating: 8.9,
        status: 'coming_soon',
        featured: false,
        genre: 'Action · Sports · Thriller',
        cast_members: 'Brad Pitt, Damson Idris, Javier Bardem',
        director: 'Joseph Kosinski',
        format: 'IMAX Laser 4K'
      }
    ];

    for (const m of additional) {
      await pool.query(`
        INSERT INTO movies (title, synopsis, language, duration_minutes, release_date, poster_url, banner_url, trailer_url, rating, status, featured, genre, cast_members, director, format)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (title) DO NOTHING
      `, [m.title, m.synopsis, m.language, m.duration_minutes, m.release_date, m.poster_url, m.banner_url, m.trailer_url, m.rating, m.status, m.featured, m.genre, m.cast_members, m.director, m.format]);
    }
    console.log('✓ Seeded additional movies');
  }

  // 5. Seed initial Hero Banners for Carousel
  const bannerCount = await pool.query('SELECT count(*)::int AS count FROM banners');
  if (bannerCount.rows[0].count === 0) {
    const bannersSeed = [
      {
        title: 'The Last Horizon',
        description: 'Experience the ultimate deep-space expedition in stunning IMAX 4K Laser with 64-channel spatial sound.',
        image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        language: 'English',
        genre: 'Sci-Fi · Adventure · Mystery',
        duration_minutes: 128,
        format: 'IMAX 4K Laser · Dolby Atmos',
        button_text: 'Book Tickets',
        display_order: 1
      },
      {
        title: 'Cyberpunk Chronicles: 2099',
        description: 'Immerse into neon dystopia where technology and humanity collide at terminal velocity.',
        image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        language: 'English',
        genre: 'Action · Sci-Fi · Cyberpunk',
        duration_minutes: 138,
        format: 'Dolby Cinema · 4K RGB',
        button_text: 'Reserve Recliner',
        display_order: 2
      },
      {
        title: 'Golden Sands: The Empire',
        description: 'The monumental historical action spectacle directed by Mani Ratnam. Now showing across all premium multiplexes.',
        image_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        language: 'Tamil',
        genre: 'Historical · Period Epic · Action',
        duration_minutes: 165,
        format: '4K Ultra HD · Dolby Atmos',
        button_text: 'Book Tickets Now',
        display_order: 3
      },
      {
        title: 'Neon Afterglow',
        description: 'A stylish neo-noir thriller exploring redemption, secrets, and midnight passions in the cyber metropolis.',
        image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2200&q=90',
        trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
        language: 'English',
        genre: 'Drama · Cyber Noir · Thriller',
        duration_minutes: 116,
        format: 'PVR LUXE · Dolby Atmos',
        button_text: 'Book Tickets',
        display_order: 4
      }
    ];

    for (const b of bannersSeed) {
      // Find matching movie id if exists
      const mRes = await pool.query('SELECT id FROM movies WHERE title = $1 LIMIT 1', [b.title]);
      const mId = mRes.rows[0]?.id || null;
      await pool.query(`
        INSERT INTO banners (title, description, image_url, trailer_url, movie_id, language, genre, duration_minutes, format, button_text, display_order, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      `, [b.title, b.description, b.image_url, b.trailer_url, mId, b.language, b.genre, b.duration_minutes, b.format, b.button_text, b.display_order]);
    }
    console.log('✓ Seeded initial banners');
  }

  // 6. Ensure shows exist for the new movies so seat selection works immediately
  const moviesWithShows = await pool.query('SELECT DISTINCT movie_id FROM shows');
  const existingMovieIdsWithShows = new Set(moviesWithShows.rows.map(r => String(r.movie_id)));
  const allMovies = await pool.query('SELECT id, title FROM movies');
  const screens = await pool.query('SELECT id, theatre_id FROM screens LIMIT 4');

  if (screens.rows.length > 0) {
    for (const m of allMovies.rows) {
      if (!existingMovieIdsWithShows.has(String(m.id))) {
        for (let day = 0; day < 3; day++) {
          const baseDate = new Date();
          baseDate.setDate(baseDate.getDate() + day);
          const times = ['10:30:00', '14:15:00', '18:45:00', '22:00:00'];
          for (let i = 0; i < times.length; i++) {
            const screen = screens.rows[i % screens.rows.length];
            const startStr = `${baseDate.toISOString().split('T')[0]} ${times[i]}+05:30`;
            const endStr = `${baseDate.toISOString().split('T')[0]} 23:59:00+05:30`;
            const sRes = await pool.query(`
              INSERT INTO shows (movie_id, screen_id, starts_at, ends_at, status)
              VALUES ($1, $2, $3, $4, 'scheduled')
              RETURNING id
            `, [m.id, screen.id, startStr, endStr]);

            const showId = sRes.rows[0].id;
            // Seed seat prices for this show
            await pool.query(`
              INSERT INTO show_seat_prices (show_id, seat_id, price_minor)
              SELECT $1, id, CASE WHEN category = 'premium' THEN 32000 ELSE 19000 END
              FROM seats WHERE screen_id = $2
              ON CONFLICT DO NOTHING
            `, [showId, screen.id]);
          }
        }
        console.log(`✓ Generated scheduled shows and seat pricing for movie "${m.title}"`);
      }
    }
  }

  console.log('--- Migration Finished Successfully ---');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
