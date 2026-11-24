import 'dotenv/config';
import { pool } from './pool.js';

async function seedTamilMovies() {
  console.log('Migrating database to 100% Tamil Movies and Banners...');

  // 1. Reassign shows pointing to old dummy movies (id <= 15) to Tamil movies (16..22)
  const tamilNowShowingIds = [16, 17, 18, 19, 20, 21, 22]; // Amaran, GOAT, Vettaiyan, Kanguva, Maharaja, Lubber Pandhu, Raayan
  
  // Shows pointing to movie 1 (which has bookings) -> assign to 16 (Amaran)
  await pool.query('UPDATE shows SET movie_id = 16 WHERE movie_id = 1');
  
  // Shows pointing to other dummy movies 2..15 -> assign across 16..22
  const dummyShows = await pool.query('SELECT id, movie_id FROM shows WHERE movie_id <= 15');
  for (let i = 0; i < dummyShows.rows.length; i++) {
    const targetMovieId = tamilNowShowingIds[i % tamilNowShowingIds.length];
    await pool.query('UPDATE shows SET movie_id = $1 WHERE id = $2', [targetMovieId, dummyShows.rows[i].id]);
  }

  // 2. Delete relations for dummy movies <= 15
  await pool.query('DELETE FROM movie_genres WHERE movie_id <= 15').catch(() => {});
  await pool.query('DELETE FROM reviews WHERE movie_id <= 15').catch(() => {});
  await pool.query('DELETE FROM wishes WHERE movie_id <= 15').catch(() => {});
  await pool.query('DELETE FROM movies WHERE id <= 15');

  console.log('Dummy movies 1-15 deleted cleanly.');

  // 3. Update the 10 Tamil movies (16..25) with authentic Tamil info and posters
  const tamilMovies = [
    {
      id: 16,
      title: 'Amaran',
      synopsis: 'The heroic true story of Major Mukund Varadarajan AC, an Indian Army officer who led a counter-terrorism operation in Shopian, Kashmir with supreme valor and love.',
      language: 'Tamil',
      duration_minutes: 169,
      release_date: '2024-10-31',
      poster_url: '/assets/posters/amaran-hq.jpg',
      banner_url: '/assets/banner-1.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=hylIXfXnPxg',
      rating: 9.2,
      status: 'now_showing',
      featured: true,
      genre: 'Action | Biography | Drama',
      cast_members: 'Sivakarthikeyan, Sai Pallavi, Bhuvan Arora, Rahul Bose',
      director: 'Rajkumar Periasamy',
      format: 'Tamil • 2D • Dolby Atmos'
    },
    {
      id: 17,
      title: 'The Greatest of All Time (GOAT)',
      synopsis: 'Gandhi, an elite special anti-terrorist squad hostage negotiator and field operative, confronts secrets from his past when an unexpected clone reappears.',
      language: 'Tamil',
      duration_minutes: 179,
      release_date: '2024-09-05',
      poster_url: '/assets/posters/goat.jpg',
      banner_url: '/assets/banner-2.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=jxCRlebiebw',
      rating: 8.8,
      status: 'now_showing',
      featured: true,
      genre: 'Action | Sci-Fi | Thriller',
      cast_members: 'Thalapathy Vijay, Prashanth, Prabhu Deva, Sneha, Meenakshi Chaudhary',
      director: 'Venkat Prabhu',
      format: 'Tamil • IMAX 2D • Dolby Atmos'
    },
    {
      id: 18,
      title: 'Vettaiyan',
      synopsis: 'SP Athiyan IPS, a renowned encounter specialist known as Vettaiyan, takes down an elusive criminal network targeting students in a massive scam.',
      language: 'Tamil',
      duration_minutes: 163,
      release_date: '2024-10-10',
      poster_url: '/assets/posters/vettaiyan.png',
      banner_url: '/assets/banner-3.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=m_P_fFfB6g8',
      rating: 8.8,
      status: 'now_showing',
      featured: true,
      genre: 'Action | Crime | Drama',
      cast_members: 'Superstar Rajinikanth, Amitabh Bachchan, Fahadh Faasil, Rana Daggubati, Manju Warrier',
      director: 'T. J. Gnanavel',
      format: 'Tamil • 2D • Dolby Atmos'
    },
    {
      id: 19,
      title: 'Kanguva',
      synopsis: 'A fearless tribal warrior in 1070 AD fights to protect his people, spiritually linked across a millennium to a high-tech modern shadow operator in 2024.',
      language: 'Tamil',
      duration_minutes: 154,
      release_date: '2024-11-14',
      poster_url: '/assets/posters/kanguva.jpg',
      banner_url: '/assets/main-banner.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=Qab4C5X9w6k',
      rating: 8.6,
      status: 'now_showing',
      featured: true,
      genre: 'Action | Period | Fantasy',
      cast_members: 'Suriya, Bobby Deol, Disha Patani, Yogi Babu',
      director: 'Siva',
      format: 'Tamil • 3D • IMAX 3D'
    },
    {
      id: 20,
      title: 'Maharaja',
      synopsis: 'A quiet salon barber visits a police station reporting his home iron dustbin was stolen, pulling investigators into a layered web of justice and revenge.',
      language: 'Tamil',
      duration_minutes: 141,
      release_date: '2024-06-14',
      poster_url: '/assets/posters/maharaja.jpg',
      banner_url: '/assets/banner-1.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.4,
      status: 'now_showing',
      featured: false,
      genre: 'Thriller | Action | Mystery',
      cast_members: 'Vijay Sethupathi, Anurag Kashyap, Mamta Mohandas, Natty',
      director: 'Nithilan Saminathan',
      format: 'Tamil • 2D • Dolby Atmos'
    },
    {
      id: 21,
      title: 'Lubber Pandhu',
      synopsis: 'An intense street-cricket rivalry between a seasoned gully cricketer and an energetic youngster evolves into a heartwarming generational contest.',
      language: 'Tamil',
      duration_minutes: 148,
      release_date: '2024-09-20',
      poster_url: '/assets/posters/lubber-pandhu.jpg',
      banner_url: '/assets/banner-2.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.1,
      status: 'now_showing',
      featured: false,
      genre: 'Drama | Sports | Comedy',
      cast_members: 'Harish Kalyan, Attakathi Dinesh, Sanjana Krishnamoorthy, Swasika',
      director: 'Tamizharasan Pachamuthu',
      format: 'Tamil • 2D'
    },
    {
      id: 22,
      title: 'Raayan',
      synopsis: 'A simple young man running a fast food stall in North Chennai is forced into a brutal war against ruthless local gangsters to protect his siblings.',
      language: 'Tamil',
      duration_minutes: 145,
      release_date: '2024-07-26',
      poster_url: '/assets/posters/raayan.jpg',
      banner_url: '/assets/banner-3.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=qQJJkhhW20E',
      rating: 8.7,
      status: 'now_showing',
      featured: false,
      genre: 'Action | Crime | Drama',
      cast_members: 'Dhanush, SJ Suryah, Sundeep Kishan, Kalidas Jayaram, Dushara Vijayan',
      director: 'Dhanush',
      format: 'Tamil • 2D • Dolby Atmos'
    },
    {
      id: 23,
      title: 'Thug Life',
      synopsis: 'Rangaraaya Sakthivel Nayakar journeys across international crime syndicates between Tokyo and Tamil Nadu in a gripping gangster saga.',
      language: 'Tamil',
      duration_minutes: 155,
      release_date: '2025-06-05',
      poster_url: '/assets/posters/thug-life.jpg',
      banner_url: '/assets/main-banner.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.5,
      status: 'coming_soon',
      featured: true,
      genre: 'Gangster | Action | Drama',
      cast_members: 'Kamal Haasan, Silambarasan TR, Trisha, Ali Fazal, Ashok Selvan',
      director: 'Mani Ratnam',
      format: 'Tamil • 2D • IMAX'
    },
    {
      id: 24,
      title: 'Good Bad Ugly',
      synopsis: 'AK enters the dangerous underworld in an adrenaline-packed stylized action thriller full of twists and high-octane sequences.',
      language: 'Tamil',
      duration_minutes: 150,
      release_date: '2025-05-01',
      poster_url: '/assets/posters/good-bad-ugly.jpg',
      banner_url: '/assets/banner-1.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.3,
      status: 'coming_soon',
      featured: true,
      genre: 'Action | Thriller',
      cast_members: 'Ajith Kumar, Trisha Krishnan, Arjun Das, Sunil',
      director: 'Adhik Ravichandran',
      format: 'Tamil • 2D • Dolby Atmos'
    },
    {
      id: 25,
      title: 'Kubera',
      synopsis: 'A gritty socio-economic drama diving into wealth, ambition, and survival on the streets of Mumbai and Chennai.',
      language: 'Tamil',
      duration_minutes: 145,
      release_date: '2025-07-18',
      poster_url: '/assets/posters/kubera.jpg',
      banner_url: '/assets/banner-2.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.0,
      status: 'coming_soon',
      featured: false,
      genre: 'Drama | Thriller',
      cast_members: 'Dhanush, Nagarjuna Akkineni, Rashmika Mandanna, Jim Sarbh',
      director: 'Sekhar Kammula',
      format: 'Tamil • 2D'
    },
    {
      id: 26,
      title: 'Coolie',
      synopsis: 'Superstar Rajinikanth teams up with director Lokesh Kanagaraj for a gritty gold-smuggling action thriller set in Chennai port.',
      language: 'Tamil',
      duration_minutes: 155,
      release_date: '2025-08-15',
      poster_url: '/assets/posters/coolie.jpg',
      banner_url: '/assets/banner-3.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.6,
      status: 'coming_soon',
      featured: true,
      genre: 'Action | Crime | Thriller',
      cast_members: 'Rajinikanth, Nagarjuna Akkineni, Soubin Shahir, Shruti Haasan, Sathyaraj',
      director: 'Lokesh Kanagaraj',
      format: 'Tamil • 2D • IMAX'
    },
    {
      id: 27,
      title: 'Vidaamuyarchi',
      synopsis: 'A thrilling survival action saga following an ordinary man who faces perilous road chases in Azerbaijan to protect what matters most.',
      language: 'Tamil',
      duration_minutes: 150,
      release_date: '2025-04-14',
      poster_url: '/assets/posters/vidaamuyarchi.jpg',
      banner_url: '/assets/banner-2.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      rating: 9.2,
      status: 'coming_soon',
      featured: true,
      genre: 'Action | Thriller | Adventure',
      cast_members: 'Ajith Kumar, Trisha Krishnan, Arjun Sarja, Aarav, Regina Cassandra',
      director: 'Magizh Thirumeni',
      format: 'Tamil • 2D • Dolby Atmos'
    }
  ];

  for (const m of tamilMovies) {
    const existing = await pool.query('SELECT id FROM movies WHERE id = $1', [m.id]);
    if (existing.rowCount > 0) {
      await pool.query(
        `UPDATE movies
         SET title=$1, synopsis=$2, language=$3, duration_minutes=$4, release_date=$5,
             poster_url=$6, banner_url=$7, trailer_url=$8, rating=$9, status=$10,
             featured=$11, genre=$12, cast_members=$13, director=$14, format=$15
         WHERE id=$16`,
        [
          m.title, m.synopsis, m.language, m.duration_minutes, m.release_date,
          m.poster_url, m.banner_url, m.trailer_url, m.rating, m.status,
          m.featured, m.genre, m.cast_members, m.director, m.format, m.id
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO movies
         (id, title, synopsis, language, duration_minutes, release_date, poster_url, banner_url, trailer_url, rating, status, featured, genre, cast_members, director, format)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          m.id, m.title, m.synopsis, m.language, m.duration_minutes, m.release_date,
          m.poster_url, m.banner_url, m.trailer_url, m.rating, m.status,
          m.featured, m.genre, m.cast_members, m.director, m.format
        ]
      );
    }
  }

  console.log('Updated all Tamil movies (16-27) with genuine Tamil posters and metadata.');

  // 4. Update Banners in database to point to top Tamil movies
  await pool.query('DELETE FROM banners');
  const banners = [
    {
      title: 'The GOAT',
      description: 'Thalapathy Vijay in an electrifying double role action spectacle.',
      image_url: '/assets/banner-2.jpg',
      button_text: 'Book Tickets',
      language: 'Tamil',
      genre: 'Tamil · Sci-Fi / Action',
      format: 'IMAX 2D · Dolby Atmos',
      display_order: 1,
      active: true,
      movie_id: 17
    },
    {
      title: 'Amaran',
      description: 'Sivakarthikeyan & Sai Pallavi in the most acclaimed war biopic.',
      image_url: '/assets/banner-1.jpg',
      button_text: 'Book Tickets',
      language: 'Tamil',
      genre: 'Tamil · Action / Biography',
      format: '2D · Dolby Atmos',
      display_order: 2,
      active: true,
      movie_id: 16
    },
    {
      title: 'Vettaiyan',
      description: 'Superstar Rajinikanth delivers a powerful justice hunt.',
      image_url: '/assets/banner-3.jpg',
      button_text: 'Book Tickets',
      language: 'Tamil',
      genre: 'Tamil · Action / Crime',
      format: '2D · Dolby Atmos',
      display_order: 3,
      active: true,
      movie_id: 18
    }
  ];

  for (const b of banners) {
    await pool.query(
      `INSERT INTO banners (title, description, image_url, button_text, language, genre, format, display_order, active, movie_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [b.title, b.description, b.image_url, b.button_text, b.language, b.genre, b.format, b.display_order, b.active, b.movie_id]
    );
  }

  console.log('Seeded banners successfully!');
  await pool.end();
}

seedTamilMovies().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
