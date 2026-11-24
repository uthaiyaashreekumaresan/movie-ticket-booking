# CINEGO — Online Movie Ticket Booking Platform 🎬🎟️

A modern, high-performance cinema ticket booking application tailored for Tamil cinema enthusiasts. Built with a full-stack architecture featuring **React (Vite)** on the frontend, **Express.js & Node.js** on the backend, and **PostgreSQL** for relational data persistence.

---

## ✨ Features

- **Hero Banner Showcase**: Dynamic 3D fanned-out cards and carousel featuring top Tamil blockbusters (*The GOAT*, *Amaran*, *Vettaiyan*).
- **Now Showing Tamil Movies**: Filterable by genre (*Action*, *Drama*, *Comedy*, *3D*, etc.) with showtimes across major cities (Chennai, Pudukkottai, Coimbatore, Madurai, etc.).
- **Upcoming Movies Carousel**: Horizontally sliding carousel with genre badges, release dates, reminder alerts, and smooth navigation arrows (*Thug Life*, *Good Bad Ugly*, *Coolie*, *Vidaamuyarchi*, *Kubera*).
- **Interactive 2D Seat Selection**: Real-time cinema auditorium layout with seat hold timers, tier selection (Classic, Prime, Recliner), and live price calculation.
- **Online Payment Page**: Secure payment processing simulation supporting UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.
- **PDF Ticket Download**: Instant, high-resolution cinema ticket generation using `jsPDF` and `html2canvas` complete with QR code and booking ID.
- **Admin Dashboard**: Full CRUD management for movies, hero banners, show scheduling, and ticket booking tracking at `/admin`.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Material UI, jsPDF, html2canvas
- **Backend**: Node.js, Express.js, PostgreSQL (`pg` pool with transactions), JWT authentication, Bcrypt
- **Database**: PostgreSQL with ACID transactional seat locking to prevent double-booking

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone & Setup Repository
```bash
git clone https://github.com/uthaiyaashreekumaresan/movie-ticket-booking.git
cd movie-ticket-booking
```

### 2. Configure Backend
```bash
cd server
cp .env.example .env
# Update DATABASE_URL and JWT_SECRET in server/.env
npm install
npm run db:init
npm run db:seed
npm run dev
```

### 3. Configure Frontend
```bash
cd ../client
npm install
npm run dev
```

The client runs at `http://localhost:5173` and proxies API requests to `http://localhost:4000`.

---

## 📂 Project Structure

```
├── client/                     # Vite + React Frontend
│   ├── public/assets/posters/  # High-resolution Tamil movie posters
│   ├── src/
│   │   ├── components/         # HeroBanner, UpcomingCarousel, PaymentPage, Ticket, SeatLayout
│   │   ├── App.jsx             # Main customer booking flow
│   │   ├── AdminApp.jsx        # Admin dashboard and management portal
│   │   └── styles.css          # Dark cinema aesthetic styling
├── server/                     # Express.js REST API
│   ├── src/
│   │   ├── db/                 # DB Pool, Schema init, and Tamil movie seeds
│   │   ├── modules/            # movies, shows, seats, bookings, banners, auth, admin
│   │   └── app.js              # Express app setup & CORS configuration
└── database/
    └── schema.sql              # PostgreSQL relational schema
```

---

## 📄 License
MIT License
