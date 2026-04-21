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