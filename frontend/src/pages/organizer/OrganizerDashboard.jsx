import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import useOrganizerData from '../../hooks/useOrganizerData';
import {
  CalendarCheck,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';

// ── Small helper components ────────────────────────────────────────────────

/**
 * StatCard — displays a single number with a label and icon.
 * Used for the 3 summary tiles at the top of the dashboard.
 */
const StatCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-colors">
    <div className={`text-2xl mb-4 ${color}`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black italic tracking-tighter mt-1">
      {value}<span className="text-lg text-white/30 ml-1">{suffix}</span>
    </p>
  </div>
);

/**
 * StatusBadge — coloured pill showing a booking's status.
 */
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

// ── Main Page ──────────────────────────────────────────────────────────────

const OrganizerDashboard = () => {
  const { stats, recentBookings, loading, error } = useOrganizerData();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="relative">

        {/* Subtle background glow */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

          {/* ── Page Header ── */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-orange-500 rounded-full" />
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">
                Organizer <span className="text-orange-500">Hub</span>
              </h1>
            </div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] ml-5">
              Your activity command center
            </p>
          </header>

          {/* ── Error State ── */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── Stats Grid ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] animate-pulse h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <StatCard
                icon={CalendarCheck}
                label="Total Activities"
                value={stats.total_activities}
                color="text-blue-400"
              />
              <StatCard
                icon={Users}
                label="Total Bookings"
                value={stats.total_bookings}
                color="text-orange-400"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Revenue"
                value={stats.total_revenue.toFixed(2)}
                suffix="MAD"
                color="text-green-400"
              />
            </div>
          )}

          {/* ── Recent Bookings Section ── */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white/80">
              Recent Bookings
            </h2>
            <Link
              to="/organizer/bookings"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl animate-pulse h-16" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[32px]">
              <Clock size={32} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/20 font-bold uppercase tracking-widest text-sm">
                No bookings yet
              </p>
              <p className="text-white/10 text-xs mt-1">
                Bookings for your activities will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {recentBookings.map(booking => (
                <div
                  key={booking.id}
                  className="group bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] hover:border-orange-500/15 transition-all duration-300"
                >
                  {/* Left: activity name + booker */}
                  <div>
                    <p className="font-bold text-sm group-hover:text-orange-400 transition-colors">
                      {booking.activity?.title ?? '—'}
                    </p>
                    <p className="text-white/30 text-[11px] mt-0.5">
                      Booked by <span className="text-white/50">{booking.user?.name ?? '—'}</span>
                      {' · '}{booking.number_of_guests} guest{booking.number_of_guests !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Right: status + amount */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-white/60">
                      {booking.amount} MAD
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Quick Links ── */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/activity/manage"
              className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-orange-500/20 hover:bg-white/[0.04] transition-all"
            >
              <div>
                <p className="font-black uppercase text-sm group-hover:text-orange-400 transition-colors">Manage Activities</p>
                <p className="text-white/30 text-[11px] mt-0.5">Create, edit and delete your activities</p>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/organizer/bookings"
              className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-orange-500/20 hover:bg-white/[0.04] transition-all"
            >
              <div>
                <p className="font-black uppercase text-sm group-hover:text-orange-400 transition-colors">All Bookings</p>
                <p className="text-white/30 text-[11px] mt-0.5">Confirm or cancel incoming bookings</p>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
