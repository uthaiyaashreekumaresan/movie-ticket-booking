import React, { useState, useEffect, useMemo } from 'react';
import {
  Clapperboard,
  Calendar,
  Monitor,
  Armchair,
  Ticket,
  Percent,
  CreditCard,
  Clock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function SeatLayout2D({
  seats = [],
  selectedSeats = [],
  onToggleSeat,
  maxSeats = 8,
  movieTitle = 'Amaran',
  theatreName = 'Broadway Cinemas',
  showTime = 'Today, 7:30 PM',
  format = 'Tamil - 2D',
  posterUrl = '',
  onProceedToCheckout,
  onBack,
  triggerToast
}) {
  // Live 10-minute hold countdown timer (starts at 09:45)
  const [timeLeft, setTimeLeft] = useState(585);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group seats by row
  const { rowLabels, rowMap, priceMap } = useMemo(() => {
    const map = {};
    const prices = { premium: 350, regular: 220 };

    seats.forEach((seat) => {
      const row = seat.row_label || 'A';
      if (!map[row]) {
        map[row] = [];
      }
      map[row].push(seat);

      if (seat.price_minor) {
        const isPrem = seat.category === 'premium' || ['G', 'H', 'J', 'K'].includes(row);
        prices[isPrem ? 'premium' : 'regular'] = Math.round(Number(seat.price_minor) / 100);
      }
    });

    const labels = Object.keys(map).sort();
    labels.forEach((r) => map[r].sort((a, b) => a.seat_number - b.seat_number));

    return { rowLabels: labels, rowMap: map, priceMap: prices };
  }, [seats]);

  // Selected seats objects & price calculation
  const selectedSeatObjects = useMemo(() => {
    return seats.filter((s) => selectedSeats.includes(s.id));
  }, [seats, selectedSeats]);

  const ticketsSubtotal = useMemo(() => {
    return selectedSeatObjects.reduce((acc, s) => {
      const isPrem = s.category === 'premium' || ['G', 'H', 'J', 'K'].includes(s.row_label);
      const price = s.price_minor ? Math.round(Number(s.price_minor) / 100) : (isPrem ? priceMap.premium : priceMap.regular);
      return acc + price;
    }, 0);
  }, [selectedSeatObjects, priceMap]);

  const convenienceFee = selectedSeatObjects.length > 0 ? 30 : 0;
  const grandTotal = ticketsSubtotal + convenienceFee;

  // Average or representative unit price for label
  const representativeUnitPrice = useMemo(() => {
    if (selectedSeatObjects.length === 0) return priceMap.regular;
    return Math.round(ticketsSubtotal / selectedSeatObjects.length);
  }, [selectedSeatObjects, ticketsSubtotal, priceMap]);

  const handleSeatClick = (seat) => {
    const isBooked = seat.status === 'booked' || seat.status === 'locked' || seat.is_booked;
    if (isBooked) {
      triggerToast?.('This seat is already booked.');
      return;
    }
    const isAlreadySelected = selectedSeats.includes(seat.id);
    if (!isAlreadySelected && selectedSeats.length >= maxSeats) {
      triggerToast?.(`You can select a maximum of ${maxSeats} seats.`);
      return;
    }
    onToggleSeat(seat.id);
  };

  const handleProceed = () => {
    if (selectedSeatObjects.length === 0) {
      triggerToast?.('Please select at least 1 seat to proceed.');
      return;
    }
    onProceedToCheckout?.({
      selectedSeatObjects,
      totalPrice: grandTotal * 100
    });
  };

  return (
    <div className="cinego-booking-root">
      {/* ==========================================================================
          1. EXACT TOP HEADER BAR
          Left: CINEGO Brand Logo
          Center: Step Indicator [ 1 Seats —— 2 Payment —— 3 Confirmation ]
          Right: Live Hold Timer [ Clock Seats held for 09:45 ]
          ========================================================================== */}
      <header className="cinego-topbar">
        {/* Left: CINEGO Logo & Back Action */}
        <div className="cinego-topbar-brand" onClick={onBack} title="Go back to movies">
          {onBack && (
            <button type="button" className="cinego-btn-back" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="cinego-logo-group">
            <svg
              className="cinego-reel-icon"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="18" fill="#DC2626" />
              <circle cx="20" cy="20" r="15" fill="#B91C1C" stroke="#EF4444" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="4.5" fill="#0F172A" />
              <circle cx="20" cy="10" r="3.2" fill="#0F172A" />
              <circle cx="20" cy="30" r="3.2" fill="#0F172A" />
              <circle cx="10" cy="20" r="3.2" fill="#0F172A" />
              <circle cx="30" cy="20" r="3.2" fill="#0F172A" />
              <circle cx="13" cy="13" r="2" fill="#0F172A" />
              <circle cx="27" cy="13" r="2" fill="#0F172A" />
              <circle cx="13" cy="27" r="2" fill="#0F172A" />
              <circle cx="27" cy="27" r="2" fill="#0F172A" />
            </svg>
            <span className="cinego-brand-text">CINEGO</span>
          </div>
        </div>

        {/* Center: Stepper Pill */}
        <div className="cinego-stepper-pill">
          {/* Step 1: Active */}
          <div className="stepper-step active">
            <span className="stepper-num">1</span>
            <span className="stepper-label">Seats</span>
          </div>
          <div className="stepper-divider active" />

          {/* Step 2: Payment */}
          <div className="stepper-step">
            <span className="stepper-num">2</span>
            <span className="stepper-label">Payment</span>
          </div>
          <div className="stepper-divider" />

          {/* Step 3: Confirmation */}
          <div className="stepper-step">
            <span className="stepper-num">3</span>
            <span className="stepper-label">Confirmation</span>
          </div>
        </div>

        {/* Right: Seats Held Countdown Timer */}
        <div className="cinego-timer-pill">
          <Clock size={16} className="cinego-timer-icon" />
          <span className="cinego-timer-text">
            Seats held for <strong>{formatTimer(timeLeft)}</strong>
          </span>
        </div>
      </header>

      {/* ==========================================================================
          2. MAIN SIDE-BY-SIDE CARDS LAYOUT
          Left: Cinema Seating Layout Card
          Right: Booking Summary Card
          ========================================================================== */}
      <main className="cinego-main-grid">
        {/* LEFT COLUMN: SEATING AUDITORIUM CARD */}
        <section className="cinego-seating-card">
          {/* Card Top: Movie Poster & Details */}
          <div className="cinego-movie-info-header">
            <div className="cinego-poster-frame">
              <img
                src={posterUrl || '/assets/posters/amaran.jpg'}
                alt={movieTitle}
                className="cinego-poster-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/posters/amaran.jpg';
                }}
              />
              <div className="cinego-poster-aura" />
            </div>

            <div className="cinego-movie-meta-col">
              <h1 className="cinego-movie-heading">[{movieTitle.toUpperCase()}]</h1>
              <div className="cinego-meta-pills-row">
                <div className="meta-pill-item">
                  <Clapperboard size={15} className="meta-icon" />
                  <span>{theatreName.toUpperCase()}</span>
                </div>
                <span className="meta-sep">|</span>
                <div className="meta-pill-item">
                  <Calendar size={15} className="meta-icon" />
                  <span>{showTime}</span>
                </div>
                <span className="meta-sep">|</span>
                <div className="meta-pill-item">
                  <Monitor size={15} className="meta-icon" />
                  <span>{format}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Curved Cinema Screen Bar */}
          <div className="cinego-screen-wrap">
            <svg
              className="cinego-screen-curve-svg"
              viewBox="0 0 540 30"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="cinegoScreenGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#EF4444" />
                </filter>
              </defs>
              <path
                d="M 15 26 Q 270 4 525 26"
                stroke="#DC2626"
                strokeWidth="3.2"
                fill="none"
                strokeLinecap="round"
                filter="url(#cinegoScreenGlow)"
              />
            </svg>
            <div className="cinego-screen-caption">
              <span className="screen-line">—</span>
              <span className="screen-caption-text">ALL EYES THIS WAY</span>
              <span className="screen-line">—</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="cinego-seats-grid-wrap">
            <div className="cinego-seats-grid">
              {rowLabels.map((rowLabel, rIdx) => {
                const isPremiumRow = rIdx >= rowLabels.length - 2 || ['G', 'H', 'J', 'K'].includes(rowLabel);
                const rowSeats = rowMap[rowLabel] || [];

                return (
                  <div key={rowLabel} className="cinego-seat-row">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.includes(seat.id);
                      const isBooked = seat.status === 'booked' || seat.status === 'locked' || seat.is_booked;

                      let seatClass = 'available';
                      if (isSelected) {
                        seatClass = 'selected';
                      } else if (isBooked) {
                        seatClass = 'booked';
                      } else if (isPremiumRow) {
                        seatClass = 'premium';
                      }

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          className={`cinego-seat-box ${seatClass}`}
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          title={`Seat ${seat.row_label}${seat.seat_number} · ${isPremiumRow ? 'Premium ₹' + priceMap.premium : 'Standard ₹' + priceMap.regular}`}
                          aria-label={`Seat ${seat.row_label}${seat.seat_number}`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Legend Pill Bar */}
          <div className="cinego-legend-bar">
            <div className="legend-chip">
              <span className="legend-indicator available" />
              <span>Available</span>
            </div>
            <div className="legend-chip">
              <span className="legend-indicator selected" />
              <span>Selected</span>
            </div>
            <div className="legend-chip">
              <span className="legend-indicator booked" />
              <span>Booked</span>
            </div>
            <div className="legend-chip">
              <span className="legend-indicator premium" />
              <span>Premium</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: BOOKING SUMMARY CARD */}
        <aside className="cinego-summary-card">
          {/* Summary Header */}
          <div className="summary-header-row">
            <div className="summary-ticket-badge">
              <Ticket size={22} className="summary-ticket-icon" />
            </div>
            <h2 className="summary-header-title">Booking Summary</h2>
          </div>

          {/* Summary Data Rows */}
          <div className="summary-details-list">
            {/* Seats Row */}
            <div className="summary-detail-row">
              <div className="detail-label-wrap">
                <Armchair size={17} className="detail-icon" />
                <span>Seats</span>
              </div>
              <strong className="detail-value-text">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
              </strong>
            </div>

            {/* Tickets Count & Price */}
            <div className="summary-detail-row">
              <div className="detail-label-wrap">
                <Ticket size={17} className="detail-icon" />
                <span>
                  Tickets ({selectedSeats.length} x {selectedSeats.length > 0 ? `₹${representativeUnitPrice}` : '[PRICE]'})
                </span>
              </div>
              <strong className="detail-value-text">
                {selectedSeats.length > 0 ? `₹${ticketsSubtotal}` : '[AMOUNT]'}
              </strong>
            </div>

            {/* Convenience Fee */}
            <div className="summary-detail-row">
              <div className="detail-label-wrap">
                <Percent size={17} className="detail-icon" />
                <span>Convenience fee</span>
              </div>
              <strong className="detail-value-text">
                {selectedSeats.length > 0 ? `₹${convenienceFee}` : '[AMOUNT]'}
              </strong>
            </div>
          </div>

          {/* Divider Line */}
          <div className="summary-divider-line" />

          {/* Total Row */}
          <div className="summary-total-row">
            <span className="summary-total-label">Total</span>
            <span className="summary-total-value">
              {selectedSeats.length > 0 ? `₹${grandTotal}` : '[TOTAL]'}
            </span>
          </div>

          {/* Proceed to Pay Action Button */}
          <button
            type="button"
            className="btn-cinego-proceed-pay"
            disabled={selectedSeats.length === 0}
            onClick={handleProceed}
          >
            <CreditCard size={18} />
            <span>Proceed to Pay</span>
            <ArrowRight size={18} />
          </button>
        </aside>
      </main>
    </div>
  );
}
