CREATE EXTENSION IF NOT EXISTS citext;
CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email CITEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, phone TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admins (
 id BIGSERIAL PRIMARY KEY, email CITEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK (role IN ('super_admin','manager','staff')),
 active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS genres (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS movies (
 id BIGSERIAL PRIMARY KEY, title TEXT UNIQUE NOT NULL, synopsis TEXT, language TEXT,
 duration_minutes INT CHECK(duration_minutes > 0), release_date DATE, poster_url TEXT,
 trailer_url TEXT, rating NUMERIC(2,1) DEFAULT 0 CHECK(rating BETWEEN 0 AND 10),
 status TEXT NOT NULL CHECK(status IN ('coming_soon','now_showing','archived')),
 featured BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS movie_genres (
 movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
 genre_id BIGINT REFERENCES genres(id), PRIMARY KEY(movie_id, genre_id)
);
CREATE TABLE IF NOT EXISTS theatres (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, address TEXT NOT NULL,
 latitude NUMERIC(9,6), longitude NUMERIC(9,6), active BOOLEAN NOT NULL DEFAULT true, UNIQUE(name,city)
);
CREATE TABLE IF NOT EXISTS screens (
 id BIGSERIAL PRIMARY KEY, theatre_id BIGINT NOT NULL REFERENCES theatres(id), name TEXT NOT NULL,
 UNIQUE(theatre_id, name)
);
CREATE TABLE IF NOT EXISTS seats (
 id BIGSERIAL PRIMARY KEY, screen_id BIGINT NOT NULL REFERENCES screens(id),
 row_label TEXT NOT NULL, seat_number INT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('regular','premium')), active BOOLEAN DEFAULT true,
 UNIQUE(screen_id, row_label, seat_number)
);
CREATE TABLE IF NOT EXISTS shows (
 id BIGSERIAL PRIMARY KEY, movie_id BIGINT NOT NULL REFERENCES movies(id),
 screen_id BIGINT NOT NULL REFERENCES screens(id), starts_at TIMESTAMPTZ NOT NULL,
 ends_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled'
 CHECK(status IN ('scheduled','cancelled','completed')), CHECK(ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS shows_movie_time_idx ON shows(movie_id, starts_at);
CREATE TABLE IF NOT EXISTS show_seat_prices (
 show_id BIGINT REFERENCES shows(id) ON DELETE CASCADE, seat_id BIGINT REFERENCES seats(id),
 price_minor BIGINT NOT NULL CHECK(price_minor >= 0), PRIMARY KEY(show_id, seat_id)
);
CREATE TABLE IF NOT EXISTS bookings (
 id UUID PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), show_id BIGINT NOT NULL REFERENCES shows(id),
 status TEXT NOT NULL CHECK(status IN ('pending_payment','confirmed','expired','cancelled','refund_pending','refunded')),
 total_minor BIGINT NOT NULL CHECK(total_minor >= 0), currency CHAR(3) NOT NULL DEFAULT 'INR',
 expires_at TIMESTAMPTZ, seat_count INT NOT NULL CHECK(seat_count > 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Unique show-seat key serializes competing holds even across API instances.
CREATE TABLE IF NOT EXISTS seat_holds (
 show_id BIGINT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
 seat_id BIGINT NOT NULL REFERENCES seats(id), user_id BIGINT NOT NULL REFERENCES users(id),
 session_id UUID NOT NULL, booking_id UUID REFERENCES bookings(id), expires_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(show_id, seat_id)
);
CREATE INDEX IF NOT EXISTS seat_holds_expiry_idx ON seat_holds(expires_at);
CREATE TABLE IF NOT EXISTS booking_seats (
 booking_id UUID NOT NULL REFERENCES bookings(id), show_id BIGINT NOT NULL REFERENCES shows(id),
 seat_id BIGINT NOT NULL REFERENCES seats(id), price_minor BIGINT NOT NULL CHECK(price_minor >= 0),
 PRIMARY KEY(booking_id, seat_id), UNIQUE(show_id, seat_id)
);
CREATE TABLE IF NOT EXISTS payments (
 id BIGSERIAL PRIMARY KEY, booking_id UUID NOT NULL REFERENCES bookings(id), provider TEXT NOT NULL,
 provider_payment_id TEXT UNIQUE, provider_event_id TEXT UNIQUE,
 amount_minor BIGINT NOT NULL CHECK(amount_minor >= 0),
 status TEXT NOT NULL CHECK(status IN ('created','pending','succeeded','failed','refund_pending','refunded')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coupons (
 id BIGSERIAL PRIMARY KEY, code CITEXT UNIQUE NOT NULL,
 discount_type TEXT NOT NULL CHECK(discount_type IN ('percent','fixed')),
 discount_value INT NOT NULL CHECK(discount_value > 0), starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
 max_uses INT, active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS reviews (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), movie_id BIGINT NOT NULL REFERENCES movies(id),
 rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5), body TEXT, moderated BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id,movie_id)
);
CREATE TABLE IF NOT EXISTS food_items (
 id BIGSERIAL PRIMARY KEY, theatre_id BIGINT NOT NULL REFERENCES theatres(id), name TEXT NOT NULL,
 price_minor BIGINT NOT NULL CHECK(price_minor >= 0), active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS notifications (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), type TEXT NOT NULL,
 payload JSONB NOT NULL DEFAULT '{}', sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wishes (
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(user_id,movie_id)
);
CREATE TABLE IF NOT EXISTS webhook_events (
 provider TEXT NOT NULL, event_id TEXT NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(provider,event_id)
);
