import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Film,
  MapPin,
  Play,
  Printer,
  Search,
  Star,
  Ticket,
  User,
  Utensils,
  X,
  Check,
  Calendar,
  CheckCircle,
  QrCode,
  LayoutGrid,
  Zap,
  Smile,
  Heart,
  Rocket,
  Sparkles,
  Eye,
  Flame,
  SlidersHorizontal
} from 'lucide-react';
import AdminApp from './AdminApp.jsx';
import CinegoHeroBanner from './components/CinegoHeroBanner.jsx';
import SeatLayout2D from './components/SeatLayout2D.jsx';
import MovieDetailsModal from './components/MovieDetailsModal.jsx';
import CinegoPaymentPage from './components/CinegoPaymentPage.jsx';
import CinegoTicketConfirmation from './components/CinegoTicketConfirmation.jsx';
import UpcomingMoviesCarousel from './components/UpcomingMoviesCarousel.jsx';

/* ==========================================================================
   CINÉVA Project API Configuration & Exact Reference Data
   ========================================================================== */
const API = import.meta.env.VITE_API_URL || '/api';

const AVAILABLE_CITIES = ['Pudukkottai', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'];

export const CINEVA_NOW_SHOWING = [
  {
    id: 'tamil-1',
    title: 'Amaran',
    poster_url: '/assets/posters/amaran.jpg',
    language: 'Tamil',
    genre: 'Action | Biography | Drama',
    rating: '9.2/10',
    duration_str: '2h 47m',
    duration_minutes: 167,
    status: 'now_showing',
    format: 'Tamil • 2D • IMAX',
    synopsis: 'A gripping biographical action film chronicling the heroic life and sacrifice of Major Mukund Varadarajan of the 44 Rashtriya Rifles.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-2',
    title: 'The Greatest of All Time (GOAT)',
    poster_url: '/assets/posters/goat.jpg',
    language: 'Tamil',
    genre: 'Action | Sci-Fi | Thriller',
    rating: '8.9/10',
    duration_str: '3h 03m',
    duration_minutes: 183,
    status: 'now_showing',
    format: 'Tamil • 2D • IMAX 3D',
    synopsis: 'Gandhi, an elite hostage negotiator and covert agent for the Special Anti-Terrorist Squad, is called back for a dangerous mission from his past.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-3',
    title: 'Vettaiyan',
    poster_url: '/assets/posters/vettaiyan.png',
    language: 'Tamil',
    genre: 'Action | Drama | Crime',
    rating: '8.8/10',
    duration_str: '2h 43m',
    duration_minutes: 163,
    status: 'now_showing',
    format: 'Tamil • 2D • Dolby Atmos',
    synopsis: 'SP Athiyan IPS, a legendary encounter specialist renowned for taking down criminals, confronts systemic corruption in the corporate edtech sector.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-4',
    title: 'Kanguva',
    poster_url: '/assets/posters/kanguva.jpg',
    language: 'Tamil',
    genre: 'Action | Fantasy | Adventure',
    rating: '8.6/10',
    duration_str: '2h 34m',
    duration_minutes: 154,
    status: 'now_showing',
    format: 'Tamil • 3D • IMAX 3D',
    synopsis: 'A fearless ancient tribal warrior in 1070 AD fights to defend his people, bound across a millennium to a mystery in 2024.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-5',
    title: 'Maharaja',
    poster_url: '/assets/posters/maharaja.jpg',
    language: 'Tamil',
    genre: 'Thriller | Action | Mystery',
    rating: '9.4/10',
    duration_str: '2h 21m',
    duration_minutes: 141,
    status: 'now_showing',
    format: 'Tamil • 2D • Dolby Atmos',
    synopsis: 'A quiet barber visits a police station reporting his household dustbin was stolen, pulling investigators into a layered web of justice and revenge.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-6',
    title: 'Lubber Pandhu',
    poster_url: '/assets/posters/lubber-pandhu.jpg',
    language: 'Tamil',
    genre: 'Drama | Comedy | Sports',
    rating: '9.1/10',
    duration_str: '2h 28m',
    duration_minutes: 148,
    status: 'now_showing',
    format: 'Tamil • 2D',
    synopsis: 'An intense street-cricket rivalry between a seasoned gully cricketer and an energetic youngster evolves into a heartwarming generational contest.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-7',
    title: 'Raayan',
    poster_url: '/assets/posters/raayan.jpg',
    language: 'Tamil',
    genre: 'Action | Crime | Drama',
    rating: '8.7/10',
    duration_str: '2h 25m',
    duration_minutes: 145,
    status: 'now_showing',
    format: 'Tamil • 2D • Dolby Atmos',
    synopsis: 'A simple young man running a food stall in North Chennai is forced into a brutal war against ruthless local gangsters to protect his siblings.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  }
];

export const CINEVA_COMING_SOON = [
  {
    id: 'tamil-cs-1',
    title: 'Thug Life',
    poster_url: '/assets/posters/thug-life.jpg',
    genre_display: 'Tamil | Action | Gangster',
    genre: 'Gangster',
    release_date: 'June 5, 2025',
    synopsis: 'Rangaraaya Sakthivel Nayakar journeys across international crime syndicates between Tokyo and Tamil Nadu.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-cs-2',
    title: 'Good Bad Ugly',
    poster_url: '/assets/posters/good-bad-ugly.jpg',
    genre_display: 'Tamil | Action | Thriller',
    genre: 'Action',
    release_date: 'May 1, 2025',
    synopsis: 'Ajith Kumar stars in a dynamic and stylish heist action thriller filled with high-octane chases and underworld showdowns.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-cs-3',
    title: 'Coolie',
    poster_url: '/assets/posters/coolie.jpg',
    genre_display: 'Tamil | Action | Crime | Thriller',
    genre: 'Thriller',
    release_date: 'August 15, 2025',
    synopsis: 'Superstar Rajinikanth teams up with director Lokesh Kanagaraj for a gritty gold-smuggling action thriller set in Chennai port.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-cs-4',
    title: 'Vidaamuyarchi',
    poster_url: '/assets/posters/vidaamuyarchi.jpg',
    genre_display: 'Tamil | Action | Thriller | Adventure',
    genre: 'Adventure',
    release_date: 'April 14, 2025',
    synopsis: 'A thrilling survival action saga following an ordinary man who faces perilous road chases in Azerbaijan to protect what matters most.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  },
  {
    id: 'tamil-cs-5',
    title: 'Kubera',
    poster_url: '/assets/posters/kubera.jpg',
    genre_display: 'Tamil | Drama | Thriller',
    genre: 'Drama',
    release_date: 'July 18, 2025',
    synopsis: 'Dhanush, Rashmika Mandanna, and Nagarjuna star in Sekhar Kammula’s gripping social thriller exploring wealth and power.',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY'
  }
];

export const CINEVA_CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'action', label: 'Action', icon: Zap },
  { id: 'comedy', label: 'Comedy', icon: Smile },
  { id: 'drama', label: 'Drama', icon: Film },
  { id: 'thriller', label: 'Thriller', icon: Eye },
  { id: 'romance', label: 'Romance', icon: Heart },
  { id: 'sci-fi', label: 'Sci-Fi', icon: Rocket },
  { id: 'animation', label: 'Animation', icon: Sparkles }
];

export const CITY_THEATRES = {
  Chennai: [
    {
      id: 'th-ch-1',
      name: 'PVR LUXE Cinepolis',
      mall: 'Express Avenue Mall, Royapettah',
      badge: 'IMAX 4K Laser',
      screens: 8,
      sound: 'Dolby Atmos',
      timing: '10:15 AM • 01:45 PM • 06:30 PM • 10:15 PM'
    },
    {
      id: 'th-ch-2',
      name: 'SPI Sathyam Cinemas',
      mall: 'Royapettah Main Road',
      badge: 'RGB Laser',
      screens: 6,
      sound: 'Dolby Atmos Recliner',
      timing: '11:00 AM • 02:30 PM • 07:00 PM • 10:45 PM'
    },
    {
      id: 'th-ch-3',
      name: 'PVR Grand Galada',
      mall: 'Pallavaram, Airport Metro',
      badge: '4DX & ScreenX',
      screens: 5,
      sound: 'Dolby Surround 7.1',
      timing: '10:30 AM • 02:00 PM • 06:45 PM • 10:30 PM'
    },
    {
      id: 'th-ch-4',
      name: 'AGS Cinemas',
      mall: 'Villivakkam / T. Nagar',
      badge: '4K Laser',
      screens: 5,
      sound: 'Dolby Atmos',
      timing: '11:30 AM • 03:00 PM • 07:15 PM • 10:45 PM'
    }
  ],
  Coimbatore: [
    {
      id: 'th-cb-1',
      name: 'Broadway Cinemas',
      mall: 'Avinashi Road, Civil Aerodrome',
      badge: 'EPIQ Laser 4K',
      screens: 9,
      sound: 'Dolby Atmos',
      timing: '10:30 AM • 02:15 PM • 06:45 PM • 10:30 PM'
    },
    {
      id: 'th-cb-2',
      name: 'INOX Prozone Mall',
      mall: 'Sathy Road, Saravanampatti',
      badge: 'Insignia Laser',
      screens: 9,
      sound: 'Dolby Atmos Recliner',
      timing: '11:00 AM • 02:45 PM • 07:00 PM • 10:15 PM'
    },
    {
      id: 'th-cb-3',
      name: 'KG Cinemas',
      mall: 'Bunglaw Road, Race Course',
      badge: 'Barco 4K RGB',
      screens: 4,
      sound: 'Dolby Atmos',
      timing: '10:00 AM • 01:30 PM • 06:15 PM • 09:45 PM'
    }
  ],
  Madurai: [
    {
      id: 'th-md-1',
      name: 'INOX Vishaal de Mal',
      mall: 'Gokhale Road, Chinna Chokkikulam',
      badge: 'Dolby Atmos 4K',
      screens: 5,
      sound: 'Dolby Atmos',
      timing: '10:45 AM • 02:00 PM • 06:30 PM • 10:00 PM'
    },
    {
      id: 'th-md-2',
      name: 'Big Cinemas',
      mall: 'Kalavasal Junction, Bypass Road',
      badge: 'Laser 4K',
      screens: 4,
      sound: 'Dolby Surround 7.1',
      timing: '11:15 AM • 02:30 PM • 07:00 PM • 10:30 PM'
    }
  ],
  Trichy: [
    {
      id: 'th-tr-1',
      name: 'LA Cinemas',
      mall: 'Maris Complex, Fort Station Road',
      badge: 'RGB Laser 4K',
      screens: 4,
      sound: 'Dolby Atmos',
      timing: '10:30 AM • 02:00 PM • 06:30 PM • 10:15 PM'
    },
    {
      id: 'th-tr-2',
      name: 'Manghalam Multiplex',
      mall: 'Cantonment Central',
      badge: 'Dolby 7.1',
      screens: 3,
      sound: 'Dolby 7.1',
      timing: '11:00 AM • 02:30 PM • 07:00 PM • 10:30 PM'
    }
  ],
  Salem: [
    {
      id: 'th-sl-1',
      name: 'ARRS Multiplex',
      mall: 'Meyyanur Bypass Road',
      badge: '4K Laser Projection',
      screens: 5,
      sound: 'Dolby Atmos',
      timing: '10:30 AM • 02:00 PM • 06:45 PM • 10:15 PM'
    },
    {
      id: 'th-sl-2',
      name: 'Kailash Multiplex',
      mall: 'Suramangalam Main Road',
      badge: 'Dolby Atmos',
      screens: 4,
      sound: 'Dolby Atmos',
      timing: '11:15 AM • 02:45 PM • 07:15 PM • 10:30 PM'
    }
  ]
};

export default function App() {
  // Check if navigating to /admin or #admin
  if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
    return <AdminApp />;
  }

  // City & Search & Filters
  const [city, setCity] = useState('Pudukkottai');
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Dynamic Data with fallback
  const [banners, setBanners] = useState([]);
  const [movies, setMovies] = useState(CINEVA_NOW_SHOWING);
  const [comingSoonMovies, setComingSoonMovies] = useState(CINEVA_COMING_SOON);
  const [loadingData, setLoadingData] = useState(false);

  // Modals & Navigation state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [bookingSession, setBookingSession] = useState(null);
  const [seatsData, setSeatsData] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [checkoutData, setCheckoutData] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Sorting & Offers & Policy modals state
  const [sortBy, setSortBy] = useState('featured');
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [infoModal, setInfoModal] = useState(null);

  // Video embed helper
  const getEmbedUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/kY3Su_k_k_U?autoplay=1';
    try {
      if (url.includes('youtube.com/embed/')) return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Navigation matching CineGo reference: Movies, Cinemas, Offers, My tickets
  const NAV_ITEMS = useMemo(() => [
    { id: 'movies', label: 'Movies', targetId: 'now-showing' },
    { id: 'theatres', label: 'Cinemas', targetId: 'theatres' },
    { id: 'offers', label: 'Offers', targetId: 'offers' },
    { id: 'orders', label: 'My tickets', targetId: 'orders' }
  ], []);

  const [activeNav, setActiveNav] = useState('movies');
  const navRowRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 2, top: 2, width: 72, height: 32, ready: true });

  const updateIndicator = (itemId) => {
    const rowEl = navRowRef.current;
    const itemEl = itemRefs.current[itemId];
    if (rowEl && itemEl) {
      const rowRect = rowEl.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - rowRect.left,
        top: itemRect.top - rowRect.top,
        width: itemRect.width,
        height: itemRect.height,
        ready: true
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeNav);
    const handleResize = () => updateIndicator(activeNav);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeNav]);

  const handleNavClick = (e, itemId) => {
    e?.preventDefault();
    setActiveNav(itemId);

    if (bookingSession) {
      setBookingSession(null);
      setCheckoutData(null);
    }

    if (itemId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (itemId === 'offers') {
      setOffersModalOpen(true);
      return;
    }

    if (itemId === 'orders') {
      if (authed) {
        setMyBookingsOpen(true);
      } else {
        setAuthMode('login');
        setAuthOpen(true);
      }
      return;
    }

    if (itemId === 'movies') {
      document.getElementById('now-showing')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (itemId === 'theatres') {
      document.getElementById('theatres')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  };

  // Auto-synchronize active nav pill as user scrolls
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        ticking = false;
        if (bookingSession) return;
        const scrollY = window.scrollY;
        const moviesEl = document.getElementById('now-showing');
        const theatresEl = document.getElementById('theatres');
        const offersEl = document.getElementById('offers-banner');

        const offset = 160;
        const offersTop = offersEl ? offersEl.offsetTop - offset : Infinity;
        const theatresTop = theatresEl ? theatresEl.offsetTop - offset : Infinity;
        const moviesTop = moviesEl ? moviesEl.offsetTop - offset : Infinity;

        if (scrollY >= offersTop - 40) {
          setActiveNav((prev) => (prev !== 'offers' ? 'offers' : prev));
        } else if (scrollY >= theatresTop - 40) {
          setActiveNav((prev) => (prev !== 'theatres' ? 'theatres' : prev));
        } else if (scrollY >= moviesTop - 40) {
          setActiveNav((prev) => (prev !== 'movies' ? 'movies' : prev));
        } else {
          setActiveNav((prev) => (prev !== 'home' ? 'home' : prev));
        }
      });
      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bookingSession]);

  // User Auth & Profile state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authed, setAuthed] = useState(Boolean(localStorage.getItem('cineverse-user-token')));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('cineverse-user-email') || '');
  const [userName, setUserName] = useState(localStorage.getItem('cineverse-user-name') || 'Movie Lover');
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');
  const searchInputRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Banners from Database
  const loadBanners = () => {
    fetch(`${API}/banners`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.banners) {
          setBanners(d.banners);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    loadBanners();
    const handleSync = () => loadBanners();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('cinego_banners_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('cinego_banners_updated', handleSync);
    };
  }, []);

  // Fetch Movies from Database: Admin and Database edits ALWAYS take priority!
  const loadPublicMovies = () => {
    fetch(`${API}/movies?city=${encodeURIComponent(city)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.movies?.length) {
          // 1. Now Showing Movies (Admin poster_url takes full priority)
          const nowShowingDb = d.movies.filter((m) => m.status === 'now_showing');
          const activeList = (nowShowingDb.length > 0 ? nowShowingDb : d.movies).map((dbMovie) => {
            const fallback = CINEVA_NOW_SHOWING.find(
              (c) => c.title.toLowerCase().trim() === dbMovie.title.toLowerCase().trim()
            );
            return {
              ...(fallback || {}),
              ...dbMovie, // dbMovie from Admin ALWAYS overrides fallback!
              poster_url: dbMovie.poster_url || fallback?.poster_url || '/assets/posters/amaran.jpg'
            };
          });
          setMovies(activeList);

          // 2. Coming Soon Movies (Admin poster_url takes full priority)
          const comingSoonDb = d.movies.filter((m) => m.status === 'coming_soon');
          const csMapped = comingSoonDb.map((cs) => {
            const fallback = CINEVA_COMING_SOON.find(
              (c) => c.title.toLowerCase().trim() === cs.title.toLowerCase().trim()
            );
            return {
              ...(fallback || {}),
              ...cs,
              poster_url: cs.poster_url || fallback?.poster_url || '/assets/posters/thug-life.jpg',
              genre_display: cs.genre || fallback?.genre_display || 'Tamil | Action',
              release_date: cs.release_date
                ? new Date(cs.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (fallback?.release_date || 'Coming Soon')
            };
          });
          setComingSoonMovies(csMapped.length > 0 ? csMapped : CINEVA_COMING_SOON);
        } else {
          setMovies(CINEVA_NOW_SHOWING);
          setComingSoonMovies(CINEVA_COMING_SOON);
        }
      })
      .catch(() => {
        setMovies(CINEVA_NOW_SHOWING);
        setComingSoonMovies(CINEVA_COMING_SOON);
      });
  };

  useEffect(() => {
    loadPublicMovies();
    // Auto-refresh when tab gains focus (e.g., returning from Admin tab)
    const handleFocus = () => loadPublicMovies();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [city]);

  // Load User Bookings
  const loadUserBookings = () => {
    const token = localStorage.getItem('cineverse-user-token');
    if (!token) return;
    fetch(`${API}/bookings/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.bookings) {
          setUserBookings(d.bookings);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    if (authed) {
      loadUserBookings();
    }
  }, [authed]);

  // Filtered & Sorted Movies for Now Showing
  const filteredNowShowing = useMemo(() => {
    let list = movies.filter((m) => {
      const query = searchQuery.trim().toLowerCase();
      const titleMatch = m.title.toLowerCase().includes(query);
      const genreMatch = m.genre ? m.genre.toLowerCase().includes(query) : false;
      const langMatch = m.language ? m.language.toLowerCase().includes(query) : false;
      const matchesSearch = !query || titleMatch || genreMatch || langMatch;

      if (!matchesSearch) return false;
      if (activeFilter === 'all') return true;
      return m.genre?.toLowerCase().includes(activeFilter.toLowerCase());
    });

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === 'duration') {
      list = [...list].sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [movies, searchQuery, activeFilter, sortBy]);

  // Toggle seat selection (supports both seat object and seat id)
  const handleToggleSeat = (seatOrId) => {
    const seatId = typeof seatOrId === 'object' && seatOrId !== null ? seatOrId.id : seatOrId;
    if (!seatId) return;
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= 8) {
        triggerToast('Maximum 8 seats can be selected per transaction.');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  // Launch Showtime / Seat Layout
  const handleSelectShowtime = async ({ movie, show, theatre, showTime }) => {
    // 1. Enforce User Authentication: User must be logged in to book movie tickets
    if (!authed) {
      setAuthMode('login');
      setAuthOpen(true);
      triggerToast('Please sign in to your account to book movie tickets.');
      return;
    }

    setSelectedMovie(null);
    try {
      const res = await fetch(`${API}/shows/${show.id}/seats`);
      if (res.ok) {
        const data = await res.json();
        setSeatsData(data.seats || []);
      } else {
        setSeatsData(generateFallbackSeats());
      }
    } catch {
      setSeatsData(generateFallbackSeats());
    }
    setSelectedSeatIds([]);
    setBookingSession({ movie, show, theatre, showTime });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fallback Seats Generator
  const generateFallbackSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats = [];
    rows.forEach((r, rIdx) => {
      const category = rIdx >= 6 ? 'premium' : 'standard';
      const priceMinor = category === 'premium' ? 35000 : 22000;
      for (let num = 1; num <= 14; num++) {
        const isBooked = (r === 'B' && (num === 4 || num === 5)) || (r === 'D' && num === 10) || (r === 'E' && (num === 7 || num === 8));
        seats.push({
          id: `${r}${num}`,
          row_label: r,
          seat_number: num,
          category,
          price_minor: priceMinor,
          is_booked: isBooked
        });
      }
    });
    return seats;
  };

  // Confirm booking & payment
  const handleConfirmPayment = async () => {
    if (!checkoutData) return;
    const baseTotal = Math.round(checkoutData.totalPrice / 100);
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalAmount = Math.max(0, baseTotal - discount);
    const bookingId = `CIN-${Date.now().toString(36).toUpperCase()}`;

    const newBooking = {
      id: bookingId,
      bookingId,
      title: checkoutData.movie?.title,
      movie: checkoutData.movie,
      theatre: checkoutData.theatre,
      showTime: checkoutData.showTime,
      starts_at: new Date().toISOString(),
      seats: checkoutData.selectedSeats.map((s) => `${s.row_label}${s.seat_number}`),
      amount: finalAmount * 100,
      total_minor: finalAmount * 100,
      appliedCoupon: appliedCoupon?.code,
      bookedAt: new Date().toISOString()
    };

    setConfirmedTicket(newBooking);
    setUserBookings((prev) => [newBooking, ...prev]);
    setCheckoutData(null);
    setBookingSession(null);
    setSelectedSeatIds([]);
    setAppliedCoupon(null);
    setCouponInput('');
    // Notice: Confirmation modal itself displays confirmation; no redundant dark toast overlay
  };

  // Auth Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? `${API}/auth/login` : `${API}/auth/register`;
    const payload = authMode === 'login' ? { email: authEmail, password: authPassword } : { email: authEmail, password: authPassword, name: authName };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('cineverse-user-token', data.token);
        localStorage.setItem('cineverse-user-email', data.user.email);
        localStorage.setItem('cineverse-user-name', data.user.name || 'Movie Lover');
        setAuthed(true);
        setUserEmail(data.user.email);
        setUserName(data.user.name || 'Movie Lover');
        setAuthOpen(false);
        triggerToast(`Welcome back, ${data.user.name || 'Movie Lover'}!`);
      } else {
        triggerToast(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      localStorage.setItem('cineverse-user-token', 'mock-token');
      localStorage.setItem('cineverse-user-email', authEmail);
      localStorage.setItem('cineverse-user-name', authName || 'Movie Fan');
      setAuthed(true);
      setUserEmail(authEmail);
      setUserName(authName || 'Movie Fan');
      setAuthOpen(false);
      triggerToast('Signed in successfully!');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('cineverse-user-token');
    localStorage.removeItem('cineverse-user-email');
    localStorage.removeItem('cineverse-user-name');
    setAuthed(false);
    setUserEmail('');
    setMyBookingsOpen(false);
    triggerToast('Signed out successfully');
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && !confirmedTicket && <div className="admin-toast-banner">{toastMessage}</div>}

      {/* ==========================================================================
          1. EXACT TICKETNEW-STYLE WHITE NAVIGATION BAR (Shown when not in seat booking)
          ========================================================================== */}
      {!bookingSession && !checkoutData && !confirmedTicket && (
        <header className="site-header">
          <div className="container-custom nav-wrap">
            {/* Left Group: CineGo Brand Logo */}
            <div
              className="brand-logo-wrap"
              onClick={(e) => handleNavClick(e, 'home')}
              title="CineGo Home"
            >
              <span className="brand-logo-cine">Cine</span>
              <span className="brand-logo-go">Go</span>
            </div>

            {/* Center Group: Navigation Links (Movies, Cinemas, Offers, My tickets) */}
            <nav className="nav-center-group">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`nav-link-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  aria-label={item.label}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Group: Sign In / User Profile */}
            <div className="nav-right-group">
              {authed ? (
                <div className="nav-user-profile-wrap">
                  <button
                    className="nav-user-profile-pill"
                    onClick={() => setMyBookingsOpen(true)}
                    title="View My Bookings"
                  >
                    <User size={15} />
                    <span>{userName || 'My Account'}</span>
                  </button>
                  <button
                    className="nav-sign-out-btn"
                    onClick={handleSignOut}
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  className="nav-sign-in-pill"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ==========================================================================
          2. Main App View: Step 3 Ticket Confirmation OR Step 2 Online Payment OR Step 1 Seat Selection OR Homepage
          ========================================================================== */}
      {confirmedTicket ? (
        <main className="cinego-booking-page">
          <CinegoTicketConfirmation
            ticketData={confirmedTicket}
            onDone={() => {
              setConfirmedTicket(null);
              setCheckoutData(null);
              setBookingSession(null);
              setSelectedSeatIds([]);
              setAppliedCoupon(null);
              setCouponInput('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            triggerToast={triggerToast}
          />
        </main>
      ) : checkoutData ? (
        <main className="cinego-booking-page">
          <CinegoPaymentPage
            bookingData={{
              ...checkoutData,
              movieTitle: checkoutData.movie?.title,
              theatreLocation: `${checkoutData.theatre}, Screen 04`,
              showDate: new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
              ticketPrice: Math.round(checkoutData.totalPrice / 100),
              discount: appliedCoupon?.discount || 0
            }}
            authed={authed}
            onRequireLogin={() => {
              setAuthMode('login');
              setAuthOpen(true);
            }}
            onPaymentSuccess={(confirmedBooking) => {
              setConfirmedTicket(confirmedBooking);
              setUserBookings((prev) => [confirmedBooking, ...prev]);
              try {
                const stored = JSON.parse(localStorage.getItem('cinego_user_bookings') || '[]');
                localStorage.setItem('cinego_user_bookings', JSON.stringify([confirmedBooking, ...stored]));
              } catch {}
            }}
            onBackToSeats={() => setCheckoutData(null)}
            triggerToast={triggerToast}
          />
        </main>
      ) : bookingSession ? (
        <main className="cinego-booking-page">
          <SeatLayout2D
            seats={seatsData}
            selectedSeats={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            maxSeats={8}
            movieTitle={bookingSession.movie?.title}
            theatreName={bookingSession.theatre}
            showTime={bookingSession.showTime}
            format={bookingSession.movie?.format || 'Tamil - 2D'}
            posterUrl={bookingSession.movie?.poster_url}
            onBack={() => setBookingSession(null)}
            triggerToast={triggerToast}
            onProceedToCheckout={({ selectedSeatObjects, totalPrice }) => {
              if (!authed) {
                setAuthMode('login');
                setAuthOpen(true);
                triggerToast('Please sign in to your account to book movie tickets.');
                return;
              }
              setCheckoutData({
                movie: bookingSession.movie,
                theatre: bookingSession.theatre,
                showTime: bookingSession.showTime,
                showId: bookingSession.show?.id || 'show-1',
                selectedSeats: selectedSeatObjects,
                totalPrice
              });
            }}
          />
        </main>
      ) : (
        <main>
          {/* ==========================================================================
              3. EXACT CINEGO HERO BANNER: Book Your Seat. Skip the Queue. + Overlapping Tamil Cards
              ========================================================================== */}
          <div id="home">
            <CinegoHeroBanner
              banners={banners}
              movies={movies}
              city={city}
              onCityChange={(newCity) => {
                setCity(newCity);
                triggerToast(`Location set to ${newCity}`);
              }}
              availableCities={AVAILABLE_CITIES}
              onSelectMovie={(movie) => {
                setSelectedMovie(movie);
              }}
              triggerToast={triggerToast}
            />
          </div>

          {/* ==========================================================================
              4. SECTION 1: Now Showing in {city} (TicketNew Reference UI)
              ========================================================================== */}
          <section id="now-showing" className="cineva-section" style={{ paddingTop: 12 }}>
            <div className="container-custom">
              {/* Clean Section Heading */}
              <h2 className="ticketnew-section-title">Now Showing in {city}</h2>

              {/* TicketNew Horizontal Filter Chips Bar directly below title */}
              <div className="ticketnew-filters-bar">
                <button
                  type="button"
                  className="ticketnew-filter-btn"
                  onClick={() => triggerToast('Select filters')}
                  aria-label="Filter movies"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  <ChevronDown size={13} />
                </button>

                <div className="ticketnew-chips-row">
                  {[
                    { label: 'Top Selling', key: 'all' },
                    { label: 'Tamil', key: 'tamil' },
                    { label: 'Action', key: 'action' },
                    { label: 'Drama', key: 'drama' },
                    { label: '3D', key: '3d' },
                    { label: 'Comedy', key: 'comedy' }
                  ].map((chip) => {
                    const isActive = activeFilter.toLowerCase() === chip.key.toLowerCase();
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        className={`ticketnew-chip ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveFilter(chip.key)}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="now-showing-grid">
                {filteredNowShowing.map((m) => (
                  <div
                    key={m.id || m.title}
                    className="cineva-movie-card"
                    onClick={() => setSelectedMovie(m)}
                  >
                    <div className="cineva-poster-frame">
                      {/* Green New Release Badge as in TicketNew reference */}
                      <span className="movie-badge-new-release">New Release</span>

                      <img
                        src={m.poster_url || '/assets/posters/amaran-hq.jpg'}
                        alt={m.title}
                        className="cineva-poster-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/posters/amaran-hq.jpg';
                        }}
                      />
                    </div>

                    <div className="cineva-card-body">
                      <h3 className="cineva-card-title">{m.title}</h3>

                      {/* Tags Strip (Tamil, 2D, IMAX) */}
                      <div className="cineva-card-tags">
                        <span className="card-tag-pill">{m.language || 'Tamil'}</span>
                        <span className="card-tag-pill">2D</span>
                        <span className="card-tag-pill">IMAX</span>
                      </div>

                      <button
                        className="btn-cineva-book-card"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovie(m);
                        }}
                      >
                        <Ticket size={14} style={{ marginRight: 6 }} />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==========================================================================
              5. SECTION: Upcoming Movies Carousel (Ref Image Layout)
              ========================================================================== */}
          <UpcomingMoviesCarousel
            movies={comingSoonMovies}
            onSelectMovie={setSelectedMovie}
            triggerToast={triggerToast}
          />

          {/* ==========================================================================
              5. SECTION: Theatres in City Showcase
              ========================================================================== */}
          <section id="theatres" className="cineva-section" style={{ paddingTop: 10 }}>
            <div className="container-custom">
              <div className="cineva-section-header">
                <div className="cineva-title-wrap">
                  <div className="cineva-title-row">
                    <span className="cineva-title-dash" />
                    <h2 className="cineva-section-title">Theatres in {city}</h2>
                  </div>
                  <p className="cineva-section-subtitle">
                    Experience movies in premium screens &amp; luxury sound
                  </p>
                </div>

                <button
                  className="nav-location-pill"
                  onClick={() => setCityModalOpen(true)}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111827' }}
                >
                  <MapPin size={14} className="nav-location-pin" />
                  <span>Change City ({city})</span>
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Theatres Grid */}
              <div className="theatres-showcase-grid">
                {(CITY_THEATRES[city] || CITY_THEATRES.Chennai).map((th) => (
                  <div key={th.id} className="theatre-showcase-card">
                    <div>
                      <div className="theatre-showcase-header">
                        <div>
                          <h3 className="theatre-showcase-name">{th.name}</h3>
                          <p className="theatre-showcase-mall">
                            <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            {th.mall}
                          </p>
                        </div>
                        <span className="theatre-badge-tech">{th.badge}</span>
                      </div>

                      <div className="theatre-showcase-meta">
                        <span className="theatre-meta-pill">{th.sound}</span>
                        <span className="theatre-meta-pill">{th.screens} Screens</span>
                      </div>
                    </div>

                    <div className="theatre-showcase-footer">
                      <div className="theatre-timing-preview">
                        <span className="theatre-timing-label">Today's Shows:</span>
                        <span className="theatre-timing-text">{th.timing}</span>
                      </div>
                      <button
                        className="btn-theatre-view-shows"
                        onClick={() => {
                          const targetMovie = movies[0] || CINEVA_NOW_SHOWING[0];
                          setSelectedMovie(targetMovie);
                        }}
                      >
                        <span>View Shows</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==========================================================================
              6. SECTION 3: Grand Promotional Offer Banner
              ========================================================================== */}
          <section id="offers-banner" className="cineva-section" style={{ padding: '30px 0 50px' }}>
            <div className="container-custom">
              <div className="cineva-grand-offer-banner">
                {/* Background Ambient Decorative Lights */}
                <div className="grand-offer-glow grand-offer-glow-1" />
                <div className="grand-offer-glow grand-offer-glow-2" />
                <div className="grand-offer-watermark-reel" />

                <div className="grand-offer-content-grid">
                  {/* Left Column: Heading, Subtitle & Interactive Copy Code Action */}
                  <div className="grand-offer-left">
                    <div className="grand-offer-badge-wrap">
                      <span className="grand-offer-badge">
                        <Sparkles size={13} />
                        <span>EXCLUSIVE MOVIE REWARDS</span>
                      </span>
                      <span className="grand-offer-subtag">Tamil Blockbusters 2024</span>
                    </div>

                    <h3 className="grand-offer-heading">
                      FLAT <span className="highlight-price">₹150 OFF</span> ON YOUR TICKETS
                    </h3>

                    <p className="grand-offer-description">
                      Enjoy <strong style={{ color: '#F9FAFB' }}>Amaran</strong>, <strong style={{ color: '#F9FAFB' }}>The GOAT</strong>, <strong style={{ color: '#F9FAFB' }}>Vettaiyan</strong>, <strong style={{ color: '#F9FAFB' }}>Kanguva</strong> and more across all partner theatres in {city}. Apply promo code at checkout!
                    </p>

                    <div className="grand-offer-interactive-row">
                      <div
                        className="grand-offer-coupon-card"
                        role="button"
                        tabIndex={0}
                        title="Click to copy promo code"
                        onClick={() => {
                          navigator.clipboard?.writeText('CINEVA150');
                          setCouponInput('CINEVA150');
                          triggerToast('Promo code CINEVA150 copied! Flat ₹150 OFF applied.');
                        }}
                      >
                        <div className="coupon-card-left">
                          <Ticket size={17} className="coupon-ticket-icon" />
                          <div className="coupon-labels">
                            <span className="coupon-label-micro">PROMO CODE</span>
                            <span className="coupon-code-text">CINEVA150</span>
                          </div>
                        </div>
                        <div className="coupon-card-divider" />
                        <button
                          type="button"
                          className="btn-coupon-copy-tag"
                          aria-label="Copy coupon code"
                        >
                          <span>COPY</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-grand-offer-cta"
                        onClick={() => setOffersModalOpen(true)}
                      >
                        <span>View All Offers</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Cinema Feature Badges / Instant Perks */}
                  <div className="grand-offer-right">
                    <div className="grand-offer-perks-card">
                      <div className="grand-offer-perks-header">
                        <span className="perks-badge-gold">CINÉVA PRIVILEGE</span>
                        <h4 className="perks-title">Instant Perks Included</h4>
                      </div>
                      <div className="perks-list">
                        <div className="perk-item">
                          <span className="perk-emoji">🍿</span>
                          <div className="perk-text">
                            <strong>Free Popcorn Voucher</strong>
                            <span>Applicable on booking of 2+ tickets</span>
                          </div>
                        </div>
                        <div className="perk-item">
                          <span className="perk-emoji">⚡</span>
                          <div className="perk-text">
                            <strong>Zero Convenience Fee</strong>
                            <span>Instant waiver on first movie transaction</span>
                          </div>
                        </div>
                        <div className="perk-item">
                          <span className="perk-emoji">🎟️</span>
                          <div className="perk-text">
                            <strong>Digital Fast-Track Entry</strong>
                            <span>Show your QR pass and walk right in</span>
                          </div>
                        </div>
                      </div>
                      <div className="perks-footer-note">
                        <Zap size={13} color="#FBBF24" />
                        <span>Valid on all shows & screens in {city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ==========================================================================
          7. EXACT CINÉVA 5-COLUMN FOOTER WITH DECORATIVE FILMSTRIP
          ========================================================================== */}
      {!bookingSession && !checkoutData && !confirmedTicket && (
      <footer className="site-footer">
        <div className="container-custom">
          <div className="footer-top-grid">
            {/* Col 1: Brand & Tagline */}
            <div>
              <h3 className="footer-brand-title">CINÉVA</h3>
              <h4 className="footer-brand-sub">Your Ultimate Movie Destination</h4>
              <p className="footer-brand-desc">
                Experience the best of cinema with seamless booking, exciting offers and more!
              </p>
              <div className="footer-socials-row">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">f</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">ig</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">yt</a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="X">𝕏</a>
              </div>
            </div>

            {/* Col 2: Explore */}
            <div>
              <h5 className="footer-col-heading">Explore</h5>
              <ul className="footer-links-list">
                <li><a href="#now-showing" onClick={(e) => handleNavClick(e, 'movies')}>Now Showing</a></li>
                <li><a href="#coming-soon" onClick={(e) => { e.preventDefault(); setBookingSession(null); document.getElementById('coming-soon')?.scrollIntoView({ behavior: 'smooth' }); }}>Coming Soon</a></li>
                <li><a href="#offers-banner" onClick={(e) => handleNavClick(e, 'offers')}>Offers</a></li>
                <li><a href="#theatres" onClick={(e) => handleNavClick(e, 'theatres')}>Theatres</a></li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      setInfoModal({
                        title: 'Frequently Asked Questions (FAQ)',
                        content: '1. How do I book movie tickets?\nSelect your movie, choose your preferred theatre and showtime, pick your seats, apply any coupons, and confirm your payment.\n\n2. How do I receive my tickets?\nOnce confirmed, a digital entry pass with a unique QR code is immediately generated and saved to your account under My Bookings.\n\n3. Can I cancel or refund my ticket?\nYes, tickets can be cancelled up to 2 hours before the scheduled showtime for a full refund back to your payment method.\n\n4. Are food and beverage combos included?\nF&B can be ordered directly at our partner cinema counters with exclusive CINÉVA discounts.'
                      });
                    }}
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Help & Support */}
            <div>
              <h5 className="footer-col-heading">Help & Support</h5>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      setInfoModal({
                        title: 'Contact CINÉVA Support',
                        content: 'Our customer care team is available 24/7 to assist you.\n\n• Email Support: support@cineva.com\n• Toll-Free Helpline: 1800-246-382 (CIN-EVA)\n• Headquarters: Express Chambers, Royapettah, Chennai 600014\n• Live Chat: Mon - Sun, 9:00 AM - 11:00 PM IST'
                      });
                    }}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      setInfoModal({
                        title: 'Terms & Conditions',
                        content: '1. Tickets once booked are valid only for the designated showtime, date, and theatre screen.\n2. Please carry a digital copy of the booking confirmation QR pass.\n3. Outside food and beverages are not permitted inside theatre auditoriums per cinema house rules.\n4. Age restrictions apply according to Central Board of Film Certification (U, UA, A ratings).'
                      });
                    }}
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      setInfoModal({
                        title: 'Privacy Policy',
                        content: 'At CINÉVA, your privacy and personal data security are our highest priorities.\n\n• We do not sell or share your personal data with third parties.\n• Payment information is encrypted end-to-end via PCI-DSS compliant gateways.\n• You can request account deletion or data export anytime via support@cineva.com.'
                      });
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#refund"
                    onClick={(e) => {
                      e.preventDefault();
                      setInfoModal({
                        title: 'Refund & Cancellation Policy',
                        content: '• 100% refund is issued for cancellations made at least 2 hours before showtime.\n• Refunds are processed automatically to the original payment source within 3-5 business days.\n• If a screening is cancelled due to technical difficulties, a full refund plus a 20% discount coupon is credited to your account.'
                      });
                    }}
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      setInfoModal({
                        title: 'Frequently Asked Questions (FAQ)',
                        content: '1. How do I book movie tickets?\nSelect your movie, choose your preferred theatre and showtime, pick your seats, apply any coupons, and confirm your payment.\n\n2. How do I receive my tickets?\nOnce confirmed, a digital entry pass with a unique QR code is immediately generated and saved to your account under My Bookings.'
                      });
                    }}
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Popular Cities */}
            <div>
              <h5 className="footer-col-heading">Popular Cities</h5>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="#city"
                    onClick={(e) => { e.preventDefault(); setCity('Chennai'); }}
                    className={city === 'Chennai' ? 'active-city' : ''}
                  >
                    Chennai
                  </a>
                </li>
                <li>
                  <a
                    href="#city"
                    onClick={(e) => { e.preventDefault(); setCity('Coimbatore'); }}
                    className={city === 'Coimbatore' ? 'active-city' : ''}
                  >
                    Coimbatore
                  </a>
                </li>
                <li>
                  <a
                    href="#city"
                    onClick={(e) => { e.preventDefault(); setCity('Madurai'); }}
                    className={city === 'Madurai' ? 'active-city' : ''}
                  >
                    Madurai
                  </a>
                </li>
                <li>
                  <a
                    href="#city"
                    onClick={(e) => { e.preventDefault(); setCity('Trichy'); }}
                    className={city === 'Trichy' ? 'active-city' : ''}
                  >
                    Trichy
                  </a>
                </li>
                <li>
                  <a
                    href="#city"
                    onClick={(e) => { e.preventDefault(); setCity('Salem'); }}
                    className={city === 'Salem' ? 'active-city' : ''}
                  >
                    Salem
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: Subscribe for Updates */}
            <div>
              <h5 className="footer-col-heading">Subscribe for Updates</h5>
              <p className="footer-subscribe-desc">Get the latest movies and offers!</p>
              <form
                className="footer-newsletter-box"
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerToast('Thank you for subscribing to CINÉVA updates!');
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="footer-newsletter-input"
                />
                <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe">
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar with Filmstrip Graphic */}
          <div className="footer-bottom-bar">
            <span>© 2025 CINÉVA. All <span style={{ textDecoration: 'underline' }}>rights reserved</span>.</span>
            <img
              src="/assets/footer-filmstrip.png"
              alt="Filmstrip design"
              className="footer-filmstrip-watermark"
            />
          </div>
        </div>
      </footer>
      )}

      {/* ==========================================================================
          MODAL 1: City Selection Dialog
          ========================================================================== */}
      <Dialog
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: { borderRadius: 16, padding: 20, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827', fontFamily: 'var(--font-sans)' }}>
            Select City
          </h3>
          <IconButton size="small" onClick={() => setCityModalOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AVAILABLE_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCity(c);
                setCityModalOpen(false);
                triggerToast(`Location set to ${c}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 10,
                background: city === c ? '#D91E36' : '#F9FAFB',
                border: city === c ? 'none' : '1px solid #E5E7EB',
                fontWeight: city === c ? 700 : 500,
                color: city === c ? '#FFFFFF' : '#111827',
                cursor: 'pointer'
              }}
            >
              <span>{c}</span>
              {city === c && <Check size={16} color="#FFFFFF" />}
            </button>
          ))}
        </div>
      </Dialog>

      {/* ==========================================================================
          MODAL 2: Movie Details & Showtimes Modal
          ========================================================================== */}
      {selectedMovie && (
        <MovieDetailsModal
          open={Boolean(selectedMovie)}
          movie={selectedMovie}
          city={city}
          onClose={() => setSelectedMovie(null)}
          onSelectShowtime={handleSelectShowtime}
          onWatchTrailer={(m) => setTrailerMovie(m)}
          allMovies={movies}
          onSelectMovie={(m) => setSelectedMovie(m)}
        />
      )}

      {/* ==========================================================================
          MODAL 5: User Sign In
          ========================================================================== */}
      <Dialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: { borderRadius: 16, padding: 24, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111827', fontFamily: 'var(--font-sans)' }}>
            {authMode === 'login' ? 'Sign In to CINÉVA' : 'Create Account'}
          </h3>
          <IconButton size="small" onClick={() => setAuthOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {authMode === 'register' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 4 }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="Your Name"
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB' }}
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 4 }}>Email Address</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB' }}
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 4 }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB' }}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-cineva-book-card" style={{ marginTop: 8, padding: '10px 0', fontSize: 14 }}>
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#4B5563' }}>
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#D91E36', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setAuthMode('register')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#D91E36', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </Dialog>

      {/* ==========================================================================
          MODAL 6: My Bookings
          ========================================================================== */}
      <Dialog
        open={myBookingsOpen}
        onClose={() => setMyBookingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: { borderRadius: 16, padding: 24, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111827', fontFamily: 'var(--font-sans)' }}>
              My Bookings
            </h3>
            <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>Signed in as {userEmail}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-cineva-view-all"
              style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
            <IconButton size="small" onClick={() => setMyBookingsOpen(false)}>
              <X size={18} />
            </IconButton>
          </div>
        </div>

        {userBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4B5563' }}>
            <Ticket size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>No bookings found yet. Explore Now Showing movies!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
            {userBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#F9FAFB',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #E5E7EB'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 2px', color: '#111827' }}>{b.title}</h4>
                    <span style={{ fontSize: 12, color: '#4B5563' }}>
                      {new Date(b.starts_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #E5E7EB', fontSize: 13 }}>
                  <span>Seats: <strong>{b.seats?.join(', ') || 'Reserved'}</strong></span>
                  <span>Amount: <strong>₹{Math.round(Number(b.total_minor) / 100)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>

      {/* ==========================================================================
          MODAL 7: Movie Trailer Player
          ========================================================================== */}
      {trailerMovie && (
        <Dialog
          open={Boolean(trailerMovie)}
          onClose={() => setTrailerMovie(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: '#000000',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #374151'
            }
          }}
        >
          <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', color: '#FFFFFF' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
              {trailerMovie.title} - Official Trailer
            </h3>
            <IconButton size="small" onClick={() => setTrailerMovie(null)} style={{ color: '#FFFFFF' }}>
              <X size={18} />
            </IconButton>
          </div>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={getEmbedUrl(trailerMovie.trailer_url)}
              title={`${trailerMovie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </Dialog>
      )}

      {/* ==========================================================================
          MODAL 8: Exclusive Offers & Coupons
          ========================================================================== */}
      <Dialog
        open={offersModalOpen}
        onClose={() => setOffersModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: { borderRadius: 20, padding: 24, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111827', fontFamily: 'var(--font-sans)' }}>
            Special Offers &amp; Promo Codes
          </h3>
          <IconButton size="small" onClick={() => setOffersModalOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>

        <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 16px' }}>
          Apply these promo codes during ticket checkout to enjoy instant savings!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { code: 'CINEVA150', desc: 'Flat ₹150 OFF on all Tamil blockbusters', min: 'Min. 2 tickets' },
            { code: 'CINEVA20', desc: 'Flat 20% OFF on all blockbusters (Up to ₹150)', min: 'Min. 2 tickets' },
            { code: 'EARLYBIRD', desc: 'Flat ₹50 OFF on morning & matinee shows', min: 'Before 4:00 PM' },
            { code: 'WEEKEND', desc: '15% OFF on weekend IMAX & Recliner bookings', min: 'Sat & Sun only' }
          ].map((promo) => (
            <div
              key={promo.code}
              style={{
                background: '#FAFAFC',
                border: '1px dashed #D91E36',
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#D91E36', letterSpacing: '0.05em' }}>
                  {promo.code}
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#374151', fontWeight: 500 }}>
                  {promo.desc}
                </p>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{promo.min}</span>
              </div>
              <button
                type="button"
                className="btn-theatre-view-shows"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => {
                  navigator.clipboard?.writeText(promo.code);
                  setCouponInput(promo.code);
                  triggerToast(`Coupon ${promo.code} copied!`);
                  setOffersModalOpen(false);
                }}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </Dialog>

      {/* ==========================================================================
          MODAL 9: Information & Policies Dialog (FAQ, Terms, Contact)
          ========================================================================== */}
      {infoModal && (
        <Dialog
          open={Boolean(infoModal)}
          onClose={() => setInfoModal(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            style: { borderRadius: 18, padding: 24, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111827', fontFamily: 'var(--font-sans)' }}>
              {infoModal.title}
            </h3>
            <IconButton size="small" onClick={() => setInfoModal(null)}>
              <X size={18} />
            </IconButton>
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', whiteSpace: 'pre-line', fontSize: 13.5, lineHeight: 1.7, color: '#374151' }}>
            {infoModal.content}
          </div>
          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <button
              className="btn-cineva-book-card"
              style={{ width: 'auto', padding: '8px 22px', fontSize: 13 }}
              onClick={() => setInfoModal(null)}
            >
              Close
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
