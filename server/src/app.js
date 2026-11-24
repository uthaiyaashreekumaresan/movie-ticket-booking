import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import movieRoutes from './modules/movies/routes.js';
import seatRoutes from './modules/seats/routes.js';
import bookingRoutes from './modules/bookings/routes.js';
import paymentRoutes from './modules/payments/routes.js';
import adminRoutes from './modules/admin/routes.js';
import authRoutes from './modules/auth/routes.js';
import showRoutes from './modules/shows/routes.js';
import bannerRoutes from './modules/banners/routes.js';

export const app = express();
app.use(helmet());

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        clientOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  })
);

// Provider webhooks require the raw body for signature verification.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 100 }));
app.use('/api/admin/auth/login', rateLimit({ windowMs: 15 * 60_000, limit: 100 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/banners', bannerRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use((err, _req, res, _next) => {
  console.error('[SERVER ERROR]:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  const errorMsg = err.publicMessage || err.message || 'Unexpected server error';
  res.status(status).json({ error: errorMsg });
});
