import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Film,
  Image as ImageIcon,
  PlaySquare,
  Building2,
  Tv,
  Calendar,
  Ticket,
  Users,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  X
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AdminApp() {
  const [token, setToken] = useState(sessionStorage.getItem('cineverse-admin-token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('cineverse-admin-user')) || null;
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [banners, setBanners] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search queries per tab
  const [searchQuery, setSearchQuery] = useState('');
  const [movieFilter, setMovieFilter] = useState('all'); // 'all' | 'now_showing' | 'coming_soon'

  // Modals state
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [theatreModalOpen, setTheatreModalOpen] = useState(false);
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [trailerPreviewUrl, setTrailerPreviewUrl] = useState(null);

  // Toast message
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Helper auth headers
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // Safe fetch helper with direct backend fallback
  const safeApiFetch = async (endpoint, options = {}) => {
    try {
      const res = await fetch(endpoint, options);
      // If endpoint is relative /api and server returned 502/504 or network glitch, fallback to port 4000
      if ((res.status === 502 || res.status === 504 || res.status === 404) && endpoint.startsWith('/api')) {
        return await fetch(`http://localhost:4000${endpoint}`, options);
      }
      return res;
    } catch (err) {
      if (endpoint.startsWith('/api')) {
        return await fetch(`http://localhost:4000${endpoint}`, options);
      }
      throw err;
    }
  };

  // Safe JSON parser to avoid "Unexpected end of JSON input" crashes
  const safeParseResponse = async (res) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const endpoint = `${API}/admin/auth/login`;
      const res = await safeApiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await safeParseResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Invalid admin credentials. Please check your email and password.');
      }

      if (!data.token) {
        throw new Error('Authentication succeeded but no token received. Please try again.');
      }

      setToken(data.token);
      setAdminUser(data.admin);
      sessionStorage.setItem('cineverse-admin-token', data.token);
      sessionStorage.setItem('cineverse-admin-user', JSON.stringify(data.admin));
      showToast('Admin logged in successfully!');
    } catch (err) {
      setLoginError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    sessionStorage.removeItem('cineverse-admin-token');
    sessionStorage.removeItem('cineverse-admin-user');
    window.location.href = '/';
  };

  // Load Tab Data
  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [dashRes, bookRes] = await Promise.all([
          fetch(`${API}/admin/dashboard`, { headers: authHeaders }),
          fetch(`${API}/admin/bookings`, { headers: authHeaders })
        ]);
        if (dashRes.ok) {
          const d = await dashRes.json();
          setStats(d);
        }
        if (bookRes.ok) {
          const b = await bookRes.json();
          setBookings(b.bookings || []);
        }
      } else if (activeTab === 'movies') {
        const res = await fetch(`${API}/admin/movies`, { headers: authHeaders });
        if (res.ok) {
          const d = await res.json();
          setMovies(d.movies || []);
        }
      } else if (activeTab === 'banners') {
        const [bRes, mRes] = await Promise.all([
          fetch(`${API}/admin/banners`, { headers: authHeaders }),
          fetch(`${API}/admin/movies`, { headers: authHeaders })
        ]);
        if (bRes.ok) {
          const d = await bRes.json();
          setBanners(d.banners || []);
        }
        if (mRes.ok) {
          const m = await mRes.json();
          setMovies(m.movies || []);
        }
      } else if (activeTab === 'trailers') {
        const res = await fetch(`${API}/admin/movies`, { headers: authHeaders });
        if (res.ok) {
          const d = await res.json();
          setMovies(d.movies || []);
        }
      } else if (activeTab === 'theatres') {
        const [thRes, scrRes] = await Promise.all([
          fetch(`${API}/admin/theatres`, { headers: authHeaders }),
          fetch(`${API}/admin/screens`, { headers: authHeaders })
        ]);
        if (thRes.ok) {
          const d = await thRes.json();
          setTheatres(d.theatres || []);
        }
        if (scrRes.ok) {
          const s = await scrRes.json();
          setScreens(s.screens || []);
        }
      } else if (activeTab === 'shows') {
        const [shRes, movRes, scrRes] = await Promise.all([
          fetch(`${API}/admin/shows`, { headers: authHeaders }),
          fetch(`${API}/admin/movies`, { headers: authHeaders }),
          fetch(`${API}/admin/screens`, { headers: authHeaders })
        ]);
        if (shRes.ok) setShows((await shRes.json()).shows || []);
        if (movRes.ok) setMovies((await movRes.json()).movies || []);
        if (scrRes.ok) setScreens((await scrRes.json()).screens || []);
      } else if (activeTab === 'bookings') {
        const res = await fetch(`${API}/admin/bookings`, { headers: authHeaders });
        if (res.ok) setBookings((await res.json()).bookings || []);
      } else if (activeTab === 'users') {
        const res = await fetch(`${API}/admin/users`, { headers: authHeaders });
        if (res.ok) setUsers((await res.json()).users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, activeTab]);

  // Convert YouTube standard URL to embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/embed/')) return url;
      if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // If NOT logged in, render Admin Login screen
  if (!token) {
    return (
      <div className="admin-login-screen">
        {/* Bottom Small Notification Toast */}
        {toast && (
          <div className="admin-toast-banner">
            <CheckCircle size={15} color="#10B981" />
            <span>{toast}</span>
          </div>
        )}

        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-shield-icon">
              <ShieldCheck size={32} color="#D91E36" />
            </div>
            <h1 className="admin-login-title">CINÉVA Portal</h1>
            <p className="admin-login-sub">Secure administrative control center</p>
          </div>

          {loginError && (
            <div className="admin-error-box">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-login-form" autoComplete="off">
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                name="admin_user_email"
                autoComplete="off"
                data-lpignore="true"
                className="form-input"
                placeholder="admin@cineverse.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="admin_secret_pass"
                autoComplete="new-password"
                data-lpignore="true"
                className="form-input"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-pvr-primary w-100" disabled={loggingIn}>
              {loggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="admin-login-footer">
            <p className="credentials-hint">Default seeded credentials:</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              <code>admin@cineverse.com / CineGo@Admin2026</code>
              <button
                type="button"
                className="btn-pvr-secondary"
                style={{ padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}
                onClick={() => {
                  setLoginEmail('admin@cineverse.com');
                  setLoginPassword('CineGo@Admin2026');
                }}
              >
                Autofill
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9CA3AF' }}>
              (Or: <code>admin12345</code>)
            </p>
            <div style={{ marginTop: 14 }}>
              <a href="/" className="back-to-site-link">
                ← Return to Public Website
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-shell">
      {/* Bottom Small Notification Toast */}
      {toast && (
        <div className="admin-toast-banner">
          <CheckCircle size={15} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <a href="/" className="admin-brand-link">
            <span className="brand-dot" />
            CINEVERSE
          </a>
          <span className="badge-admin-role">ADMIN</span>
        </div>

        <nav className="admin-nav-list">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            <Film size={18} />
            <span>Movies</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            <ImageIcon size={18} />
            <span>Hero Banners</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'trailers' ? 'active' : ''}`}
            onClick={() => setActiveTab('trailers')}
          >
            <PlaySquare size={18} />
            <span>Trailers</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'theatres' ? 'active' : ''}`}
            onClick={() => setActiveTab('theatres')}
          >
            <Building2 size={18} />
            <span>Theatres & Screens</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'shows' ? 'active' : ''}`}
            onClick={() => setActiveTab('shows')}
          >
            <Calendar size={18} />
            <span>Shows</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Ticket size={18} />
            <span>Bookings</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Users</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-user-avatar">
              {adminUser?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-text">
              <span className="admin-user-email">{adminUser?.email || 'Admin'}</span>
              <span className="admin-user-badge">{adminUser?.role || 'Super Admin'}</span>
            </div>
          </div>
          <button className="btn-admin-logout" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-viewport">
        {/* Top Header */}
        <header className="admin-header-bar">
          <div className="admin-header-title-col">
            <h1 className="admin-page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'movies' && 'Movie Management'}
              {activeTab === 'banners' && 'Hero Banner Carousel Management'}
              {activeTab === 'trailers' && 'Trailer Video Management'}
              {activeTab === 'theatres' && 'Theatres & Auditoriums'}
              {activeTab === 'shows' && 'Show Scheduling'}
              {activeTab === 'bookings' && 'Customer Bookings'}
              {activeTab === 'users' && 'Registered Users'}
            </h1>
            <p className="admin-page-sub">
              Manage and update live content with real-time database synchronization
            </p>
          </div>

          <div className="admin-header-actions">
            <button className="btn-icon-refresh" onClick={loadData} title="Refresh Data">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
            <a href="/" target="_blank" rel="noreferrer" className="btn-preview-site">
              <ExternalLink size={14} /> View Live Site
            </a>
          </div>
        </header>

        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="admin-tab-content">
            {/* Stat KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Confirmed Bookings</span>
                  <div className="kpi-icon-pill">
                    <Ticket size={20} color="#D91E36" />
                  </div>
                </div>
                <div className="kpi-value">{stats?.bookings ?? 0}</div>
                <span className="kpi-caption">Active tickets issued</span>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Total Revenue</span>
                  <div className="kpi-icon-pill">
                    <DollarSign size={20} color="#D91E36" />
                  </div>
                </div>
                <div className="kpi-value">
                  ₹{stats ? Math.round(Number(stats.revenueMinor || 0) / 100).toLocaleString() : 0}
                </div>
                <span className="kpi-caption">Succeeded online payments</span>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Live Movies</span>
                  <div className="kpi-icon-pill">
                    <Film size={20} color="#D91E36" />
                  </div>
                </div>
                <div className="kpi-value">{stats?.movies ?? 0}</div>
                <span className="kpi-caption">In cinema multiplexes</span>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Active Shows</span>
                  <div className="kpi-icon-pill">
                    <Calendar size={20} color="#D91E36" />
                  </div>
                </div>
                <div className="kpi-value">{stats?.activeShows ?? 0}</div>
                <span className="kpi-caption">Scheduled auditoriums</span>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings Table */}
            <div className="admin-overview-grid">
              <div className="admin-card-panel col-span-2">
                <div className="panel-header-row">
                  <h3 className="panel-title">Recent Customer Bookings</h3>
                  <button className="panel-link-btn" onClick={() => setActiveTab('bookings')}>
                    View All →
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>User</th>
                        <th>Movie</th>
                        <th>Seats</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 6).map((b) => (
                        <tr key={b.id}>
                          <td>
                            <code className="booking-ref-code">{b.id.substring(0, 8)}...</code>
                          </td>
                          <td>
                            <div className="user-table-cell">
                              <strong>{b.user_name || 'Guest User'}</strong>
                              <span className="user-email-sub">{b.user_email}</span>
                            </div>
                          </td>
                          <td>{b.movie_title || 'Film'}</td>
                          <td>{b.seat_count || 1} Seats</td>
                          <td>
                            <strong>₹{Math.round(Number(b.total_minor) / 100)}</strong>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                b.status === 'confirmed' ? 'confirmed' : 'pending'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="admin-card-panel">
                <div className="panel-header-row">
                  <h3 className="panel-title">Quick Content Actions</h3>
                </div>
                <div className="quick-actions-list">
                  <button
                    className="quick-action-btn"
                    onClick={() => {
                      setEditingMovie(null);
                      setMovieModalOpen(true);
                    }}
                  >
                    <Plus size={16} /> Add New Movie
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => {
                      setEditingBanner(null);
                      setBannerModalOpen(true);
                    }}
                  >
                    <ImageIcon size={16} /> Add Hero Carousel Banner
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => setShowModalOpen(true)}
                  >
                    <Calendar size={16} /> Schedule Show & Pricing
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => setTheatreModalOpen(true)}
                  >
                    <Building2 size={16} /> Add Cinema Multiplex
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: MOVIE MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'movies' && (
          <div className="admin-tab-content">
            {/* Filter Tabs for Quick Navigation */}
            <div className="admin-filter-bar">
              <button
                type="button"
                className={`admin-filter-pill ${movieFilter === 'all' ? 'active' : ''}`}
                onClick={() => setMovieFilter('all')}
              >
                All Movies ({movies.length})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${movieFilter === 'now_showing' ? 'active' : ''}`}
                onClick={() => setMovieFilter('now_showing')}
              >
                Now Showing ({movies.filter((m) => m.status === 'now_showing').length})
              </button>
              <button
                type="button"
                className={`admin-filter-pill coming-soon-pill ${movieFilter === 'coming_soon' ? 'active' : ''}`}
                onClick={() => setMovieFilter('coming_soon')}
              >
                Upcoming / Coming Soon ({movies.filter((m) => m.status === 'coming_soon').length})
              </button>
            </div>

            <div className="admin-toolbar-row">
              <div className="admin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search movies by title, genre, language..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-pvr-primary"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                  onClick={() => {
                    setEditingMovie({
                      status: 'coming_soon',
                      language: 'Tamil',
                      genre: 'Action · Drama',
                      format: 'Tamil - 2D'
                    });
                    setMovieModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Upcoming Movie
                </button>
                <button
                  className="btn-pvr-primary"
                  onClick={() => {
                    setEditingMovie(null);
                    setMovieModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Add New Movie
                </button>
              </div>
            </div>

            <div className="movies-admin-grid">
              {movies
                .filter((m) => {
                  const query = searchQuery.trim().toLowerCase();
                  const matchesSearch =
                    !query ||
                    m.title.toLowerCase().includes(query) ||
                    (m.genre && m.genre.toLowerCase().includes(query)) ||
                    (m.language && m.language.toLowerCase().includes(query));

                  if (!matchesSearch) return false;
                  if (movieFilter === 'all') return true;
                  return m.status === movieFilter;
                })
                .map((m) => (
                  <div key={m.id} className="movie-admin-card">
                    <div className="movie-card-thumb">
                      <img src={m.poster_url} alt={m.title} />
                      <span className={`movie-status-badge ${m.status}`}>
                        {m.status === 'now_showing' ? 'Now Showing' : 'Upcoming Movie'}
                      </span>
                    </div>

                    <div className="movie-card-details">
                      <h4 className="movie-card-title">{m.title}</h4>
                      <div className="movie-card-tags">
                        <span>{m.language}</span>
                        <span>•</span>
                        <span>{m.duration_minutes} Mins</span>
                        <span>•</span>
                        <span>★ {m.rating}</span>
                      </div>
                      <p className="movie-card-genre">{m.genre}</p>

                      {m.status === 'coming_soon' && (
                        <div className="movie-upcoming-tag">
                          <Calendar size={12} />
                          <span>
                            Releasing:{' '}
                            {m.release_date
                              ? new Date(m.release_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'To Be Announced'}
                          </span>
                        </div>
                      )}

                      <p className="movie-card-desc-snippet">{m.synopsis}</p>

                      <div className="movie-card-actions">
                        <button
                          className="btn-action-edit"
                          onClick={() => {
                            setEditingMovie(m);
                            setMovieModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="btn-action-delete"
                          onClick={async () => {
                            const isUpcoming = m.status === 'coming_soon';
                            if (window.confirm(`Are you sure you want to delete ${isUpcoming ? 'upcoming movie' : 'movie'} "${m.title}"?`)) {
                              try {
                                const res = await safeApiFetch(`${API}/admin/movies/${m.id}`, {
                                  method: 'DELETE',
                                  headers: authHeaders
                                });
                                if (res.ok) {
                                  showToast(`Movie "${m.title}" deleted.`);
                                  loadData();
                                } else {
                                  const errData = await safeParseResponse(res);
                                  showToast(errData.error || 'Failed to delete movie.');
                                }
                              } catch {
                                showToast('Network error while deleting movie.');
                              }
                            }
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: BANNER MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'banners' && (
          <div className="admin-tab-content">
            <div className="admin-toolbar-row">
              <p className="toolbar-info-text">
                Manage full-width homepage hero carousel slides. Edit banner image URLs, titles, and display orders.
              </p>
              <button
                className="btn-pvr-primary"
                onClick={() => {
                  setEditingBanner(null);
                  setBannerModalOpen(true);
                }}
              >
                <Plus size={16} /> Add New Banner
              </button>
            </div>

            <div className="banners-admin-list">
              {banners.map((b) => (
                <div key={b.id} className="banner-admin-card">
                  <div className="banner-preview-frame">
                    <img src={b.image_url} alt={b.title} />
                    <span className="banner-order-badge">#{b.display_order}</span>
                  </div>

                  <div className="banner-info-frame">
                    <div className="banner-title-row">
                      <h4 className="banner-title">{b.title}</h4>
                      <span className={`status-pill ${b.active ? 'confirmed' : 'pending'}`}>
                        {b.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="banner-desc">{b.description}</p>
                    <div className="banner-meta-pills">
                      <span className="meta-pill">{b.format || 'IMAX 4K'}</span>
                      <span className="meta-pill">{b.genre || 'Action'}</span>
                      <span className="meta-pill">Button: {b.button_text}</span>
                    </div>

                    <div className="banner-actions-row">
                      <button
                        className="btn-action-edit"
                        onClick={() => {
                          setEditingBanner(b);
                          setBannerModalOpen(true);
                        }}
                      >
                        <Edit2 size={14} /> Edit Banner
                      </button>
                      <button
                        className="btn-action-delete"
                        onClick={async () => {
                          if (window.confirm(`Delete banner "${b.title}"?`)) {
                            try {
                              const res = await safeApiFetch(`${API}/admin/banners/${b.id}`, {
                                method: 'DELETE',
                                headers: authHeaders
                              });
                              if (res.ok) {
                                showToast(`Banner "${b.title}" deleted.`);
                                loadData();
                                window.dispatchEvent(new Event('cinego_banners_updated'));
                              } else {
                                const errData = await safeParseResponse(res);
                                showToast(errData.error || 'Failed to delete banner.');
                              }
                            } catch {
                              showToast('Network error while deleting banner.');
                            }
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: TRAILER VIDEO MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'trailers' && (
          <div className="admin-tab-content">
            <div className="admin-toolbar-row">
              <p className="toolbar-info-text">
                Manage YouTube & video trailer URLs assigned to movies. Preview video playback directly.
              </p>
            </div>

            <div className="trailers-admin-grid">
              {movies.map((m) => (
                <div key={m.id} className="trailer-admin-card">
                  <div className="trailer-video-preview">
                    {m.trailer_url ? (
                      <iframe
                        src={getEmbedUrl(m.trailer_url)}
                        title={m.title}
                        allowFullScreen
                        className="trailer-iframe"
                      />
                    ) : (
                      <div className="trailer-placeholder">
                        <PlaySquare size={36} color="#81747B" />
                        <span>No trailer assigned</span>
                      </div>
                    )}
                  </div>

                  <div className="trailer-details-row">
                    <div>
                      <h4 className="trailer-movie-title">{m.title}</h4>
                      <code className="trailer-url-text">
                        {m.trailer_url || 'URL not configured'}
                      </code>
                    </div>

                    <button
                      className="btn-action-edit"
                      onClick={() => {
                        const newUrl = prompt(`Enter trailer URL for "${m.title}":`, m.trailer_url || '');
                        if (newUrl !== null) {
                          fetch(`${API}/admin/movies/${m.id}`, {
                            method: 'PUT',
                            headers: authHeaders,
                            body: JSON.stringify({ trailer_url: newUrl.trim() })
                          }).then((r) => {
                            if (r.ok) {
                              showToast(`Trailer updated for "${m.title}"`);
                              loadData();
                            }
                          });
                        }
                      }}
                    >
                      <Edit2 size={14} /> Update URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: THEATRES & SCREENS */}
        {/* ==================================================== */}
        {activeTab === 'theatres' && (
          <div className="admin-tab-content">
            <div className="admin-toolbar-row">
              <h3 className="section-title">Cinema Locations & Multiplexes</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-pvr-secondary" onClick={() => setScreenModalOpen(true)}>
                  <Plus size={16} /> Add Auditorium Screen
                </button>
                <button className="btn-pvr-primary" onClick={() => setTheatreModalOpen(true)}>
                  <Plus size={16} /> Add Multiplex
                </button>
              </div>
            </div>

            <div className="theatres-admin-grid">
              {theatres.map((t) => (
                <div key={t.id} className="theatre-admin-card">
                  <div className="theatre-admin-header">
                    <div>
                      <h4 className="theatre-admin-name">{t.name}</h4>
                      <span className="theatre-admin-city">{t.city}</span>
                    </div>
                    <span className="theatre-screens-pill">{t.screen_count} Screens</span>
                  </div>
                  <p className="theatre-admin-addr">{t.address}</p>

                  <div className="theatre-screens-list">
                    <span className="screens-heading">Auditorium Screens:</span>
                    {screens
                      .filter((s) => s.theatre_id === t.id)
                      .map((s) => (
                        <div key={s.id} className="screen-item-chip">
                          <Tv size={12} /> {s.name} ({s.seat_count || 116} Seats)
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SHOW SCHEDULING */}
        {/* ==================================================== */}
        {activeTab === 'shows' && (
          <div className="admin-tab-content">
            <div className="admin-toolbar-row">
              <div className="admin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter shows by movie, theatre, city..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="btn-pvr-primary" onClick={() => setShowModalOpen(true)}>
                <Plus size={16} /> Schedule New Show
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Show ID</th>
                    <th>Movie</th>
                    <th>Theatre & Screen</th>
                    <th>Date & Showtime</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shows
                    .filter(
                      (s) =>
                        !searchQuery ||
                        s.movie_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.theatre_name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((s) => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td>
                          <strong>{s.movie_title}</strong>
                        </td>
                        <td>
                          {s.theatre_name} · <em>{s.screen_name}</em>
                        </td>
                        <td>
                          {new Date(s.starts_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          at{' '}
                          {new Date(s.starts_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              s.status === 'scheduled' ? 'confirmed' : 'cancelled'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-action-delete"
                            onClick={async () => {
                              if (window.confirm('Cancel this scheduled show?')) {
                                const res = await fetch(`${API}/admin/shows/${s.id}`, {
                                  method: 'DELETE',
                                  headers: authHeaders
                                });
                                if (res.ok) {
                                  showToast('Show cancelled');
                                  loadData();
                                }
                              }
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: BOOKINGS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'bookings' && (
          <div className="admin-tab-content">
            <div className="admin-toolbar-row">
              <div className="admin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, booking ref..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Booking Reference</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Movie & Theatre</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter(
                      (b) =>
                        !searchQuery ||
                        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((b) => (
                      <tr key={b.id}>
                        <td>
                          <code className="booking-ref-code">{b.id.substring(0, 8)}...</code>
                        </td>
                        <td>
                          <strong>{b.user_name || 'Customer'}</strong>
                        </td>
                        <td>{b.user_email}</td>
                        <td>
                          {b.movie_title}
                          <br />
                          <small style={{ color: '#81747B' }}>{b.theatre_name}</small>
                        </td>
                        <td>{b.seat_count || 1} Seats</td>
                        <td>
                          <strong>₹{Math.round(Number(b.total_minor) / 100)}</strong>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              b.status === 'confirmed' ? 'confirmed' : 'pending'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.status !== 'cancelled' && (
                            <button
                              className="btn-action-delete"
                              onClick={async () => {
                                if (window.confirm('Cancel this booking and release seats?')) {
                                  const res = await fetch(`${API}/admin/bookings/${b.id}/cancel`, {
                                    method: 'POST',
                                    headers: authHeaders
                                  });
                                  if (res.ok) {
                                    showToast('Booking cancelled & seats released');
                                    loadData();
                                  }
                                }
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: USERS */}
        {/* ==================================================== */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                    <th>Total Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className="badge-user-bookings">
                          {u.total_bookings || 0} Bookings
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT MOVIE */}
      {/* ==================================================== */}
      {movieModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="modal-header-row">
              <h3 className="modal-title">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h3>
              <button className="modal-close-btn" onClick={() => setMovieModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payload = Object.fromEntries(formData.entries());
                payload.featured = payload.featured === 'on';
                payload.duration_minutes = Number(payload.duration_minutes) || 120;
                payload.rating = Number(payload.rating) || 8.5;
                payload.release_date = payload.release_date && String(payload.release_date).trim() ? String(payload.release_date).trim() : null;

                const url = editingMovie?.id
                  ? `${API}/admin/movies/${editingMovie.id}`
                  : `${API}/admin/movies`;
                const method = editingMovie?.id ? 'PUT' : 'POST';

                try {
                  const res = await safeApiFetch(url, {
                    method,
                    headers: authHeaders,
                    body: JSON.stringify(payload)
                  });
                  if (res.ok) {
                    showToast(editingMovie?.id ? 'Movie updated successfully!' : 'Movie created successfully!');
                    setMovieModalOpen(false);
                    loadData();
                  } else {
                    const errData = await safeParseResponse(res);
                    showToast(errData.error || 'Error saving movie. Please verify fields.');
                  }
                } catch {
                  showToast('Network error while saving movie.');
                }
              }}
              className="admin-modal-form"
            >
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Movie Title *</label>
                  <input
                    name="title"
                    defaultValue={editingMovie?.title || ''}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    name="status"
                    defaultValue={editingMovie?.status || 'now_showing'}
                    className="form-input"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Upcoming / Coming Soon</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Release Date (Expected / Official)</label>
                  <input
                    type="date"
                    name="release_date"
                    defaultValue={
                      editingMovie?.release_date
                        ? new Date(editingMovie.release_date).toISOString().split('T')[0]
                        : ''
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Format</label>
                  <input
                    name="format"
                    defaultValue={editingMovie?.format || 'Tamil - 2D · Dolby Atmos'}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Poster Image URL *</label>
                  <input
                    name="poster_url"
                    defaultValue={editingMovie?.poster_url || ''}
                    placeholder="https://..."
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image URL</label>
                  <input
                    name="banner_url"
                    defaultValue={editingMovie?.banner_url || ''}
                    placeholder="https://..."
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Trailer Video URL (YouTube or MP4)</label>
                <input
                  name="trailer_url"
                  defaultValue={editingMovie?.trailer_url || ''}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="form-input"
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <input
                    name="language"
                    defaultValue={editingMovie?.language || 'Tamil'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Mins)</label>
                  <input
                    name="duration_minutes"
                    type="number"
                    defaultValue={editingMovie?.duration_minutes || 135}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (0-10)</label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    defaultValue={editingMovie?.rating || 8.8}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <input
                    name="genre"
                    defaultValue={editingMovie?.genre || 'Action · Drama'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Director</label>
                  <input
                    name="director"
                    defaultValue={editingMovie?.director || ''}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cast Members</label>
                <input
                  name="cast_members"
                  defaultValue={editingMovie?.cast_members || ''}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Synopsis</label>
                <textarea
                  name="synopsis"
                  rows={3}
                  defaultValue={editingMovie?.synopsis || ''}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={Boolean(editingMovie?.featured)}
                    style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                  />
                  <span>Feature movie on Homepage Spotlight / Carousel</span>
                </label>
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  className="btn-pvr-secondary"
                  onClick={() => setMovieModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pvr-primary">
                  {editingMovie ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ADD / EDIT BANNER */}
      {/* ==================================================== */}
      {bannerModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="modal-header-row">
              <h3 className="modal-title">{editingBanner ? 'Edit Banner' : 'Add New Carousel Banner'}</h3>
              <button className="modal-close-btn" onClick={() => setBannerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payload = Object.fromEntries(formData.entries());
                payload.active = payload.active === 'on';
                payload.display_order = Number(payload.display_order) || 0;
                payload.duration_minutes = Number(payload.duration_minutes) || 120;
                if (payload.movie_id && !isNaN(Number(payload.movie_id))) {
                  payload.movie_id = Number(payload.movie_id);
                } else {
                  payload.movie_id = null;
                }

                const url = editingBanner
                  ? `${API}/admin/banners/${editingBanner.id}`
                  : `${API}/admin/banners`;
                const method = editingBanner ? 'PUT' : 'POST';

                try {
                  const res = await safeApiFetch(url, {
                    method,
                    headers: authHeaders,
                    body: JSON.stringify(payload)
                  });
                  if (res.ok) {
                    showToast(editingBanner ? 'Banner updated successfully!' : 'Banner added successfully!');
                    setBannerModalOpen(false);
                    loadData();
                    window.dispatchEvent(new Event('cinego_banners_updated'));
                  } else {
                    const errData = await safeParseResponse(res);
                    showToast(errData.error || 'Error saving banner. Please try again.');
                  }
                } catch {
                  showToast('Network error while saving banner.');
                }
              }}
              className="admin-modal-form"
            >
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Banner Title *</label>
                  <input
                    name="title"
                    defaultValue={editingBanner?.title || ''}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order (e.g. 1, 2, 3)</label>
                  <input
                    name="display_order"
                    type="number"
                    defaultValue={editingBanner?.display_order || 1}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Link to Movie (Optional)</label>
                <select
                  name="movie_id"
                  defaultValue={editingBanner?.movie_id || ''}
                  className="form-input"
                >
                  <option value="">None / Custom Hero Banner</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL * (Pinterest / Image link)</label>
                <input
                  name="image_url"
                  defaultValue={editingBanner?.image_url || ''}
                  placeholder="https://..."
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trailer Video URL (YouTube)</label>
                <input
                  name="trailer_url"
                  defaultValue={editingBanner?.trailer_url || ''}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="form-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input
                    name="button_text"
                    defaultValue={editingBanner?.button_text || 'Book Tickets'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Format Tag</label>
                  <input
                    name="format"
                    defaultValue={editingBanner?.format || 'IMAX 4K Laser · Dolby Atmos'}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Subtitle</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingBanner?.description || ''}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingBanner ? editingBanner.active : true}
                  />
                  <span>Active & Visible on Homepage</span>
                </label>
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  className="btn-pvr-secondary"
                  onClick={() => setBannerModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pvr-primary">
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: SCHEDULE NEW SHOW */}
      {/* ==================================================== */}
      {showModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="modal-header-row">
              <h3 className="modal-title">Schedule New Cinema Show</h3>
              <button className="modal-close-btn" onClick={() => setShowModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payload = Object.fromEntries(formData.entries());

                const res = await fetch(`${API}/admin/shows`, {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  showToast('Show scheduled successfully!');
                  setShowModalOpen(false);
                  loadData();
                } else {
                  showToast('Error scheduling show. Please check inputs.');
                }
              }}
              className="admin-modal-form"
            >
              <div className="form-group">
                <label className="form-label">Select Movie *</label>
                <select name="movie_id" required className="form-input">
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Screen & Multiplex *</label>
                <select name="screen_id" required className="form-input">
                  {screens.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.theatre_name} — {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Showtime Starts At *</label>
                <input
                  name="starts_at"
                  type="datetime-local"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  className="form-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Executive Price (₹)</label>
                  <input
                    name="regular_price"
                    type="number"
                    defaultValue={190}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">VIP Recliner Price (₹)</label>
                  <input
                    name="premium_price"
                    type="number"
                    defaultValue={320}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  className="btn-pvr-secondary"
                  onClick={() => setShowModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pvr-primary">
                  Confirm & Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: ADD THEATRE */}
      {/* ==================================================== */}
      {theatreModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="modal-header-row">
              <h3 className="modal-title">Add Cinema Multiplex</h3>
              <button className="modal-close-btn" onClick={() => setTheatreModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payload = Object.fromEntries(formData.entries());

                const res = await fetch(`${API}/admin/theatres`, {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  showToast('Multiplex created!');
                  setTheatreModalOpen(false);
                  loadData();
                } else {
                  showToast('Error creating multiplex. Please check inputs.');
                }
              }}
              className="admin-modal-form"
            >
              <div className="form-group">
                <label className="form-label">Theatre / Multiplex Name *</label>
                <input
                  name="name"
                  placeholder="e.g. PVR ICON VR Mall"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  name="city"
                  placeholder="e.g. Chennai, Bengaluru, Mumbai"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  name="address"
                  placeholder="Full street address and landmark"
                  required
                  className="form-input"
                />
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  className="btn-pvr-secondary"
                  onClick={() => setTheatreModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pvr-primary">
                  Save Multiplex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
