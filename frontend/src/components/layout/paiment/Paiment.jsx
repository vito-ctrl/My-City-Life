import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FiX, FiClock } from 'react-icons/fi';

import StripeCardForm from './StripeCardForm';
import SuccessScreen  from './SuccessScreen';
import BookingForm    from './BookingForm';

const STEP_TITLES = {
  form:    'Request Booking',
  payment: 'Secure Payment',
  pending: 'Awaiting Confirmation',
  success: null,
};

/**
 * Paiment — orchestrates the full booking + payment flow.
 *
 * FLOWS:
 *  1. Normal (isFree=false):
 *     form → [booking created, status=pending] → pending screen
 *     Later, owner confirms → user gets toast → opens modal with preConfirmedBooking
 *     preConfirmedBooking → payment → success
 *
 *  2. Free activity:
 *     form → [booking created, status=confirmed] → success
 *
 *  3. Owner just confirmed, user pays from notification / bookings list:
 *     Pass preConfirmedBooking prop → jumps straight to payment step
 */
export const Paiment = ({
  isOpen,
  onClose,
  activityId,
  activityPrice = 0,
  isFree        = false,
  preConfirmedBooking = null, // set this when opening from "Pay Now" (confirmed+unpaid booking)
}) => {
  const initialStep = preConfirmedBooking ? 'payment' : 'form';

  const [step,    setStep]    = useState(initialStep);
  const [booking, setBooking] = useState(preConfirmedBooking);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  // Reset whenever the modal opens or a pre-confirmed booking is supplied
  useEffect(() => {
    if (isOpen) {
      setStep(preConfirmedBooking ? 'payment' : 'form');
      setBooking(preConfirmedBooking ?? null);
    }
  }, [isOpen, preConfirmedBooking]);

  if (!isOpen) return null;

  /**
   * Called by BookingForm after the API returns a new booking.
   *  - Free activity  → status='confirmed'  → go to success
   *  - Paid activity  → status='pending'    → go to pending screen (wait for owner)
   */
  const handleBookingCreated = (newBooking) => {
    setBooking(newBooking);
    if (newBooking.status === 'confirmed') {
      setStep('success'); // free or auto-confirmed
    } else {
      setStep('pending'); // paid, waiting for owner approval
    }
  };

  const isSuccessStep = step === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full ${isSuccessStep ? 'max-w-sm' : 'max-w-md'} bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300`}>

        {/* Header */}
        {!isSuccessStep && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-black text-white uppercase tracking-wider italic">
              {STEP_TITLES[step]}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        <div className="p-6">

          {/* ── Step: booking form ── */}
          {step === 'form' && (
            <BookingForm
              activityId={activityId}
              activityPrice={activityPrice}
              isFree={isFree}
              onBookingCreated={handleBookingCreated}
              onClose={onClose}
            />
          )}

          {/* ── Step: pending (waiting for host to confirm) ── */}
          {step === 'pending' && (
            <PendingScreen
              booking={booking}
              onClose={onClose}
            />
          )}

          {/* ── Step: Stripe payment (only after host confirms) ── */}
          {step === 'payment' && booking && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                booking={booking}
                onSuccess={() => setStep('success')}
                onClose={onClose}
              />
            </Elements>
          )}

          {/* ── Step: success ── */}
          {step === 'success' && (
            <SuccessScreen
              isFree={isFree || booking?.amount === 0}
              status={booking?.status}
              onClose={onClose}
            />
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Pending Screen ───────────────────────────────────────────────────────────
const PendingScreen = ({ booking, onClose }) => (
  <div className="flex flex-col items-center gap-5 py-8 text-center">
    {/* Animated clock icon */}
    <div className="relative w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
      <FiClock size={28} className="text-amber-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>

    <div>
      <h3 className="text-lg font-black text-white mb-1">Request Sent!</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
        Your booking request is waiting for the host to confirm.
        You'll receive a notification and can complete payment once they approve.
      </p>
    </div>

    {/* Amount reminder */}
    {booking?.amount > 0 && (
      <div className="flex items-center justify-between w-full px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Amount due on confirm</span>
        <span className="text-base font-black text-white">
          {Number(booking.amount).toFixed(2)}
          <span className="text-sm text-zinc-400 font-bold ml-1">MAD</span>
        </span>
      </div>
    )}

    <button
      onClick={onClose}
      className="px-8 py-3 bg-zinc-800 text-white font-black text-sm rounded-xl hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-700"
    >
      Got it
    </button>
  </div>
);

export default Paiment;