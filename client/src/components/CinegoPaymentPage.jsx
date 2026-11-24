import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Info,
  QrCode,
  Zap
} from 'lucide-react';

export default function CinegoPaymentPage({
  bookingData,
  authed,
  onRequireLogin,
  onPaymentSuccess,
  onBackToSeats,
  triggerToast
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, debit, credit, netbanking
  const [upiOption, setUpiOption] = useState('qr'); // qr, vpa
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Processing & verification animation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0: Idle, 1: Contacting bank, 2: Verifying, 3: Completed
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const [errorMessage, setErrorMessage] = useState('');

  // 10-minute hold countdown
  const [secondsLeft, setSecondsLeft] = useState(540); // 9 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Safe fallback calculation
  const movie = bookingData?.movie || {};
  const movieTitle = bookingData?.movieTitle || movie.title || 'Blockbuster Movie';
  const theatre = bookingData?.theatre || 'Broadway Cinemas';
  const theatreLocation = bookingData?.theatreLocation || 'Screen 04, Auditorium 1';
  const showTime = bookingData?.showTime || 'Today, 7:30 PM';
  const showDate = bookingData?.showDate || new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const selectedSeats = bookingData?.selectedSeats || [];
  const seatLabels = selectedSeats.map((s) => (typeof s === 'string' ? s : `${s.row_label}${s.seat_number}`));

  const ticketPrice = bookingData?.ticketPrice || (bookingData?.totalPrice ? Math.round(bookingData.totalPrice / 100) - 30 : 220 * (seatLabels.length || 1));
  const convenienceFee = 30;
  const appliedDiscount = bookingData?.discount || 0;
  const finalPayable = Math.max(0, ticketPrice + convenienceFee - appliedDiscount);

  // Card number formatter
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Expiry formatter MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Handle Pay Now click
  const handlePayNow = async (forceSimulatedFail = false) => {
    setErrorMessage('');

    // Enforce User Authentication: Cannot pay without signing in
    const token = localStorage.getItem('cineverse-user-token');
    if (!token) {
      triggerToast?.('Please sign in to your account to complete booking payment.');
      onRequireLogin?.();
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setProcessingStep(1);

    try {
      // Step 1: Request order token from backend gateway
      const API = import.meta.env.VITE_API_URL || '/api';
      const orderRes = await fetch(`${API}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalPayable,
          currency: 'INR',
          bookingDetails: {
            movieTitle,
            theatre,
            showTime,
            seats: seatLabels
          }
        })
      });

      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          triggerToast?.('Session expired. Please sign in to book tickets.');
          onRequireLogin?.();
          setIsProcessing(false);
          setPaymentStatus('idle');
          return;
        }
        const orderErr = await orderRes.json().catch(() => ({}));
        throw new Error(orderErr.error || 'Failed to initiate secure payment gateway order.');
      }

      const orderData = await orderRes.json();
      const orderId = orderData.orderId || 'order_cng_' + Date.now().toString(36);
      const signature = orderData.signature || '';

      // Step 2: Simulate banking animation steps
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep(2);

      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep(3);

      if (forceSimulatedFail) {
        throw new Error('Transaction declined by issuing bank (Test Failure Simulation). Please try another method.');
      }

      // Step 3: Secure verification on backend
      const verifyRes = await fetch(`${API}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          paymentId: 'pay_cng_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          signature,
          method: paymentMethod,
          amount: finalPayable,
          bookingDetails: {
            movieTitle,
            movie,
            theatre,
            theatreLocation,
            showTime,
            showDate,
            seats: seatLabels,
            ticketPrice,
            convenienceFee,
            discount: appliedDiscount,
            totalAmount: finalPayable
          }
        })
      });

      if (!verifyRes.ok) {
        if (verifyRes.status === 401) {
          triggerToast?.('Session expired. Please sign in to confirm ticket booking.');
          onRequireLogin?.();
          setIsProcessing(false);
          setPaymentStatus('idle');
          return;
        }
        const verifyErr = await verifyRes.json().catch(() => ({}));
        throw new Error(verifyErr.error || 'Payment verification failed at gateway.');
      }

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed at gateway.');
      }

      // Payment Success state
      setPaymentStatus('success');
      triggerToast?.('Payment Verified! Redirecting to confirmed ticket...');

      // Auto redirect to Step 3 Confirmation after brief celebration
      setTimeout(() => {
        onPaymentSuccess?.(verifyData.booking || {
          bookingId: verifyData.bookingId,
          paymentId: verifyData.paymentId,
          movieTitle,
          movie,
          theatre,
          theatreLocation,
          showTime,
          showDate,
          seats: seatLabels,
          ticketQuantity: seatLabels.length,
          ticketPrice,
          convenienceFee,
          totalPaid: finalPayable,
          paymentStatus: 'PAID',
          paymentMethod,
          bookedAt: verifyData.bookedAt || new Date().toISOString()
        });
      }, 1200);

    } catch (err) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      triggerToast?.(err.message || 'Payment failed.');
    }
  };

  return (
    <div className="cinego-booking-root cinego-payment-view">
      {/* ==========================================================================
          1. TOP NAVIGATION & STEPPER BAR (Step 2: Payment Active)
          ========================================================================== */}
      <header className="cinego-topbar">
        <div className="cinego-topbar-brand" onClick={onBackToSeats} title="Back to Seat Selection">
          <button type="button" className="cinego-btn-back" aria-label="Back to seats">
            <ArrowLeft size={18} />
          </button>
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

        {/* Stepper Pill: Step 2 Payment Active */}
        <div className="cinego-stepper-pill">
          <div className="stepper-step completed" onClick={onBackToSeats} style={{ cursor: 'pointer' }} title="Change seats">
            <span className="stepper-num"><CheckCircle size={13} /></span>
            <span className="stepper-label">Seats</span>
          </div>
          <div className="stepper-divider active" />

          <div className="stepper-step active">
            <span className="stepper-num">2</span>
            <span className="stepper-label">Payment</span>
          </div>
          <div className="stepper-divider" />

          <div className="stepper-step">
            <span className="stepper-num">3</span>
            <span className="stepper-label">Confirmation</span>
          </div>
        </div>

        {/* Live Hold Timer */}
        <div className="cinego-timer-pill">
          <Clock size={16} className="cinego-timer-icon" />
          <span className="cinego-timer-text">
            Session expires in <strong>{formatTimer(secondsLeft)}</strong>
          </span>
        </div>
      </header>

      {/* ==========================================================================
          2. MAIN PAYMENT GRID: Left Methods & Form | Right Booking Order Summary
          ========================================================================== */}
      <div className="cinego-main-grid cinego-payment-grid">
        {/* LEFT COLUMN: Payment Methods & Gateway Card */}
        <section className="cinego-payment-card">
          <div className="payment-card-header">
            <div className="payment-title-group">
              <h2 className="payment-heading">Choose Payment Method</h2>
              <p className="payment-subheading">
                All transactions are encrypted with 256-Bit SSL and verified by RBI-compliant gateway.
              </p>
            </div>
            <div className="secure-badge-pill">
              <Lock size={14} color="#10B981" />
              <span>SSL SECURED</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="payment-methods-tabs">
            <button
              type="button"
              className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <Smartphone size={18} />
              <span>UPI / QR</span>
              <span className="tab-hot-tag">Fast</span>
            </button>

            <button
              type="button"
              className={`payment-tab-btn ${paymentMethod === 'debit' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('debit')}
            >
              <CreditCard size={18} />
              <span>Debit Card</span>
            </button>

            <button
              type="button"
              className={`payment-tab-btn ${paymentMethod === 'credit' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('credit')}
            >
              <CreditCard size={18} />
              <span>Credit Card</span>
            </button>

            <button
              type="button"
              className={`payment-tab-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('netbanking')}
            >
              <Building size={18} />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Payment Form Content Area */}
          <div className="payment-method-body">
            {/* ================= METHOD 1: UPI ================= */}
            {paymentMethod === 'upi' && (
              <div className="upi-payment-section">
                <div className="upi-selector-pills">
                  <button
                    type="button"
                    className={`upi-pill-option ${upiOption === 'qr' ? 'active' : ''}`}
                    onClick={() => setUpiOption('qr')}
                  >
                    <QrCode size={16} />
                    <span>Scan UPI QR</span>
                  </button>
                  <button
                    type="button"
                    className={`upi-pill-option ${upiOption === 'vpa' ? 'active' : ''}`}
                    onClick={() => setUpiOption('vpa')}
                  >
                    <Smartphone size={16} />
                    <span>Enter UPI ID / VPA</span>
                  </button>
                </div>

                {upiOption === 'qr' ? (
                  <div className="upi-qr-display-box">
                    <div className="qr-wrapper">
                      {/* Dynamic Simulated Payment QR */}
                      <svg viewBox="0 0 140 140" className="upi-qr-graphic">
                        <rect width="140" height="140" fill="#FFFFFF" rx="10" />
                        {/* Position Markers */}
                        <rect x="12" y="12" width="34" height="34" fill="#0F172A" rx="4" />
                        <rect x="18" y="18" width="22" height="22" fill="#FFFFFF" rx="2" />
                        <rect x="23" y="23" width="12" height="12" fill="#FF3045" rx="1" />

                        <rect x="94" y="12" width="34" height="34" fill="#0F172A" rx="4" />
                        <rect x="100" y="18" width="22" height="22" fill="#FFFFFF" rx="2" />
                        <rect x="105" y="23" width="12" height="12" fill="#FF3045" rx="1" />

                        <rect x="12" y="94" width="34" height="34" fill="#0F172A" rx="4" />
                        <rect x="18" y="100" width="22" height="22" fill="#FFFFFF" rx="2" />
                        <rect x="23" y="105" width="12" height="12" fill="#FF3045" rx="1" />

                        {/* QR Grid Pattern details */}
                        <rect x="54" y="14" width="8" height="8" fill="#0F172A" />
                        <rect x="70" y="14" width="8" height="8" fill="#0F172A" />
                        <rect x="54" y="30" width="8" height="8" fill="#0F172A" />
                        <rect x="66" y="26" width="16" height="8" fill="#0F172A" />
                        <rect x="54" y="50" width="32" height="8" fill="#0F172A" />
                        <rect x="14" y="58" width="8" height="24" fill="#0F172A" />
                        <rect x="30" y="66" width="16" height="8" fill="#0F172A" />
                        <rect x="60" y="66" width="20" height="20" fill="#FF3045" rx="2" />
                        <rect x="94" y="54" width="14" height="8" fill="#0F172A" />
                        <rect x="116" y="54" width="12" height="16" fill="#0F172A" />
                        <rect x="94" y="70" width="20" height="14" fill="#0F172A" />
                        <rect x="54" y="94" width="8" height="14" fill="#0F172A" />
                        <rect x="70" y="94" width="14" height="8" fill="#0F172A" />
                        <rect x="54" y="116" width="26" height="12" fill="#0F172A" />
                        <rect x="94" y="94" width="34" height="8" fill="#0F172A" />
                        <rect x="100" y="110" width="12" height="18" fill="#0F172A" />
                        <rect x="120" y="110" width="8" height="18" fill="#0F172A" />
                      </svg>
                    </div>

                    <div className="qr-instructions">
                      <h4>Scan with any UPI App</h4>
                      <p>Open Google Pay, PhonePe, Paytm or BHIM to pay instantly</p>
                      <div className="upi-brand-icons-row">
                        <span className="upi-app-tag gpay">Google Pay</span>
                        <span className="upi-app-tag phonepe">PhonePe</span>
                        <span className="upi-app-tag paytm">Paytm</span>
                        <span className="upi-app-tag bhim">BHIM</span>
                      </div>
                      <span className="qr-price-callout">Amount to pay: <strong>₹{finalPayable}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="upi-vpa-box">
                    <label className="payment-input-label">Enter your Virtual Payment Address (UPI ID)</label>
                    <div className="payment-input-wrapper">
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="e.g. mobileNumber@upi or user@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-quick-fill-upi"
                        onClick={() => setUpiId('cinego.customer@okhdfcbank')}
                      >
                        Auto Fill Test ID
                      </button>
                    </div>
                    <div className="upi-chips-row">
                      <span className="quick-upi-chip" onClick={() => setUpiId(upiId ? upiId.split('@')[0] + '@okaxis' : 'user@okaxis')}>@okaxis</span>
                      <span className="quick-upi-chip" onClick={() => setUpiId(upiId ? upiId.split('@')[0] + '@okhdfcbank' : 'user@okhdfcbank')}>@okhdfcbank</span>
                      <span className="quick-upi-chip" onClick={() => setUpiId(upiId ? upiId.split('@')[0] + '@ybl' : 'user@ybl')}>@ybl</span>
                      <span className="quick-upi-chip" onClick={() => setUpiId(upiId ? upiId.split('@')[0] + '@paytm' : 'user@paytm')}>@paytm</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= METHOD 2 & 3: CARDS ================= */}
            {(paymentMethod === 'debit' || paymentMethod === 'credit') && (
              <div className="card-payment-section">
                {/* Visual Virtual Card Preview */}
                <div className="visual-card-preview">
                  <div className="vcard-top">
                    <span className="vcard-bank">CINEGO SECURE PAY</span>
                    <span className="vcard-chip" />
                    <span className="vcard-type">{paymentMethod.toUpperCase()} CARD</span>
                  </div>
                  <div className="vcard-number">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="vcard-bottom">
                    <div className="vcard-holder">
                      <span className="vcard-label">CARD HOLDER</span>
                      <span className="vcard-val">{cardHolder || 'MOVIE FAN'}</span>
                    </div>
                    <div className="vcard-exp">
                      <span className="vcard-label">EXPIRES</span>
                      <span className="vcard-val">{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Inputs */}
                <div className="card-inputs-grid">
                  <div className="input-group span-2">
                    <label className="payment-input-label">Card Number</label>
                    <div className="payment-input-wrapper">
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="4532 •••• •••• ••••"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                      <button
                        type="button"
                        className="btn-quick-fill-upi"
                        onClick={() => {
                          setCardNumber('4532 8812 3456 7890');
                          setCardHolder('SURYA PRAKASH');
                          setCardExpiry('12/28');
                          setCardCvv('789');
                        }}
                      >
                        Use Test Card
                      </button>
                    </div>
                  </div>

                  <div className="input-group span-2">
                    <label className="payment-input-label">Cardholder Name</label>
                    <input
                      type="text"
                      className="payment-text-input"
                      placeholder="Name as printed on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="input-group">
                    <label className="payment-input-label">Expiry Date</label>
                    <input
                      type="text"
                      className="payment-text-input"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                  </div>

                  <div className="input-group">
                    <label className="payment-input-label">CVV / CVC</label>
                    <input
                      type="password"
                      className="payment-text-input"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="save-card-row">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                    />
                    <span>Securely save this card for faster future bookings</span>
                  </label>
                </div>
              </div>
            )}

            {/* ================= METHOD 4: NET BANKING ================= */}
            {paymentMethod === 'netbanking' && (
              <div className="netbanking-section">
                <label className="payment-input-label">Select Your Bank</label>
                <div className="popular-banks-grid">
                  {[
                    { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
                    { id: 'SBI', name: 'State Bank of India', code: 'SBI' },
                    { id: 'ICICI', name: 'ICICI Bank', code: 'ICICI' },
                    { id: 'AXIS', name: 'Axis Bank', code: 'AXIS' },
                    { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KOTAK' },
                    { id: 'PNB', name: 'Punjab National', code: 'PNB' }
                  ].map((bank) => (
                    <div
                      key={bank.id}
                      className={`bank-pill-card ${selectedBank === bank.id ? 'active' : ''}`}
                      onClick={() => setSelectedBank(bank.id)}
                    >
                      <Building size={18} />
                      <span>{bank.name}</span>
                    </div>
                  ))}
                </div>

                <div className="other-banks-select-wrap">
                  <label className="payment-input-label">Or choose another bank</label>
                  <select
                    className="payment-select-input"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="CANARA">Canara Bank</option>
                    <option value="INDUSIND">IndusInd Bank</option>
                    <option value="YES">Yes Bank</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="payment-error-banner">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Row: Pay Now Button & Test Controls */}
          <div className="payment-action-footer">
            <button
              type="button"
              className="btn-cinego-pay-now"
              disabled={isProcessing}
              onClick={() => handlePayNow(false)}
            >
              <Lock size={18} />
              <span>Pay Now ₹{finalPayable}</span>
              <ChevronRight size={18} />
            </button>

            {/* Test Mode Simulation Controls */}
            <div className="test-mode-controls">
              <span className="test-mode-tag">
                <Zap size={12} color="#F59E0B" /> TEST GATEWAY ACTIVE
              </span>
              <button
                type="button"
                className="btn-simulate-fail"
                onClick={() => handlePayNow(true)}
                disabled={isProcessing}
                title="Test how failure handling behaves"
              >
                Simulate Bank Failure
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Booking Summary Card */}
        <aside className="cinego-summary-card payment-summary-card">
          <div className="summary-header-row">
            <h3 className="summary-header-title">Booking Summary</h3>
          </div>

          <div className="payment-movie-preview">
            <div className="payment-movie-thumb">
              <img
                src={movie.poster_url || '/assets/posters/amaran.jpg'}
                alt={movieTitle}
                className="payment-thumb-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/posters/amaran.jpg';
                }}
              />
            </div>
            <div className="payment-movie-meta">
              <h4 className="payment-movie-title">{movieTitle}</h4>
              <p className="payment-theatre-text">{theatre}</p>
              <span className="payment-location-sub">{theatreLocation}</span>
              <span className="payment-show-badge">{showDate} · {showTime}</span>
            </div>
          </div>

          <div className="summary-details-list">
            <div className="summary-detail-row">
              <div className="detail-label-wrap">
                <span>Selected Seats ({seatLabels.length})</span>
              </div>
              <strong className="detail-value-text highlight-seats">
                {seatLabels.join(', ') || 'None'}
              </strong>
            </div>

            <div className="summary-detail-row">
              <div className="detail-label-wrap">
                <span>Ticket Subtotal</span>
              </div>
              <span className="detail-value-text">₹{ticketPrice}</span>
            </div>

            <div className="summary-detail-row">
              <div className="detail-label-wrap">
                <span>Convenience Fee (GST incl.)</span>
              </div>
              <span className="detail-value-text">₹{convenienceFee}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="summary-detail-row discount-row">
                <div className="detail-label-wrap">
                  <span>Promo Discount</span>
                </div>
                <span className="detail-value-text text-green">-₹{appliedDiscount}</span>
              </div>
            )}
          </div>

          <div className="summary-divider-line" />

          <div className="summary-total-row">
            <span className="summary-total-label">Total Amount</span>
            <span className="summary-total-value">₹{finalPayable}</span>
          </div>

          <div className="payment-guarantee-note">
            <ShieldCheck size={18} color="#10B981" />
            <span>100% Refundable up to 2 hours before showtime. Instant cancellation.</span>
          </div>
        </aside>
      </div>

      {/* ==========================================================================
          3. PAYMENT PROCESSING OVERLAY ANIMATION MODAL
          ========================================================================== */}
      {isProcessing && (
        <div className="payment-processing-modal-backdrop">
          <div className="payment-processing-card">
            {paymentStatus === 'processing' && (
              <>
                <div className="processing-spinner-ring">
                  <div className="spinner-core" />
                  <Lock size={28} className="spinner-lock-icon" />
                </div>
                <h3 className="processing-title">Contacting Bank Gateway...</h3>
                <p className="processing-subtitle">
                  Please do not refresh or press back while we securely authorize your transaction.
                </p>

                <div className="processing-steps-meter">
                  <div className={`step-item ${processingStep >= 1 ? 'done' : ''}`}>
                    <span className="dot" />
                    <span>Verifying {paymentMethod.toUpperCase()} Credentials</span>
                  </div>
                  <div className={`step-item ${processingStep >= 2 ? 'done' : ''}`}>
                    <span className="dot" />
                    <span>Authorizing ₹{finalPayable}</span>
                  </div>
                  <div className={`step-item ${processingStep >= 3 ? 'done' : ''}`}>
                    <span className="dot" />
                    <span>Generating Confirmed Ticket</span>
                  </div>
                </div>
              </>
            )}

            {paymentStatus === 'success' && (
              <div className="processing-success-view">
                <div className="success-check-bubble">
                  <CheckCircle size={52} color="#10B981" />
                </div>
                <h3 className="processing-title text-green">Payment Successful!</h3>
                <p className="processing-subtitle">
                  Transaction verified by gateway. Preparing your digital ticket pass...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
