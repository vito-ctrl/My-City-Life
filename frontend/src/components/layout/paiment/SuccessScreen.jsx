import React from 'react';
import { FiCheck } from 'react-icons/fi';

/**
 * SuccessScreen — shown after:
 *  - Free booking confirmed immediately
 *  - Paid booking: payment succeeded
 *
 * Props:
 *  isFree  — true if no payment was needed
 *  status  — booking status from the server (informational)
 *  onClose — dismiss callback
 */
const SuccessScreen = ({ isFree, status, onClose }) => (
  <div className="flex flex-col items-center gap-5 py-8 text-center">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
      <FiCheck size={28} className="text-emerald-400" />
    </div>

    <div>
      <h3 className="text-lg font-black text-white mb-1">Booking Confirmed!</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
        {isFree
          ? 'Your spot is reserved. See you there!'
          : 'Payment received. Your booking is confirmed and the host has been notified.'}
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

export default SuccessScreen;