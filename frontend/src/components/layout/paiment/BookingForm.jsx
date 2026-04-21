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
      console.log("booking : ", data); 

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

