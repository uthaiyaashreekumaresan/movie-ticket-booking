import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  X,
  Star,
  Clock,
  Film,
  Calendar,
  Play,
  Ticket,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

export default function MovieDetailsModal({
  movie,
  open = true,
  onClose,
  city = 'Chennai',
  onSelectShowtime,
  onWatchTrailer,
  allMovies = [],
  onSelectMovie
}) {
  const isOpen = open !== undefined ? Boolean(open) : Boolean(movie);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0); // 0 = today, 1 = tomorrow, 2 = day after
  const [loadingShows, setLoadingShows] = useState(false);

  // Generate next 5 dates
  const dateOptions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayIndex: i,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      isoString: d.toISOString().split('T')[0]
    };
  });

  // Fetch real shows from database for this movie & city
  useEffect(() => {
    if (!movie || !isOpen) return;
    setLoadingShows(true);
    const dateStr = dateOptions[selectedDate]?.isoString;
    fetch(`${API}/shows?movieId=${movie.id}&city=${encodeURIComponent(city)}&date=${dateStr}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.shows?.length) {
          // Group shows by theatre
          const byTheatre = {};
          d.shows.forEach((sh) => {
            if (!byTheatre[sh.theatre]) {
              byTheatre[sh.theatre] = {
                theatre: sh.theatre,
                theatre_id: sh.theatre_id,
                address: sh.address || `${city} Central Multiplex`,
                screen: sh.screen,
                shows: []
              };
            }
            byTheatre[sh.theatre].shows.push(sh);
          });
          setShows(Object.values(byTheatre));
        } else {
          // Mock fallback shows for immediate testing if none in DB for this date
          setShows([
            {
              theatre: `${city} PVR Grand Multiplex`,
              address: `Velachery Main Road, ${city}`,
              screen: 'Audi 1 (IMAX 4K Laser)',
              shows: [
                { id: 101, starts_at: `${dateStr} 10:30:00`, screen: 'Audi 1', format: 'IMAX 4K' },
                { id: 102, starts_at: `${dateStr} 14:15:00`, screen: 'Audi 1', format: 'IMAX 4K' },
                { id: 103, starts_at: `${dateStr} 18:45:00`, screen: 'Audi 1', format: 'IMAX 4K' },
                { id: 104, starts_at: `${dateStr} 22:15:00`, screen: 'Audi 1', format: 'IMAX 4K' }
              ]
            },
            {
              theatre: `PVR LUXE Cinepolis ${city}`,
              address: `Express Avenue Mall, ${city}`,
              screen: 'Audi 3 (Dolby Atmos Recliner)',
              shows: [
                { id: 201, starts_at: `${dateStr} 11:45:00`, screen: 'Audi 3', format: 'Dolby Atmos' },
                { id: 202, starts_at: `${dateStr} 15:30:00`, screen: 'Audi 3', format: 'Dolby Atmos' },
                { id: 203, starts_at: `${dateStr} 19:30:00`, screen: 'Audi 3', format: 'Dolby Atmos' }
              ]
            }
          ]);
        }
      })
      .catch(() => {
        setShows([]);
      })
      .finally(() => setLoadingShows(false));
  }, [movie, open, city, selectedDate]);

  if (!movie) return null;

  const formatShowTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="pvr-dialog-root"
      PaperProps={{
        style: {
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E5E7EB',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          margin: 16
        }
      }}
    >
      <DialogContent style={{ padding: 0, position: 'relative', overflowY: 'auto' }}>
        {/* Close Button at top-right */}
        <button className="dialog-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        {/* Content Container - Starts immediately at the top without empty space */}
        <div className="modal-content-inner">
          {/* Top Horizontal Row: Poster on Left, Movie Information on Right */}
          <div className="modal-movie-card-row">
            {/* Poster Col */}
            <div className="modal-poster-col">
              <img
                src={movie.poster_url || '/assets/posters/amaran-hq.jpg'}
                alt={movie.title}
                className="modal-poster-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/posters/amaran-hq.jpg';
                }}
              />
            </div>

            {/* Title & Metadata Col */}
            <div className="modal-meta-col">
              <div className="modal-badge-strip">
                <span className="badge-pvr-format">{movie.format || 'IMAX 4K Laser · Dolby Atmos'}</span>
                <span className="badge-pvr-lang">{movie.language || 'Tamil'}</span>
                <span className="badge-pvr-cert">{movie.certification || 'UA 16+'}</span>
              </div>

              <h1 className="modal-movie-title">{movie.title}</h1>

              <div className="modal-quick-stats">
                <div className="stat-pill">
                  <Star size={15} fill="#D91E36" color="#D91E36" />
                  <strong>{movie.rating || '8.4/10'}</strong>
                  <span className="stat-sub">/ 10</span>
                </div>
                <div className="stat-pill">
                  <Clock size={15} color="#4B5563" />
                  <span>{movie.duration_str || `${movie.duration_minutes || 140}m`}</span>
                </div>
                <div className="stat-pill">
                  <Film size={15} color="#4B5563" />
                  <span>{movie.genre || 'Action | Drama'}</span>
                </div>
              </div>

              <p className="modal-synopsis">{movie.synopsis || movie.description}</p>

              {/* Cast & Crew */}
              {(movie.director || movie.cast_members) && (
                <div className="modal-cast-crew-strip">
                  {movie.director && (
                    <div className="cast-crew-item">
                      <span className="cast-crew-role">Director:</span>
                      <span className="cast-crew-names">{movie.director}</span>
                    </div>
                  )}
                  {movie.cast_members && (
                    <div className="cast-crew-item">
                      <span className="cast-crew-role">Cast:</span>
                      <span className="cast-crew-names">{movie.cast_members}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Action Buttons: Book Tickets & Watch Trailer */}
              <div className="modal-header-actions-row">
                <button
                  type="button"
                  className="btn-cineva-book-card"
                  style={{ width: 'auto', padding: '9px 22px', fontSize: 13.5 }}
                  onClick={() => {
                    document.getElementById('modal-showtimes-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span>Book Tickets</span>
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn-modal-watch-trailer"
                  onClick={() => onWatchTrailer?.(movie)}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Watch Trailer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Theatres & Showtimes */}
          <div id="modal-showtimes-anchor" className="modal-theatres-section">
            <div className="theatres-section-header">
              <div>
                <h3 className="theatres-section-title">Select Theatre & Showtimes</h3>
                <p className="theatres-section-sub">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Showing in {city}
                </p>
              </div>

              {/* Horizontal Date Strip */}
              <div className="horizontal-date-strip">
                {dateOptions.map((opt) => {
                  const isSelected = selectedDate === opt.dayIndex;
                  return (
                    <button
                      key={opt.dayIndex}
                      className={`date-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDate(opt.dayIndex)}
                    >
                      <span className="date-pill-day">{opt.dayName}</span>
                      <span className="date-pill-num">{opt.dateNum}</span>
                      <span className="date-pill-month">{opt.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of Theatres & Shows */}
            {loadingShows ? (
              <div className="shows-loading-state">
                <span className="pvr-spinner" />
                <p>Loading available cinema halls and showtimes...</p>
              </div>
            ) : shows.length === 0 ? (
              <div className="shows-empty-state">
                <Ticket size={32} color="#485E53" />
                <p>No showtimes scheduled for this date in {city}. Please pick another date.</p>
              </div>
            ) : (
              <div className="theatres-list-container">
                {shows.map((theatreGroup, tIdx) => (
                  <div key={tIdx} className="theatre-card-item">
                    <div className="theatre-info-col">
                      <h4 className="theatre-card-name">{theatreGroup.theatre}</h4>
                      <p className="theatre-card-address">{theatreGroup.address}</p>
                      <div className="theatre-amenities-row">
                        <span className="amenity-chip">4K Laser</span>
                        <span className="amenity-chip">Dolby Atmos</span>
                        <span className="amenity-chip">Food & Beverages</span>
                        <span className="amenity-chip">Recliners Available</span>
                      </div>
                    </div>

                    <div className="theatre-shows-col">
                      <div className="showtimes-wrap">
                        {theatreGroup.shows.map((sh, sIdx) => (
                          <button
                            key={sh.id || sIdx}
                            className="showtime-btn"
                            onClick={() => {
                              onSelectShowtime?.({
                                movie,
                                show: sh,
                                theatre: theatreGroup.theatre,
                                showTime: `${dateOptions[selectedDate].dayName}, ${formatShowTime(sh.starts_at)}`
                              });
                            }}
                          >
                            <span className="showtime-time">{formatShowTime(sh.starts_at)}</span>
                            <span className="showtime-format">{sh.format || 'IMAX 4K'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Tamil Movies Section */}
          {allMovies && allMovies.length > 1 && (
            <div className="modal-recommended-section" style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Recommended Tamil Movies
                </h4>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Trending in {city}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                {allMovies
                  .filter((m) => String(m.id) !== String(movie.id))
                  .slice(0, 4)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        cursor: 'pointer',
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onClick={() => onSelectMovie?.(rec)}
                      title={`View details for ${rec.title}`}
                    >
                      <div style={{ height: 160, width: '100%', overflow: 'hidden' }}>
                        <img
                          src={rec.poster_url || '/assets/posters/amaran-hq.jpg'}
                          alt={rec.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/posters/amaran-hq.jpg';
                          }}
                        />
                      </div>
                      <div style={{ padding: '8px 10px' }}>
                        <h5 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.title}
                        </h5>
                        <p style={{ fontSize: 11, color: '#6B7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.genre || 'Action | Drama'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
