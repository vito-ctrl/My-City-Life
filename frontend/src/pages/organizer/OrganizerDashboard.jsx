import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import useOrganizerData from '../../hooks/useOrganizerData';
import {
  CalendarCheck,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Building2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

// ── Shared helpers ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-green-500/10  text-green-400  border-green-500/20',
    cancelled: 'bg-red-500/10    text-red-400    border-red-500/20',
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${map[status] ?? 'bg-white/5 text-white/20 border-white/10'}`}>
      {status}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, suffix = '', color = 'text-orange-400', sub, subLabel }) => (
  <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-xl bg-white/[0.03] ${color}`}>
        <Icon size={18} />
      </div>
      {sub !== undefined && (
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{subLabel}</span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter">
        {value}
        {suffix && <span className="text-base text-white/30 font-bold ml-1 not-italic">{suffix}</span>}
      </p>
      {sub !== undefined && (
        <p className={`text-[11px] font-bold mt-1 ${color} opacity-70`}>{sub}</p>
      )}
    </div>
  </div>
);

// ── Booking Status Row ────────────────────────────────────────────────────────
const BookingBar = ({ pending, confirmed, cancelled }) => {
  const total = pending + confirmed + cancelled || 1;
  return (
    <div className="flex rounded-full overflow-hidden h-1.5 w-full gap-px">
      <div className="bg-yellow-500/60 transition-all" style={{ width: `${(pending / total) * 100}%` }} />
      <div className="bg-green-500/60 transition-all"  style={{ width: `${(confirmed / total) * 100}%` }} />
      <div className="bg-red-500/40 transition-all"    style={{ width: `${(cancelled / total) * 100}%` }} />
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const OrganizerDashboard = () => {

  const { stats, allBookings, recentBookings, loading, error } = useOrganizerData();

const breakdown = useMemo(() => {
  if (!allBookings?.length) return { pending: 0, confirmed: 0, cancelled: 0 };
  return allBookings.reduce(
    (acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }),
    { pending: 0, confirmed: 0, cancelled: 0 }
  );
}, [allBookings]);

const pendingCount = breakdown.pending; 

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] bg-orange-500/[0.04] blur-[140px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/[0.03] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

        {/* ── Page Header ── */}
        <header className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-1.5 h-7 bg-orange-500 rounded-full" />
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                  Organizer <span className="text-orange-500">Hub</span>
                </h1>
              </div>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] ml-5">
                Your activity command center
              </p>
            </div>

            {/* Pending alert badge */}
            {!loading && pendingCount > 0 && (
              <Link
                to="/organizer/bookings"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500/15 transition-all"
              >
                <AlertCircle size={13} />
                {pendingCount} pending action{pendingCount !== 1 ? 's' : ''}
                <ArrowUpRight size={11} />
              </Link>
            )}
          </div>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {/* ── Stats Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={CalendarCheck}
              label="Activities"
              value={stats.total_activities ?? 0}
              color="text-blue-400"
            />
            <StatCard
              icon={Users}
              label="Total Bookings"
              value={stats.total_bookings ?? 0} // Now populated by GeneralStatistics
              color="text-orange-400"
              sub={pendingCount > 0 ? `${pendingCount} need review` : 'All clear'}
              subLabel="status"
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue"
              value={(stats.total_revenue ?? 0).toFixed(0)}
              suffix="MAD"
              color="text-green-400"
            />
            <StatCard
              icon={Building2}
              label="Businesses"
              value={stats.total_businesses ?? 0} // Now accurately reflects total businesses
              color="text-purple-400"
            />
          </div>
        )}

        {/* ── Booking Breakdown Bar ── */}
        {!loading && (breakdown.pending + breakdown.confirmed + breakdown.cancelled) > 0 && (
          <div className="mb-10 p-4 bg-white/[0.02] border border-white/5 rounded-[20px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/25 flex items-center gap-2">
                <BarChart3 size={12} className="text-orange-500" />
                Booking breakdown
              </span>
              <div className="flex items-center gap-4">
                {[
                  { label: 'Pending',   val: breakdown.pending,   color: 'bg-yellow-500/60' },
                  { label: 'Confirmed', val: breakdown.confirmed, color: 'bg-green-500/60'  },
                  { label: 'Cancelled', val: breakdown.cancelled, color: 'bg-red-500/40'    },
                ].map(({ label, val, color }) => (
                  <span key={label} className="flex items-center gap-1.5 text-[10px] font-bold text-white/30">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {val} {label}
                  </span>
                ))}
              </div>
            </div>
            <BookingBar {...breakdown} />
          </div>
        )}

        {/* ── Recent Bookings ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black uppercase italic tracking-tight text-white/60 flex items-center gap-2">
              <Clock size={14} className="text-orange-500" />
              Recent Bookings
            </h2>
            <Link
              to="/organizer/bookings"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl animate-pulse h-14" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-white/5 rounded-[28px]">
              <Clock size={28} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No bookings yet</p>
              <p className="text-white/10 text-xs mt-1">Bookings for your activities will appear here</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {recentBookings.slice(0, 5).map(booking => (
                <div
                  key={booking.id}
                  className="group bg-white/[0.02] border border-white/5 px-4 py-3 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] hover:border-orange-500/10 transition-all duration-200"
                >
                  {/* Status icon */}
                  <div className="mr-3 flex-shrink-0">
                    {booking.status === 'confirmed' && <CheckCircle2 size={14} className="text-green-400/60" />}
                    {booking.status === 'pending'   && <Clock        size={14} className="text-yellow-400/60" />}
                    {booking.status === 'cancelled' && <XCircle      size={14} className="text-red-400/40" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm group-hover:text-orange-400 transition-colors truncate leading-none mb-0.5">
                      {booking.activity?.title ?? '—'}
                    </p>
                    <p className="text-white/25 text-[10px] font-bold uppercase tracking-wide">
                      {booking.user?.name ?? '—'}
                      <span className="text-white/15 mx-1.5">·</span>
                      {booking.number_of_guests} guest{booking.number_of_guests !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Amount + status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] font-black text-white/40">{booking.amount} MAD</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Nav ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              to: '/organizer/bookings',
              icon: Users,
              title: 'Manage Bookings',
              desc: 'Confirm or cancel reservations',
              accent: 'group-hover:border-orange-500/20',
            },
            {
              to: '/activity/manage',
              icon: CalendarCheck,
              title: 'My Activities',
              desc: 'Create, edit & publish activities',
              accent: 'group-hover:border-blue-500/20',
            },
            {
              to: '/business/Manage',
              icon: Layers,
              title: 'My Businesses',
              desc: 'Venues, tables & reservations',
              accent: 'group-hover:border-purple-500/20',
            },
          ].map(({ to, icon: Icon, title, desc, accent }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl ${accent} hover:bg-white/[0.04] transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/[0.03] text-white/30 group-hover:text-orange-400 transition-colors">
                  <Icon size={15} />
                </div>
                <div>
                  <p className="font-black uppercase text-xs group-hover:text-white transition-colors leading-none mb-0.5">{title}</p>
                  <p className="text-white/20 text-[10px] font-bold">{desc}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;