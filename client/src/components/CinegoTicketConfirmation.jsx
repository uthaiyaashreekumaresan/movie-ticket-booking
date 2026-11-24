import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  Download,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Film,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  QrCode as QrIcon
} from 'lucide-react';

export default function CinegoTicketConfirmation({
  ticketData,
  onDone,
  triggerToast
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const booking = ticketData || {};
  const bookingId = booking.bookingId || `CNG-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const movieTitle = booking.movieTitle || booking.title || 'Blockbuster Movie';
  const movie = booking.movie || {};
  const posterUrl = movie.poster_url || booking.posterUrl || '/assets/posters/amaran.jpg';
  const theatre = booking.theatre || 'Broadway Cinemas';
  const theatreLocation = booking.theatreLocation || 'Screen 04, Auditorium 1';
  const showDate = booking.showDate || new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const showTime = booking.showTime || 'Today, 7:30 PM';
  const seats = Array.isArray(booking.seats) ? booking.seats : ['D8'];
  const ticketQuantity = booking.ticketQuantity || seats.length || 1;
  const totalPaid = booking.totalPaid || booking.amount || (booking.total_minor ? booking.total_minor / 100 : 470);
  const paymentStatus = booking.paymentStatus || 'PAID';
  const bookedAt = booking.bookedAt ? new Date(booking.bookedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  // Generate QR code on mount
  useEffect(() => {
    const payload = JSON.stringify({
      app: 'CINEGO',
      bookingId,
      movie: movieTitle,
      theatre,
      seats: seats.join(','),
      date: showDate,
      time: showTime,
      status: 'PAID_VERIFIED'
    });

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [bookingId, movieTitle, theatre, seats, showDate, showTime]);

  // Generate and Download PDF Ticket using jsPDF
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    triggerToast?.('Generating your cinema ticket PDF...');

    try {
      // Dimensions: 120mm x 210mm (Cinema entry ticket portrait format)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [120, 210]
      });

      // 1. Background Fill: Deep Cinema Midnight
      doc.setFillColor(15, 23, 42); // #0F172A
      doc.rect(0, 0, 120, 210, 'F');

      // 2. Top Header Accent Banner (CINEGO Crimson Red)
      doc.setFillColor(255, 48, 69); // #FF3045
      doc.rect(0, 0, 120, 24, 'F');

      // Brand Logo Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('CINEGO', 60, 12, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL DIGITAL ADMISSION PASS', 60, 18, { align: 'center' });

      // 3. Status Badge: PAID
      doc.setFillColor(16, 185, 129); // #10B981 Green
      doc.roundedRect(42, 28, 36, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIRMED & PAID', 60, 33, { align: 'center' });

      // 4. Movie Title Box
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(movieTitle.toUpperCase(), 60, 44, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(209, 213, 219);
      doc.setFont('helvetica', 'normal');
      doc.text('Tamil • 2D / Atmos • Certified U/A', 60, 50, { align: 'center' });

      // 5. Booking Reference Box
      doc.setFillColor(30, 41, 59); // #1E293B
      doc.roundedRect(12, 54, 96, 12, 3, 3, 'F');
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(7.5);
      doc.text('BOOKING ID', 20, 60);
      doc.setTextColor(255, 48, 69); // #FF3045
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(bookingId, 20, 64);

      doc.setTextColor(156, 163, 175);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('TOTAL PAID', 78, 60);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Rs. ${totalPaid}`, 78, 64);

      // 6. Key Details Grid
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text('THEATRE & LOCATION', 14, 73);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(theatre, 14, 78);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(209, 213, 219);
      doc.text(theatreLocation, 14, 82);

      // Show Date & Time
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(7.5);
      doc.text('SHOW DATE & TIME', 14, 90);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`${showDate} · ${showTime}`, 14, 95);

      // Seats Highlight Banner
      doc.setFillColor(255, 48, 69); // #FF3045
      doc.roundedRect(12, 100, 96, 14, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`SEATS ALLOTTED (${ticketQuantity} TICKETS)`, 60, 105, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(seats.join(', '), 60, 111, { align: 'center' });

      // 7. Tear-off Perforation Line (Dashed Line + Punch Notches)
      doc.setDrawColor(75, 85, 99);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(8, 122, 112, 122);
      doc.setLineDashPattern([], 0); // reset dash

      // Circular cutouts on edges to simulate ticket punch notches
      doc.setFillColor(9, 11, 16); // match app background
      doc.circle(0, 122, 6, 'F');
      doc.circle(120, 122, 6, 'F');

      // 8. QR Code Box
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('ENTRY PASS QR CODE', 60, 131, { align: 'center' });

      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan at cinema turnstile for instant digital entry', 60, 135, { align: 'center' });

      // Embed QR code image
      if (qrDataUrl) {
        // White backing box for QR
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(42, 138, 36, 36, 3, 3, 'F');
        doc.addImage(qrDataUrl, 'PNG', 44, 140, 32, 32);
      }

      // Security verification string
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.setFont('courier', 'normal');
      doc.text(`VERIFICATION: ${bookingId}-SEC`, 60, 180, { align: 'center' });

      // 9. Footer Terms & Branding
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(107, 114, 128);
      doc.text('Valid for single admission only • Non-transferable after scanning', 60, 188, { align: 'center' });
      doc.text(`Booked on: ${bookedAt}`, 60, 193, { align: 'center' });

      doc.setTextColor(255, 48, 69);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('ENJOY YOUR MOVIE WITH CINEGO', 60, 201, { align: 'center' });

      // 10. Save and Trigger Native Download
      const fileName = `CINEGO-Ticket-${bookingId}.pdf`;
      doc.save(fileName);

      triggerToast?.(`Ticket downloaded: ${fileName}`);
    } catch (err) {
      console.error('PDF generation error:', err);
      triggerToast?.('Failed to download PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="cinego-booking-root cinego-confirmation-view">
      {/* ==========================================================================
          1. TOP NAVIGATION & STEPPER (Step 3: Confirmation Active)
          ========================================================================== */}
      <header className="cinego-topbar">
        <div className="cinego-topbar-brand" onClick={onDone} title="Return to Home">
          <div className="cinego-logo-group">
            <svg className="cinego-reel-icon" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#FF3045" />
              <circle cx="20" cy="20" r="15" fill="#DC2626" stroke="#FF4D61" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="4.5" fill="#0F172A" />
              <circle cx="20" cy="10" r="3" fill="#0F172A" />
              <circle cx="20" cy="30" r="3" fill="#0F172A" />
              <circle cx="10" cy="20" r="3" fill="#0F172A" />
              <circle cx="30" cy="20" r="3" fill="#0F172A" />
            </svg>
            <span className="cinego-brand-text">CINEGO</span>
          </div>
        </div>

        {/* Stepper Pill: Step 3 Confirmation Active */}
        <div className="cinego-stepper-pill">
          <div className="stepper-step completed">
            <span className="stepper-num"><CheckCircle size={13} /></span>
            <span className="stepper-label">Seats</span>
          </div>
          <div className="stepper-divider active" />

          <div className="stepper-step completed">
            <span className="stepper-num"><CheckCircle size={13} /></span>
            <span className="stepper-label">Payment</span>
          </div>
          <div className="stepper-divider active" />

          <div className="stepper-step active">
            <span className="stepper-num">3</span>
            <span className="stepper-label">Confirmation</span>
          </div>
        </div>

        {/* Success Status Pill */}
        <div className="cinego-timer-pill confirmation-status-pill">
          <CheckCircle size={16} color="#10B981" />
          <span className="cinego-timer-text text-green">
            <strong>Booking Confirmed</strong>
          </span>
        </div>
      </header>

      {/* ==========================================================================
          2. CONFIRMATION HERO MESSAGE
          ========================================================================== */}
      <div className="confirmation-hero-banner">
        <div className="conf-check-circle">
          <CheckCircle size={36} color="#10B981" />
        </div>
        <h1 className="conf-hero-title">Woohoo! Your Tickets are Confirmed</h1>
        <p className="conf-hero-desc">
          Booking ID <span className="highlight-id">{bookingId}</span> has been confirmed and saved to your account.
        </p>
      </div>

      {/* ==========================================================================
          3. PROFESSIONAL DIGITAL MOVIE TICKET CARD
          ========================================================================== */}
      <div className="digital-ticket-container">
        <div className="digital-ticket-card">
          {/* Ticket Header Band */}
          <div className="ticket-header-band">
            <div className="brand-badge-row">
              <span className="ticket-cne-logo">CINEGO PASS</span>
              <span className="ticket-paid-tag">PAID ✓</span>
            </div>
            <div className="ticket-id-tag">ID: {bookingId}</div>
          </div>

          {/* Ticket Main Body */}
          <div className="ticket-card-content">
            {/* Left Movie Info & Poster */}
            <div className="ticket-movie-row">
              <div className="ticket-poster-frame">
                <img
                  src={posterUrl}
                  alt={movieTitle}
                  className="ticket-poster-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/posters/amaran.jpg';
                  }}
                />
              </div>

              <div className="ticket-movie-text">
                <h3 className="ticket-movie-heading">{movieTitle}</h3>
                <span className="ticket-genre-tag">Tamil • 2D • Certified U/A</span>

                <div className="ticket-meta-grid">
                  <div className="meta-cell">
                    <span className="cell-label">THEATRE</span>
                    <strong className="cell-val">{theatre}</strong>
                    <span className="cell-sub">{theatreLocation}</span>
                  </div>

                  <div className="meta-cell">
                    <span className="cell-label">DATE & TIME</span>
                    <strong className="cell-val">{showDate}</strong>
                    <span className="cell-sub">{showTime}</span>
                  </div>

                  <div className="meta-cell">
                    <span className="cell-label">SEATS ({ticketQuantity})</span>
                    <strong className="cell-val highlight-seats">{seats.join(', ')}</strong>
                  </div>

                  <div className="meta-cell">
                    <span className="cell-label">AMOUNT PAID</span>
                    <strong className="cell-val text-green">₹{totalPaid}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated Stub Divider */}
            <div className="ticket-perforated-stub">
              <span className="stub-punch left" />
              <div className="stub-dash-line" />
              <span className="stub-punch right" />
            </div>

            {/* Ticket Bottom QR Verification Bar */}
            <div className="ticket-verification-row">
              <div className="qr-box-container">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Entry QR" className="ticket-qr-img" />
                ) : (
                  <QrIcon size={72} color="#0F172A" />
                )}
              </div>

              <div className="verification-notes">
                <h4>Digital M-Ticket Pass</h4>
                <p>Scan this QR code at cinema turnstile or usher checkpoint for direct paperless entry.</p>
                <div className="security-hash">
                  <span>Ref: {bookingId}</span>
                  <span>• Status: {paymentStatus}</span>
                  <span>• Booked: {bookedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            4. PROMINENT DOWNLOAD TICKET PDF ACTION (NO Print button)
            ========================================================================== */}
        <div className="ticket-actions-bar">
          <button
            type="button"
            className="btn-download-pdf"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            <Download size={20} />
            <span>{isGeneratingPdf ? 'Generating PDF Ticket...' : 'Download Ticket PDF'}</span>
          </button>

          <button
            type="button"
            className="btn-book-more"
            onClick={onDone}
          >
            <span>Back to Movies</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
