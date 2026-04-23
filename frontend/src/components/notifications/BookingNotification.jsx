import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiX, FiCreditCard, FiCheckCircle, FiClock } from 'react-icons/fi';

/**
 * BookingToastNotification
 *
 * A standalone toast/snackbar system for booking status notifications.
 * Designed to match the dark zinc + amber aesthetic of the booking flow.
 *
 * HOW TO USE:
 * -----------
 * 1. Mount <BookingToastNotification /> once at the root of your app (or layout).
 * 2. Trigger toasts from anywhere using the exported `showBookingToast(payload)` helper.
 * 3. Hook it up to your real-time backend (Laravel Echo / Pusher / polling) — see the
 *    "REAL-TIME INTEGRATION" section at the bottom of this file.
 *
 * TOAST PAYLOAD:
 * --------------
 * showBookingToast({
 *   type:        'confirmed_awaiting_payment' | 'booking_confirmed_free' | 'booking_cancelled',
 *   title:       'Your booking was confirmed!',   // override default title (optional)
 *   message:     'Activity name · 120.00 MAD',    // override default message (optional)
 *   booking:     { id, amount, activity_id, ... }, // full booking object
 *   onPayNow:    (booking) => void,               // called when user clicks Pay Now
 * })
 *
 * EXAMPLE (from a bookings list page):
 * -------------------------------------
 * import { showBookingToast } from './BookingToastNotification';
 *
 * // After polling detects a booking moved to confirmed+unpaid:
 * showBookingToast({
 *   type: 'confirmed_awaiting_payment',
 *   booking: { id: 42, amount: 240, activity_id: 7 },
 *   onPayNow: (booking) => openPaymentModal(booking),
 * });
 */

// ─── Global event bus (no extra lib needed) ───────────────────────────────────
const TOAST_EVENT = 'booking:toast';

export function showBookingToast(payload) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: payload }));
}

// ─── Toast config per type ────────────────────────────────────────────────────
const TOAST_CONFIG = {
  confirmed_awaiting_payment: {
    icon:    FiCreditCard,
    accent:  '#f59e0b', // amber-500
    title:   'Booking Confirmed — Payment Required',
    message: 'The host approved your request. Complete payment to secure your spot.',
    cta:     'Pay Now',
    duration: 0, // stays until dismissed (payment action is important)
  },
  booking_confirmed_free: {
    icon:    FiCheckCircle,
    accent:  '#10b981', // emerald-500
    title:   'Booking Confirmed!',
    message: 'Your spot is reserved. See you there!',
    cta:     null,
    duration: 5000,
  },
  booking_cancelled: {
    icon:    FiX,
    accent:  '#ef4444', // red-500
    title:   'Booking Cancelled',
    message: 'Your booking has been cancelled.',
    cta:     null,
    duration: 5000,
  },
};

// ─── Single Toast Card ────────────────────────────────────────────────────────
const ToastCard = ({ toast, onDismiss }) => {
  const config   = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.booking_confirmed_free;
  const Icon     = config.icon;
  const title    = toast.title   ?? config.title;
  const message  = toast.message ?? config.message;
  const accent   = config.accent;
  const timerRef = useRef(null);

  // Progress bar state
  const [progress, setProgress] = useState(100);
  const duration = config.duration;

  useEffect(() => {
    if (!duration) return; // 0 = stays until manually dismissed
    const start    = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct     = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct === 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [duration, toast.id, onDismiss]);

  return (
    <div
      style={{ '--accent': accent }}
      className="toast-card"
    >
      {/* Left accent bar */}
      <div className="toast-bar" style={{ background: accent }} />

      {/* Icon */}
      <div className="toast-icon-wrap" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon size={16} style={{ color: accent }} />
      </div>

      {/* Content */}
      <div className="toast-content">
        <p className="toast-title">{title}</p>
        <p className="toast-message">{message}</p>

        {config.cta && toast.onPayNow && (
          <button
            className="toast-cta"
            style={{ background: accent, color: '#000' }}
            onClick={() => {
              toast.onPayNow(toast.booking);
              onDismiss(toast.id);
            }}
          >
            <FiCreditCard size={11} />
            {config.cta}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button className="toast-dismiss" onClick={() => onDismiss(toast.id)}>
        <FiX size={13} />
      </button>

      {/* Progress bar (only when auto-dismissing) */}
      {duration > 0 && (
        <div className="toast-progress-track">
          <div
            className="toast-progress-fill"
            style={{ width: `${progress}%`, background: accent }}
          />
        </div>
      )}

      <style>{`
        .toast-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 360px;
          max-width: calc(100vw - 32px);
          background: #111111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 14px 14px 14px 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          overflow: hidden;
          animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .toast-card.leaving {
          animation: toastSlideOut 0.25s ease-in both;
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0);   opacity: 1; max-height: 200px; margin-bottom: 10px; }
          to   { transform: translateX(110%); opacity: 0; max-height: 0;    margin-bottom: 0;  }
        }
        .toast-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 16px 0 0 16px;
        }
        .toast-icon-wrap {
          flex-shrink: 0;
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .toast-content {
          flex: 1;
          min-width: 0;
        }
        .toast-title {
          font-size: 12px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.01em;
          margin: 0 0 3px;
          font-family: 'DM Sans', sans-serif;
        }
        .toast-message {
          font-size: 11px;
          color: #71717a;
          margin: 0 0 10px;
          line-height: 1.5;
          font-family: 'DM Sans', sans-serif;
        }
        .toast-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.15s, transform 0.15s;
        }
        .toast-cta:hover  { opacity: 0.85; }
        .toast-cta:active { transform: scale(0.96); }
        .toast-dismiss {
          flex-shrink: 0;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          border: none;
          color: #52525b;
          cursor: pointer;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          margin-top: -2px;
        }
        .toast-dismiss:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .toast-progress-track {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: rgba(255,255,255,0.05);
        }
        .toast-progress-fill {
          height: 100%;
          border-radius: 0 0 0 16px;
          transition: width 0.03s linear;
        }
      `}</style>
    </div>
  );
};

// ─── Toast Container (mount once at root) ────────────────────────────────────
let _toastId = 0;

const BookingToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const payload = e.detail;
      setToasts(prev => [
        ...prev,
        { ...payload, id: ++_toastId },
      ]);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <>
      <div style={{
        position:      'fixed',
        bottom:        '24px',
        right:         '24px',
        zIndex:        9999,
        display:       'flex',
        flexDirection: 'column',
        gap:           '10px',
        alignItems:    'flex-end',
      }}>
        {toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
};

export default BookingToastNotification;


/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * REAL-TIME INTEGRATION — hook this up when you're ready
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * OPTION A: Laravel Echo + Pusher (recommended)
 * ─────────────────────────────────────────────
 * In your app root or layout component:
 *
 *   import Echo from 'laravel-echo';
 *   import { showBookingToast } from './BookingToastNotification';
 *
 *   useEffect(() => {
 *     const userId = getCurrentUserId(); // from auth context
 *
 *     window.Echo.private(`App.Models.User.${userId}`)
 *       .notification((notification) => {
 *         if (notification.type === 'BookingConfirmedNotification') {
 *           showBookingToast({
 *             type:     'confirmed_awaiting_payment',
 *             message:  `${notification.activity_title} · ${notification.amount} MAD`,
 *             booking:  notification.booking,
 *             onPayNow: (booking) => openPaymentModal(booking), // your handler
 *           });
 *         }
 *       });
 *
 *     return () => window.Echo.leave(`App.Models.User.${userId}`);
 *   }, []);
 *
 *
 * OPTION B: Polling (no websockets needed)
 * ─────────────────────────────────────────
 * Add this hook in your bookings list page:
 *
 *   import { showBookingToast } from './BookingToastNotification';
 *
 *   useEffect(() => {
 *     const seenIds = new Set(bookings.map(b => b.id + ':' + b.status));
 *
 *     const interval = setInterval(async () => {
 *       const fresh = await fetchMyBookings(); // your API call
 *
 *       fresh.forEach(booking => {
 *         const key = `${booking.id}:${booking.status}`;
 *         if (!seenIds.has(key)) {
 *           seenIds.add(key);
 *
 *           if (booking.status === 'confirmed' && booking.payment_status === 'unpaid') {
 *             showBookingToast({
 *               type:     'confirmed_awaiting_payment',
 *               message:  `${booking.activity?.title} · ${booking.amount} MAD`,
 *               booking,
 *               onPayNow: (b) => openPaymentModal(b),
 *             });
 *           }
 *         }
 *       });
 *
 *       setBookings(fresh);
 *     }, 15000); // poll every 15 seconds
 *
 *     return () => clearInterval(interval);
 *   }, []);
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */