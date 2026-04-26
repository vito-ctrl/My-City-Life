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

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  paid: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
};

const BookingItem = ({ booking, onPay }) => {
  const currentStatus = booking.payment_status === 'paid' ? 'paid' : booking.status;

  return (
    <div className="group bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* <div className="w-full md:w-40 h-28 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl flex items-center justify-center border border-white/5">
          <FiActivity size={32} className="text-orange-500/40" />
        </div> */}

        <div className="flex-1 space-y-0.5">
          <div className="flex gap-5">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              {booking.activity?.category || 'Activity'}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColors[currentStatus]}`}>
              {currentStatus}
            </span>
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
            {booking.activity?.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(booking.booking_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><FiUsers /> {booking.number_of_guests} Guests</span>
            <span className="flex items-center gap-1.5"><FiCreditCard /> {booking.amount} MAD</span>
          </div>
        </div>

        <div className="md:border-l border-white/5 md:pl-8 flex items-center">
          {booking.status === 'confirmed' && booking.payment_status === 'unpaid' && (
            <button
              onClick={onPay}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-400 active:scale-95 transition-all"
            >
              <FiCreditCard /> Pay Now <FiArrowRight />
            </button>
          )}
          {booking.payment_status === 'paid' && (
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <FiCheckCircle /> Payment Completed
            </div>
          )}
          {booking.status === 'pending' && (
            <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
              <FiClock /> Waiting for confirmation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingItem;