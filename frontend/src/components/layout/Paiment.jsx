/**
 * Paiment.jsx  —  Booking + Stripe payment modal
 *
 * Flow:
 *   Step 1 — FORM      User fills booking date, guests, group toggle
 *   Step 2 — PAYMENT   For paid activities: Stripe card form (client_secret from backend)
 *                       For free activities: skipped, jump straight to Step 3
 *   Step 3 — SUCCESS   Confirmation screen
 *
 * Backend endpoints consumed:
 *   POST  /api/bookings                       → create booking, returns { id, amount, status }
 *   POST  /api/bookings/{id}/payment-intent   → returns { client_secret }
 *
 * Install once in your project:
 *   npm install @stripe/react-stripe-js @stripe/stripe-js
 *
 * Add your publishable key to .env:
 *   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { FiShield, FiX, FiCheck, FiLock, FiUsers, FiCalendar, FiCreditCard } from 'react-icons/fi';


// Load Stripe outside component to avoid re-instantiation on renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── Stripe element shared style ───────────────────────────────────────────────
const STRIPE_STYLE = {
  base: {
    color: '#e4e4e7',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontSmoothing: 'antialiased',
    '::placeholder': { color: '#52525b' },
  },
  invalid: { color: '#f87171' },
};

// ── Step 1: Booking form ──────────────────────────────────────────────────────
const BookingForm = ({ activityId, activityPrice, isFree, onBookingCreated, onClose }) => {
  const [bookingDate, setBookingDate]       = useState('');
  const [guests, setGuests]                 = useState(1);
  const [isOpenToGroup, setIsOpenToGroup]   = useState(false);
  const [error, setError]                   = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const totalAmount = isFree ? 0 : activityPrice * guests;

  const handleSubmit = async () => {
    if (!bookingDate) { setError('Please select a date and time.'); return; }
    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('You must be logged in to book.'); return; }

      const res  = await fetch(`http://127.0.0.1:8000/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Accept':        'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity_id:       activityId,
          booking_date:      bookingDate,
          number_of_guests:  guests,
          is_open_to_group:  isOpenToGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create booking. Please try again.');
        return;
      }

      // Pass booking to parent — it decides what comes next
      onBookingCreated(data);

    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Date & Time */}
      <div>
        <label className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
          <FiCalendar size={11} className="text-amber-500" /> Date & Time
        </label>
        <input
          type="datetime-local"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
          value={bookingDate}
          onChange={e => setBookingDate(e.target.value)}
        />
      </div>

      {/* Guests */}
      <div>
        <label className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
          <FiUsers size={11} className="text-amber-500" /> Number of Guests
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold hover:border-zinc-600 transition-colors"
          >
            −
          </button>
          <span className="flex-1 text-center text-lg font-black text-white">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests(g => g + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold hover:border-zinc-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Group toggle */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shared Booking</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Allow others to join and chat with you.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenToGroup(v => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isOpenToGroup ? 'bg-amber-500' : 'bg-zinc-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isOpenToGroup ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Price summary */}
      {!isFree && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Total</span>
          <span className="text-lg font-black text-white">
            {totalAmount.toFixed(2)}
            <span className="text-sm text-zinc-400 font-bold ml-1">MAD</span>
          </span>
        </div>
      )}

      {isFree && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <FiCheck size={13} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">This activity is free</span>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50 active:scale-95 transition-all"
        >
          {isSubmitting ? 'Creating booking...' : isFree ? 'Confirm Booking' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );
};

// ── Step 2: Stripe card form (inner — must be inside <Elements>) ───────────────
const StripeCardForm = ({ booking, onSuccess, onClose }) => {
  const stripe   = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret]   = useState(null);
  const [cardError, setCardError]         = useState('');
  const [isProcessing, setIsProcessing]   = useState(false);
  const [loadingIntent, setLoadingIntent] = useState(true);

  // Fetch payment intent as soon as this step mounts
  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`http://127.0.0.1:8000/api/bookings/${booking.id}/payment-intent`, {
          method:  'POST',
          headers: { 
            'Authorization' : `Bearer ${token}`, 
            'Accept' : 'application/json' },
        });
        const data = await res.json();
        if (res.ok) {
          setClientSecret(data.client_secret);
        } else {
          setCardError(data.error ?? 'Could not initiate payment. Please try again.');
        }
      } catch {
        setCardError('Network error while loading payment form.');
      } finally {
        setLoadingIntent(false);
      }
    };
    fetchIntent();
  }, [booking.id]);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setCardError('');
    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
      },
    });

    if (error) {
      // Stripe gives user-facing messages in error.message
      setCardError(error.message);
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Webhook will handle the booking status update server-side
      onSuccess();
    }
  };

  const inputWrap = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-amber-500 transition-colors';

  if (loadingIntent) return (
    <div className="flex flex-col items-center gap-3 py-10">
      <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Preparing payment...</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Order summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Amount due</span>
        <span className="text-lg font-black text-white">
          {Number(booking.amount).toFixed(2)}
          <span className="text-sm text-zinc-400 font-bold ml-1">MAD</span>
        </span>
      </div>

      {/* Card number */}
      <div>
        <label className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
          <FiCreditCard size={11} className="text-amber-500" /> Card Number
        </label>
        <div className={inputWrap}>
          <CardNumberElement options={{ style: STRIPE_STYLE, showIcon: true }} />
        </div>
      </div>

      {/* Expiry + CVC side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Expiry</label>
          <div className={inputWrap}>
            <CardExpiryElement options={{ style: STRIPE_STYLE }} />
          </div>
        </div>
        <div>
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">CVC</label>
          <div className={inputWrap}>
            <CardCvcElement options={{ style: STRIPE_STYLE }} />
          </div>
        </div>
      </div>

      {/* Test card hint (remove in production) */}
      <p className="text-[10px] text-zinc-600 font-bold text-center">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>

      {cardError && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {cardError}
        </p>
      )}

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
        <FiLock size={10} />
        Secured by Stripe — your card data never touches our server
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={!stripe || !clientSecret || isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50 active:scale-95 transition-all"
        >
          <FiLock size={13} />
          {isProcessing ? 'Processing payment...' : `Pay ${Number(booking.amount).toFixed(2)} MAD`}
        </button>
      </div>
    </div>
  );
};

// ── Step 3: Success screen ────────────────────────────────────────────────────
const SuccessScreen = ({ isFree, onClose }) => (
  <div className="flex flex-col items-center gap-5 py-8 text-center">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
      <FiCheck size={28} className="text-emerald-400" />
    </div>
    <div>
      <h3 className="text-lg font-black text-white mb-1">Booking Confirmed!</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">
        {isFree
          ? 'Your spot is reserved. See you there!'
          : 'Payment received. Your booking is confirmed and the organizer has been notified.'}
      </p>
    </div>
    <button
      onClick={onClose}
      className="px-8 py-3 bg-amber-500 text-black font-black text-sm rounded-xl hover:bg-amber-400 transition-all active:scale-95"
    >
      Done
    </button>
  </div>
);

// ── Root modal ────────────────────────────────────────────────────────────────
const STEP_TITLES = {
  form:    'Book Activity',
  payment: 'Secure Payment',
  success: null,
};

const Paiment = ({ isOpen, onClose, activityId, activityPrice = 0, isFree = false }) => {
  const [step, setStep]       = useState('form');     // 'form' | 'payment' | 'success'
  const [booking, setBooking] = useState(null);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) { setStep('form'); setBooking(null); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBookingCreated = (newBooking) => {
    setBooking(newBooking);
    // Free activities are auto-confirmed by the backend — skip payment
    if (isFree || newBooking.amount === 0) {
      setStep('success');
    } else {
      setStep('payment');
    }
  };

  const handleClose = () => {
    setStep('form');
    setBooking(null);
    onClose();
  };

  const title = STEP_TITLES[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Modal header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-black text-white">{title}</h3>
              {/* Step indicator for multi-step */}
              {!isFree && step !== 'success' && (
                <div className="flex items-center gap-2 mt-1.5">
                  {['form', 'payment'].map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                        step === s
                          ? 'bg-amber-500 border-amber-500 text-black'
                          : i < ['form','payment'].indexOf(step)
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                      }`}>
                        {i < ['form','payment'].indexOf(step) ? '✓' : i + 1}
                      </div>
                      {i < 1 && <div className={`w-6 h-px ${step === 'payment' ? 'bg-amber-500/40' : 'bg-zinc-700'}`} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Modal body */}
        <div className="p-6">
          {step === 'form' && (
            <BookingForm
              activityId={activityId}
              activityPrice={activityPrice}
              isFree={isFree}
              onBookingCreated={handleBookingCreated}
              onClose={handleClose}
            />
          )}

          {step === 'payment' && booking && (
            // Elements must wrap StripeCardForm so useStripe/useElements work
            <Elements stripe={stripePromise}>
              <StripeCardForm
                booking={booking}
                onSuccess={() => setStep('success')}
                onClose={handleClose}
              />
            </Elements>
          )}

          {step === 'success' && (
            <SuccessScreen isFree={isFree || booking?.amount === 0} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Paiment;