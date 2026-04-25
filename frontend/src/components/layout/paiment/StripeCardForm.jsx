import React, { useEffect, useState } from 'react';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { FiCreditCard, FiLock } from 'react-icons/fi';

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

const StripeCardForm = ({ booking, onSuccess, onClose, recordType = 'booking' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const endpointBase = recordType === 'reservation' ? 'reservations' : 'bookings';
  const resourceLabel = recordType === 'reservation' ? 'reservation' : 'booking';

  const [clientSecret, setClientSecret] = useState(null);
  const [cardError, setCardError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingIntent, setLoadingIntent] = useState(true);

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://127.0.0.1:8000/api/${endpointBase}/${booking.id}/payment-intent`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const data = await res.json();

        if (res.ok) {
          setClientSecret(data.client_secret);
        } else {
          setCardError(data.error ?? `Could not initiate ${resourceLabel} payment. Please try again.`);
        }
      } catch {
        setCardError('Network error while loading payment form.');
      } finally {
        setLoadingIntent(false);
      }
    };

    fetchIntent();
  }, [booking.id, endpointBase, resourceLabel]);

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
      setCardError(error.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://127.0.0.1:8000/api/${endpointBase}/${booking.id}/payment-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setCardError(data.error ?? `Payment succeeded, but ${resourceLabel} sync failed.`);
          setIsProcessing(false);
          return;
        }

        onSuccess(data[resourceLabel] ?? data.booking ?? data.reservation ?? booking);
      } catch {
        setCardError(`Payment succeeded, but we could not sync the ${resourceLabel}. Please refresh and check again.`);
        setIsProcessing(false);
      }
    }
  };

  const inputWrap = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-amber-500 transition-colors';

  if (loadingIntent) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Preparing payment...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Amount due</span>
        <span className="text-lg font-black text-white">
          {Number(booking.amount).toFixed(2)}
          <span className="text-sm text-zinc-400 font-bold ml-1">MAD</span>
        </span>
      </div>

      <div>
        <label className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
          <FiCreditCard size={11} className="text-amber-500" /> Card Number
        </label>
        <div className={inputWrap}>
          <CardNumberElement options={{ style: STRIPE_STYLE, showIcon: true }} />
        </div>
      </div>

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

      <p className="text-[10px] text-zinc-600 font-bold text-center">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>

      {cardError && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {cardError}
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
        <FiLock size={10} />
        Secured by Stripe - your card data never touches our server
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

export default StripeCardForm;
