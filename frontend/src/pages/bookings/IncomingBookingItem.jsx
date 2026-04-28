import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import {
  FiActivity,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
import Paiment from '../../components/layout/paiment/Paiment';
import { GetMyReservations } from '../../services/reservation/reservation';

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  paid: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
};

const IncomingBookingItem = ({ booking, isProcessing, onConfirm, onCancel }) => {
  return (
    <div className="group bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-6">

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              {booking.activity?.category || 'Incoming Booking'}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status] || statusColors.pending}`}>
              {booking.status}
            </span>
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
            {booking.activity?.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><FiUsers /> {booking.user?.name || 'Guest'}</span>
            <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(booking.booking_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><FiUsers /> {booking.number_of_guests} Guests</span>
            <span className="flex items-center gap-1.5"><FiCreditCard /> {booking.amount} MAD</span>
          </div>
        </div>

        <div className="md:border-l border-white/5 md:pl-8 flex items-center">
          <div className="flex flex-wrap gap-3">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <FiCheckCircle /> {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <FiXCircle /> Cancel
                </button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <FiXCircle /> Cancel Booking
              </button>
            )}

            {booking.status === 'cancelled' && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                <FiXCircle /> Booking Cancelled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingBookingItem;