import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, Film, Calendar, MapPin, Play, Ticket } from 'lucide-react';

// Fallback Tamil New Movies Cards with Pinterest & High-Res posters
const TAMIL_HERO_CARDS = [
  {
    id: 'goat',
    title: 'The GOAT',
    actor: 'Thalapathy Vijay',
    genre: 'Tamil · Sci-Fi / Action',
    rating: '8.8',
    posterUrl: '/assets/posters/goat.jpg',
    fallbackPoster: '/assets/posters/goat.jpg',
    position: 'left',
    rotation: '-9deg',
    badge: 'Mega Blockbuster'
  },
  {
    id: 'amaran',
    title: 'Amaran',
    actor: 'Sivakarthikeyan · Sai Pallavi',
    genre: 'Tamil · Action / Biography',
    rating: '9.2',
    posterUrl: '/assets/posters/amaran-hq.jpg',
    fallbackPoster: '/assets/posters/amaran-hq.jpg',
    position: 'center',
    rotation: '0deg',
    badge: 'Trending #1'
  },
  {
    id: 'vettaiyan',
    title: 'Vettaiyan',
    actor: 'Superstar Rajinikanth',
    genre: 'Tamil · Action / Crime',
    rating: '8.6',
    posterUrl: '/assets/posters/vettaiyan.png',
    fallbackPoster: '/assets/posters/vettaiyan.png',
    position: 'right',
    rotation: '9deg',
    badge: 'Record Breaker'
  }
];

export default function CinegoHeroBanner({
  banners = [],
  movies = [],
  city = 'Coimbatore',
  onCityChange,
  availableCities = ['Coimbatore', 'Chennai', 'Pudukkottai', 'Madurai', 'Trichy', 'Salem'],
  onSelectMovie,
  triggerToast
}) {
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Filter Now Showing Tamil movies
  const tamilMovies = movies.length > 0
    ? movies
    : [
        { id: 'm-1', title: 'Amaran', genre: 'Tamil · Action / Biography', poster_url: '/assets/posters/amaran-hq.jpg' },
        { id: 'm-2', title: 'The Greatest of All Time (GOAT)', genre: 'Tamil · Sci-Fi / Action', poster_url: '/assets/posters/goat.jpg' },
        { id: 'm-3', title: 'Vettaiyan', genre: 'Tamil · Action / Crime', poster_url: '/assets/posters/vettaiyan.png' },
        { id: 'm-4', title: 'Kanguva', genre: 'Tamil · Fantasy / Action', poster_url: '/assets/posters/kanguva.jpg' },
        { id: 'm-5', title: 'Maharaja', genre: 'Tamil · Thriller', poster_url: '/assets/posters/maharaja.jpg' },
        { id: 'm-6', title: 'Raayan', genre: 'Tamil · Action / Crime', poster_url: '/assets/posters/raayan.jpg' }
      ];

  // Derive cards dynamically from active database banners (managed by Admin Panel)
  const activeBanners = (banners || []).filter((b) => b.active !== false);

  let allCards = [];
  if (activeBanners.length > 0) {
    allCards = activeBanners.map((b, idx) => {
      const matchingMovie = (movies || []).find((m) =>
        (b.movie_id && String(m.id) === String(b.movie_id)) ||
        m.title.toLowerCase().includes(b.title.toLowerCase()) ||
        b.title.toLowerCase().includes(m.title.toLowerCase())
      );

      return {
        id: b.id,
        bannerId: b.id,
        title: b.title,
        actor: b.description || matchingMovie?.director || 'Blockbuster Special',
        genre: b.genre || b.format || matchingMovie?.genre || 'Tamil · Action / Drama',
        rating: matchingMovie?.rating ? String(matchingMovie.rating) : '9.0',
        posterUrl: b.image_url,
        fallbackPoster: matchingMovie?.poster_url || '/assets/posters/amaran-hq.jpg',
        badge: idx === 0 ? 'Trending #1' : idx === 1 ? 'Mega Blockbuster' : idx === 2 ? 'Record Breaker' : 'Popular',
        movie: matchingMovie
      };
    });
  } else {
    // Default fallback cards if database has no active banners yet
    allCards = TAMIL_HERO_CARDS.map((card) => {
      const matchingMovie = (movies || []).find((m) =>
        m.title.toLowerCase().includes(card.title.toLowerCase()) ||
        card.title.toLowerCase().includes(m.title.toLowerCase())
      );
      return {
        ...card,
        posterUrl: matchingMovie?.poster_url || card.posterUrl,
        rating: matchingMovie?.rating ? String(matchingMovie.rating) : card.rating,
        movie: matchingMovie
      };
    });
  }

  // Assign fanned-out layout positions: left, center, right
  let stageCards = [];
  if (allCards.length === 1) {
    stageCards = [{ ...allCards[0], position: 'center' }];
  } else if (allCards.length === 2) {
    stageCards = [
      { ...allCards[0], position: 'left' },
      { ...allCards[1], position: 'center' }
    ];
  } else if (allCards.length === 3) {
    stageCards = [
      { ...allCards[0], position: 'left' },
      { ...allCards[1], position: 'center' },
      { ...allCards[2], position: 'right' }
    ];
  } else {
    // For 4+ banners, display 3 with sliding window based on carouselIndex
    const total = allCards.length;
    const c0 = allCards[carouselIndex % total];
    const c1 = allCards[(carouselIndex + 1) % total];
    const c2 = allCards[(carouselIndex + 2) % total];
    stageCards = [
      { ...c0, position: 'left' },
      { ...c1, position: 'center' },
      { ...c2, position: 'right' }
    ];
  }

  const handleBookTickets = () => {
    let target = null;
    if (selectedMovieId) {
      target = tamilMovies.find((m) => String(m.id) === String(selectedMovieId) || m.title.toLowerCase().includes(selectedMovieId.toLowerCase()));
    }
    if (!target && stageCards.length > 0) {
      // Pick active center card or first card
      const centerCard = stageCards.find(c => c.position === 'center') || stageCards[0];
      target = centerCard.movie || tamilMovies.find(m => m.title.toLowerCase().includes(centerCard.title.toLowerCase()));
    }
    if (!target && tamilMovies.length > 0) {
      target = tamilMovies[0];
    }

    if (target && onSelectMovie) {
      onSelectMovie(target);
    } else {
      document.getElementById('now-showing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCardClick = (card) => {
    // If carousel has 4+ cards and user clicks a side card, rotate it to center
    if (allCards.length > 3) {
      if (card.position === 'left') {
        setCarouselIndex((prev) => (prev - 1 + allCards.length) % allCards.length);
        return;
      }
      if (card.position === 'right') {
        setCarouselIndex((prev) => (prev + 1) % allCards.length);
        return;
      }
    }

    let target = card.movie;
    if (!target) {
      target = tamilMovies.find(
        (m) =>
          m.title.toLowerCase().includes(card.title.toLowerCase()) ||
          card.title.toLowerCase().includes(m.title.toLowerCase())
      );
    }
    if (target && onSelectMovie) {
      onSelectMovie(target);
    } else if (onSelectMovie) {
      onSelectMovie({
        id: card.id,
        title: card.title,
        genre: card.genre,
        poster_url: card.posterUrl,
        language: 'Tamil',
        rating: card.rating
      });
    }
  };

  return (
    <div className="cinego-hero-wrapper">
      <div className="cinego-hero-container">
        {/* Left Column: Heading, Subtext & Quick Booking Bar */}
        <div className="cinego-hero-left">
          <div className="cinego-hero-tag">
            <span className="hero-tag-dot" />
            <span>Now booking · Dec releases</span>
          </div>

          <h1 className="cinego-hero-heading">
            Book your seat.<br />
            Skip the queue.
          </h1>

          <p className="cinego-hero-subtext">
            Pick a movie, choose your seats and get tickets on your phone in under a minute.
          </p>

          {/* Quick Booking Filter Bar matching reference */}
          <div className="cinego-quick-book-box">
            {/* Field 1: City */}
            <div className="quick-field-group">
              <label className="quick-field-label">City</label>
              <div className="quick-select-wrap">
                <select
                  value={city}
                  onChange={(e) => onCityChange?.(e.target.value)}
                  className="quick-select"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="quick-chevron" />
              </div>
            </div>

            {/* Field 2: Movie */}
            <div className="quick-field-group">
              <label className="quick-field-label">Movie</label>
              <div className="quick-select-wrap">
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="quick-select"
                >
                  <option value="">Select movie</option>
                  {tamilMovies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="quick-chevron" />
              </div>
            </div>

            {/* Field 3: Date */}
            <div className="quick-field-group">
              <label className="quick-field-label">Date</label>
              <div className="quick-select-wrap">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="quick-select"
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Day After">Day After</option>
                </select>
                <ChevronDown size={14} className="quick-chevron" />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="btn-cinego-book-action"
              onClick={handleBookTickets}
            >
              Book tickets
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Fanned-out Tamil Movie Cards from Admin Panel */}
        <div className="cinego-hero-right">
          <div className="cinego-cards-stage">
            {stageCards.map((card) => {
              const isHovered = hoveredCardId === card.id;

              return (
                <div
                  key={card.id}
                  className={`cinego-fanned-card card-pos-${card.position} ${isHovered ? 'hovered' : ''}`}
                  onClick={() => handleCardClick(card)}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  role="button"
                  tabIndex={0}
                  title={`Click to book tickets for ${card.title}`}
                >
                  <div className="card-poster-frame">
                    <img
                      src={card.posterUrl}
                      alt={card.title}
                      className="card-poster-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = card.fallbackPoster;
                      }}
                      loading="eager"
                    />
                    <div className="card-gradient-overlay" />

                    {/* Top Badge */}
                    <div className="card-top-badge">
                      <Sparkles size={11} />
                      <span>{card.badge}</span>
                    </div>

                    {/* Bottom Title & Details */}
                    <div className="card-info-bottom">
                      <h3 className="card-movie-title">{card.title}</h3>
                      <p className="card-movie-subtitle">{card.actor}</p>
                      <div className="card-rating-chip">
                        <span>★ {card.rating}</span>
                        <span>•</span>
                        <span>Tamil</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Controls when there are 4+ banners */}
            {allCards.length > 3 && (
              <div className="cinego-carousel-controls">
                <button
                  type="button"
                  className="btn-carousel-nav prev"
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + allCards.length) % allCards.length)}
                  title="Previous banner"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="carousel-dots-indicator">
                  {allCards.map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`carousel-dot ${dotIdx === (carouselIndex + 1) % allCards.length ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(dotIdx === 0 ? allCards.length - 1 : dotIdx - 1)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-carousel-nav next"
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % allCards.length)}
                  title="Next banner"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
