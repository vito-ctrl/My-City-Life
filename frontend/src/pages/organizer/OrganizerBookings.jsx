import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import useOrganizerData from '../../hooks/useOrganizerData';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Filter,
  AlertCircle,
  Calendar,
  CreditCard,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
    confirmed: { cls: 'bg-green-500/10  text-green-400  border-green-500/20',  icon: CheckCircle2 },
    cancelled: { cls: 'bg-red-500/10    text-red-400    border-red-500/20',    icon: XCircle },
  };
  const entry = map[status];
  const Icon  = entry?.icon ?? AlertCircle;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${entry?.cls ?? 'bg-white/5 text-white/30 border-white/10'}`}>
      <Icon size={10} />
      {status}
    </span>
  );
};

// Format ISO date to a readable string
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return null;
  }
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => {
  if (!msg) return null;
  const isSuccess = msg.startsWith('✓');
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold border flex items-center gap-3 shadow-2xl transition-all ${
      isSuccess
        ? 'bg-[#0a0a0a] border-green-500/30 text-green-400'
        : 'bg-[#0a0a0a] border-red-500/30 text-red-400'
    }`}>
      {isSuccess ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
      {msg.replace(/^[✓✗]\s*/, '')}
    </div>
  );
};

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onConfirm, onCancel }) => {
  const date = formatDate(booking.created_at ?? booking.booking_date);

  return (
    <div className="group bg-white/[0.02] border border-white/5 rounded-[24px] hover:bg-white/[0.035] hover:border-white/10 transition-all duration-200 overflow-hidden">
      {/* Top stripe for pending */}
      {booking.status === 'pending' && (
        <div className="h-0.5 bg-gradient-to-r from-yellow-500/40 via-orange-500/30 to-transparent" />
      )}

      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* ── Left block ── */}
        <div className="flex-1 min-w-0">
          {/* Category chip */}
          <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.25em] mb-1.5 block">
            {booking.activity?.category ?? 'Activity'}
          </span>

          {/* Title */}
          <h3 className="font-black uppercase italic text-sm leading-tight group-hover:text-orange-400 transition-colors truncate mb-2">
            {booking.activity?.title ?? '—'}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/30 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Users size={9} className="text-orange-500/60" />
              {booking.user?.name ?? '—'}
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1">
              <Users size={9} />
              {booking.number_of_guests} guest{booking.number_of_guests !== 1 ? 's' : ''}
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1">
              <CreditCard size={9} />
              {booking.amount} MAD
            </span>
            {date && (
              <>
                <span className="text-white/10">·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={9} />
                  {date}
                </span>
              </>
            )}
            <span className="text-white/15 ml-0.5">#{booking.id}</span>
          </div>
        </div>

        {/* ── Right block: status + actions ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={booking.status} />

          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onConfirm(booking.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 active:scale-95 transition-all"
              >
                <CheckCircle2 size={11} />
                Confirm
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 active:scale-95 transition-all"
              >
                <XCircle size={11} />
                Decline
              </button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 active:scale-95 transition-all"
            >
              <XCircle size={11} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const OrganizerBookings = () => {

  const API_BASE = 'http://127.0.0.1:8000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const { allBookings, loading, error, refetch } = useOrganizerData();
const [activeFilter, setActiveFilter] = useState('all');
const [busyIds, setBusyIds] = useState(new Set());


  const [sortBy, setSortBy]             = useState('newest');
  const [toastMsg, setToastMsg]         = useState(null);

  const token = localStorage.getItem('token');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const patchBooking = async (bookingId, action) => {
    if (busyIds.has(bookingId)) return;
    setBusyIds(prev => new Set(prev).add(bookingId));
    try {
      const res  = await fetch(`${API_BASE}/bookings/${bookingId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Booking #${bookingId} ${action}ed.`);
        refetch();
      } else {
        showToast(`✗ ${data.error ?? `Could not ${action} booking.`}`);
      }
    } catch {
      showToast('✗ Network error. Please try again.');
    } finally {
      setBusyIds(prev => { const n = new Set(prev); n.delete(bookingId); return n; });
    }
  };

  const confirmBooking = (id) => patchBooking(id, 'confirm');

  const cancelBooking  = (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    patchBooking(id, 'cancel');
  };

  // Counts per status
  const counts = useMemo(() =>
    (allBookings ?? []).reduce(
      (acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }),
      { pending: 0, confirmed: 0, cancelled: 0 }
    ), [allBookings]
  );

  // Filter + sort
  const displayed = useMemo(() => {
    let list = activeFilter === 'all' ? allBookings : allBookings.filter(b => b.status === activeFilter);
    if (sortBy === 'newest') list = [...list].reverse();
    if (sortBy === 'amount') list = [...list].sort((a, b) => b.amount - a.amount);
    return list;
  }, [allBookings, activeFilter, sortBy]);

  const FILTERS = [
    { key: 'all',       label: 'All',       count: allBookings?.length ?? 0 },
    { key: 'pending',   label: 'Pending',   count: counts.pending },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <Toast msg={toastMsg} />

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/[0.04] blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-1.5 h-7 bg-orange-500 rounded-full" />
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                  Incoming <span className="text-orange-500">Bookings</span>
                </h1>
              </div>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] ml-5">
                Manage your reservations
              </p>
            </div>

            <button
              onClick={refetch}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Pending action banner */}
          {!loading && counts.pending > 0 && (
            <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-yellow-500/[0.06] border border-yellow-500/15 rounded-2xl">
              <AlertCircle size={14} className="text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-400/80 text-xs font-bold">
                <span className="text-yellow-400 font-black">{counts.pending}</span> booking{counts.pending !== 1 ? 's' : ''} waiting for your response
              </p>
              <button
                onClick={() => setActiveFilter('pending')}
                className="ml-auto text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:text-yellow-300 transition-colors"
              >
                Show only →
              </button>
            </div>
          )}
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
            <XCircle size={15} />
            {error}
          </div>
        )}

        {/* ── Filters + Sort ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter size={12} className="text-white/15 mr-0.5" />

          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
                activeFilter === key
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                  : 'bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50 hover:bg-white/[0.04]'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                  activeFilter === key
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-white/5 text-white/20'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}

          {/* Sort */}
          <div className="ml-auto flex items-center gap-1.5 relative">
            <ChevronDown size={10} className="text-white/20 absolute right-2.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-white/[0.02] border border-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest px-3 pr-7 py-1.5 rounded-xl outline-none cursor-pointer hover:border-white/10 transition-all"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] animate-pulse h-24" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/[0.04] rounded-[36px]">
            <Clock size={32} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No bookings found</p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-3 text-orange-400/50 text-[11px] font-bold hover:text-orange-400 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-2.5">
            {displayed.map(booking => (
              <div key={booking.id} className={busyIds.has(booking.id) ? 'opacity-50 pointer-events-none' : ''}>
                <BookingCard
                  booking={booking}
                  onConfirm={confirmBooking}
                  onCancel={cancelBooking}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && displayed.length > 0 && (
          <p className="text-center text-white/15 text-[10px] font-black uppercase tracking-widest mt-6">
            {displayed.length} booking{displayed.length !== 1 ? 's' : ''} shown
          </p>
        )}
      </div>
    </div>
  );
};

export default OrganizerBookings;