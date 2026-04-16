import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import useOrganizerData from '../../hooks/useOrganizerData';
import { CheckCircle, XCircle, Clock, Users, Filter } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

// ── Helper: Status Badge ──────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-green-500/10  text-green-400  border-green-500/20',
    cancelled: 'bg-red-500/10    text-red-400    border-red-500/20',
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${map[status] ?? 'bg-white/5 text-white/30 border-white/10'}`}>
      {status}
    </span>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const OrganizerBookings = () => {
  const { allBookings, loading, error, refetch } = useOrganizerData();

  // Filter state — which status tab is active
  const [activeFilter, setActiveFilter] = useState('all');

  // Action feedback (e.g. "Booking #5 confirmed!")
  const [actionMsg, setActionMsg] = useState(null);

  const token = localStorage.getItem('token');

  /**
   * confirmBooking
   * Calls PATCH /api/bookings/{id}/confirm on the backend.
   * After success, reloads the list with refetch().
   */
  const confirmBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✓ Booking #${bookingId} confirmed!`);
        refetch(); // reload the list
      } else {
        setActionMsg(`✗ ${data.error ?? 'Could not confirm booking.'}`);
      }
    } catch {
      setActionMsg('✗ Network error. Please try again.');
    }
    // Clear message after 3 seconds
    setTimeout(() => setActionMsg(null), 3000);
  };

  /**
   * cancelBooking
   * Calls PATCH /api/bookings/{id}/cancel on the backend.
   */
  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✓ Booking #${bookingId} cancelled.`);
        refetch();
      } else {
        setActionMsg(`✗ ${data.error ?? 'Could not cancel booking.'}`);
      }
    } catch {
      setActionMsg('✗ Network error. Please try again.');
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Apply the active filter before rendering the list
  const filteredBookings = activeFilter === 'all'
    ? allBookings
    : allBookings.filter(b => b.status === activeFilter);

  const FILTERS = ['all', 'pending', 'confirmed', 'cancelled'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="relative">

        {/* Background glow */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

          {/* ── Header ── */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-orange-500 rounded-full" />
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">
                Incoming <span className="text-orange-500">Bookings</span>
              </h1>
            </div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] ml-5">
              Manage your reservations
            </p>
          </header>

          {/* ── Action Feedback Toast ── */}
          {actionMsg && (
            <div className={`mb-6 px-5 py-3 rounded-2xl text-sm font-bold border ${actionMsg.startsWith('✓') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {actionMsg}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── Filter Tabs ── */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Filter size={14} className="text-white/20 mr-1" />
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeFilter === filter
                    ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
            <span className="ml-auto text-white/20 text-[10px] font-black uppercase tracking-widest">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Bookings List ── */}
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-[28px] animate-pulse h-24" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
              <Clock size={36} className="mx-auto mb-4 text-white/10" />
              <p className="text-white/20 font-bold uppercase tracking-widest">No bookings found</p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-3 text-orange-400/60 text-xs hover:text-orange-400 transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className="group bg-white/[0.02] border border-white/5 p-5 rounded-[28px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.04] hover:border-orange-500/15 transition-all duration-300"
                >
                  {/* ── Left info ── */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">
                      {booking.activity?.category ?? 'Activity'}
                    </span>
                    <h3 className="font-black uppercase italic text-base group-hover:text-orange-400 transition-colors truncate">
                      {booking.activity?.title ?? '—'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Users size={10} className="text-orange-500" />
                        {booking.user?.name ?? '—'}
                      </span>
                      <span>{booking.number_of_guests} guest{booking.number_of_guests !== 1 ? 's' : ''}</span>
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                        {booking.amount} MAD
                      </span>
                      <span className="text-white/15">#{booking.id}</span>
                    </div>
                  </div>

                  {/* ── Right: status + action buttons ── */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={booking.status} />

                    {/* Only show action buttons for pending bookings */}
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => confirmBooking(booking.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                        >
                          <CheckCircle size={13} />
                          Confirm
                        </button>
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                          <XCircle size={13} />
                          Cancel
                        </button>
                      </>
                    )}

                    {/* For confirmed bookings, only show cancel */}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                      >
                        <XCircle size={13} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerBookings;
