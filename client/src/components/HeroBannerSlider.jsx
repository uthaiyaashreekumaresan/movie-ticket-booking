import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDE_DURATION = 5000;

// Exactly the user's provided cinema banner ("All New Tamil Movies - 200 Rs OFF on the Direct App")
const USER_SLIDES = [
  {
    id: 'user-main-banner',
    title: 'All New Tamil Movies - 200 Rs OFF on the Direct App',
    imageUrl: '/assets/main-banner.jpg?v=1',
    alt: 'All New Tamil Movies 200 Rs OFF Banner',
    movieIndex: 0
  }
];

export default function HeroBannerSlider({
  movies = [],
  onBookMovie,
  onExploreMovies
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const hasMultipleSlides = USER_SLIDES.length > 1;

  // Slide transition only when more than 1 slide exists
  useEffect(() => {
    if (!hasMultipleSlides || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % USER_SLIDES.length);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, hasMultipleSlides]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (!hasMultipleSlides) return;
    setCurrentIndex((prev) => (prev === 0 ? USER_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (!hasMultipleSlides) return;
    setCurrentIndex((prev) => (prev + 1) % USER_SLIDES.length);
  };

  const handleDotClick = (idx, e) => {
    e?.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div className="hero-slider-wrap">
      <section
        className="movie-banner-slider-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Featured Movie Banner"
      >
        <div className="movie-banner-viewport">
          {USER_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const targetMovie = movies && movies.length > 0 ? movies[slide.movieIndex % movies.length] : null;

            return (
              <div
                key={slide.id}
                className={`movie-banner-slide slide-${slide.id} ${isActive ? 'active' : ''}`}
                aria-hidden={!isActive}
                onClick={() => {
                  if (onBookMovie && targetMovie) {
                    onBookMovie(targetMovie);
                  } else if (onExploreMovies) {
                    onExploreMovies();
                  } else {
                    document.getElementById('now-showing')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                role="button"
                tabIndex={0}
                title="Click to explore now showing movies"
              >
                <div className="banner-centered-frame">
                  <img
                    src={slide.imageUrl}
                    alt={slide.alt}
                    className="banner-main-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/main-banner.png';
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Navigation Arrows (Only shown when multiple slides exist) */}
        {hasMultipleSlides && (
          <>
            <button
              type="button"
              className="banner-nav-arrow banner-nav-prev"
              onClick={handlePrev}
              aria-label="Previous banner"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className="banner-nav-arrow banner-nav-next"
              onClick={handleNext}
              aria-label="Next banner"
            >
              <ChevronRight size={22} />
            </button>

            <div className="banner-pagination-dots" aria-label="Slider pagination">
              {USER_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    className={`banner-dot-btn ${isActive ? 'active' : ''}`}
                    onClick={(e) => handleDotClick(idx, e)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
