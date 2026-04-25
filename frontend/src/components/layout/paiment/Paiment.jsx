import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FiClock, FiX } from 'react-icons/fi';

import StripeCardForm from './StripeCardForm';
import SuccessScreen from './SuccessScreen';
import BookingForm from './BookingForm';

const COPY = {
  booking: {
    stepTitles: {
      form: 'Request Booking',
      payment: 'Secure Payment',
      pending: 'Awaiting Confirmation',
      success: null,
    },
    pendingTitle: 'Request Sent!',
    pendingMessage: "Your booking request is waiting for the host to confirm. You'll receive a notification and can complete payment once they approve.",
    pendingAmountLabel: 'Amount due on confirm',
  },
  reservation: {
    stepTitles: {
      form: 'Request Reservation',
      payment: 'Secure Reservation Payment',
      pending: 'Awaiting Approval',
      success: null,
    },
    pendingTitle: 'Reservation Requested!',
    pendingMessage: "Your reservation is waiting for the business owner to approve it. Once they accept, you'll be able to pay with Stripe and lock it in.",
    pendingAmountLabel: 'Amount due after approval',
  },
};

export const Paiment = ({
  isOpen,
  onClose,
  onSuccess,
  activityId,
  activityPrice = 0,
  isFree = false,
  booking = null,
  preConfirmedBooking = null,
  recordType = 'booking',
}) => {
  const copy = COPY[recordType] ?? COPY.booking;
  const activeRecord = preConfirmedBooking ?? booking;
  const initialStep = activeRecord ? 'payment' : 'form';

  const [step, setStep] = useState(initialStep);
  const [currentRecord, setCurrentRecord] = useState(activeRecord);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    if (isOpen) {
      setStep(activeRecord ? 'payment' : 'form');
      setCurrentRecord(activeRecord ?? null);
    }
  }, [isOpen, activeRecord]);

  if (!isOpen) return null;

  const handleRecordCreated = (newRecord) => {
    setCurrentRecord(newRecord);

    if (newRecord.status === 'confirmed') {
      setStep('success');
    } else {
      setStep('pending');
    }
  };

  const handlePaymentSuccess = (paidRecord) => {
    setCurrentRecord(paidRecord);
    setStep('success');
    onSuccess?.(paidRecord);
  };

  const isSuccessStep = step === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full ${isSuccessStep ? 'max-w-sm' : 'max-w-md'} bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300`}>
        {!isSuccessStep && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-black text-white uppercase tracking-wider italic">
              {copy.stepTitles[step]}
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
          {step === 'form' && recordType === 'booking' && (
            <BookingForm
              activityId={activityId}
              activityPrice={activityPrice}
              isFree={isFree}
              onBookingCreated={handleRecordCreated}
              onClose={onClose}
            />
          )}

          {step === 'form' && recordType !== 'booking' && (
            <div className="py-8 text-center text-sm text-zinc-400">
              This payment flow starts after the reservation is approved.
            </div>
          )}

          {step === 'pending' && (
            <PendingScreen
              booking={currentRecord}
              copy={copy}
              onClose={onClose}
            />
          )}

          {step === 'payment' && currentRecord && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                booking={currentRecord}
                recordType={recordType}
                onSuccess={handlePaymentSuccess}
                onClose={onClose}
              />
            </Elements>
          )}

          {step === 'success' && (
            <SuccessScreen
              resourceType={recordType}
              isFree={isFree || currentRecord?.amount === 0}
              status={currentRecord?.status}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PendingScreen = ({ booking, copy, onClose }) => (
  <div className="flex flex-col items-center gap-5 py-8 text-center">
    <div className="relative w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
      <FiClock size={28} className="text-amber-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>

    <div>
      <h3 className="text-lg font-black text-white mb-1">{copy.pendingTitle}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
        {copy.pendingMessage}
      </p>
    </div>

    {booking?.amount > 0 && (
      <div className="flex items-center justify-between w-full px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{copy.pendingAmountLabel}</span>
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
