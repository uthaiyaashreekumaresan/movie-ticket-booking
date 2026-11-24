import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bell, Check, Play } from 'lucide-react';

export default function UpcomingMoviesCarousel({
  movies = [],
  onSelectMovie,
  triggerToast
}) {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [remindedMovies, setRemindedMovies] = useState({});

  // Helper to extract clean single genre word (e.g. "Gangster", "Action", "Thriller")
  const getSingleGenre = (movie) => {
    const raw = movie.genre || movie.genre_display || 'Action';
    const clean = raw.replace(/Tamil\s*[•|·-]?\s*/gi, '').trim();
    const parts = clean.split(/[|/•·,]/).map((s) => s.trim()).filter(Boolean);
    return parts[0] || 'Drama';
  };

  // Helper to format short date like "Jun 05", "May 01", "Aug 15"
  const getShortDate = (dateVal) => {
    if (!dateVal) return 'Coming Soon';
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = String(d.getDate()).padStart(2, '0');
        return `${month} ${day}`;
      }
    } catch {
      // fallback
    }
    // If string like "June 5, 2025"
    const match = String(dateVal).match(/([A-Za-z]+)\s+(\d+)/);
    if (match) {
      const m = match[1].slice(0, 3);
      const day = match[2].padStart(2, '0');
      return `${m} ${day}`;
    }
    return String(dateVal).slice(0, 6);
  };

  // Scroll listener to update progress bar
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(100);
    } else {
      const pct = Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100));
      setScrollProgress(pct);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [movies]);

  const scrollLeftAction = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRightAction = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleRemindMe = (e, movie) => {
    e.stopPropagation();
    const isAlready = remindedMovies[movie.id];
    setRemindedMovies((prev) => ({
      ...prev,
      [movie.id]: !isAlready
    }));

    if (!isAlready) {
      triggerToast?.(`Reminder set for ${movie.title}! We will notify you when bookings open.`);
    } else {
      triggerToast?.(`Reminder removed for ${movie.title}.`);
    }
  };

  return (
    <section id="coming-soon" className="upcoming-section-wrapper">
      <div className="container-custom">
        {/* Section Header matching reference */}
        <div className="upcoming-header-row">
          <div className="upcoming-title-col">
            <span className="upcoming-tagline">Coming soon</span>
            <h2 className="upcoming-main-title">Upcoming movies</h2>
          </div>
          <div className="upcoming-helper-col">
            <span className="upcoming-swipe-hint">Swipe or scroll sideways →</span>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollContainerRef}
          className="upcoming-cards-scroll-track"
        >
          {movies.map((movie) => {
            const genre = getSingleGenre(movie);
            const dateStr = getShortDate(movie.release_date);
            const isReminded = Boolean(remindedMovies[movie.id]);

            return (
              <div
                key={movie.id || movie.title}
                className="upcoming-card-col"
              >
                {/* Poster Card */}
                <div
                  className="upcoming-poster-card"
                  onClick={() => onSelectMovie?.(movie)}
                  title={`Click to view details & trailer for ${movie.title}`}
                >
                  {/* Genre Pill at Top-Left */}
                  <span className="upcoming-genre-pill">{genre}</span>

                  {/* Poster Image */}
                  <img
                    src={movie.poster_url || '/assets/posters/thug-life.jpg'}
                    alt={movie.title}
                    className="upcoming-poster-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/posters/thug-life.jpg';
                    }}
                  />

                  {/* Gradient Overlay for text contrast */}
                  <div className="upcoming-card-gradient" />

                  {/* Bold White Movie Title */}
                  <div className="upcoming-title-wrap">
                    <h3 className="upcoming-movie-title">{movie.title}</h3>
                  </div>
                </div>

                {/* Footer Row: Release Date & Remind Me Pill */}
                <div className="upcoming-card-footer">
                  <span className="upcoming-date-text">{dateStr}</span>
                  <button
                    type="button"
                    className={`btn-upcoming-remind ${isReminded ? 'active' : ''}`}
                    onClick={(e) => handleRemindMe(e, movie)}
                  >
                    {isReminded ? (
                      <>
                        <Check size={13} strokeWidth={2.5} />
                        <span>Reminded</span>
                      </>
                    ) : (
                      <>
                        <Bell size={13} />
                        <span>Remind me</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation & Progress Track */}
        <div className="upcoming-progress-nav-bar">
          <button
            type="button"
            className="upcoming-nav-arrow left"
            onClick={scrollLeftAction}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>

          <div className="upcoming-progress-track">
            <div
              className="upcoming-progress-fill"
              style={{
                width: `${Math.max(15, scrollProgress)}%`
              }}
            />
          </div>

          <button
            type="button"
            className="upcoming-nav-arrow right"
            onClick={scrollRightAction}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
