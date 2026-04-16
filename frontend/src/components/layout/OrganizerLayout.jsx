import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  ListTodo,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { useState } from 'react';

// The navigation links specific to the Organizer section
const ORGANIZER_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/organizer/dashboard' },
  { icon: CalendarCheck,   label: 'Bookings',     to: '/organizer/bookings' },
  { icon: ListTodo,        label: 'My Activities', to: '/activity/manage' },
];

/**
 * OrganizerLayout
 *
 * A wrapper component that renders the Organizer sidebar + the page content
 * side by side, just like the main Sidebar.jsx but with Organizer-specific links.
 *
 * Usage: wrap any organizer page in this layout inside App.jsx, or use it
 * directly inside the organizer page components.
 */
const OrganizerLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Read the saved user from localStorage (saved during login)
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={`
          relative flex flex-col h-screen flex-shrink-0
          bg-black border-r border-white/10
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-[220px]'}
        `}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-600/80 via-orange-400/50 to-transparent" />

        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <MapPin size={14} className="text-orange-400" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white text-[0.8125rem] font-semibold tracking-tight whitespace-nowrap">
                MyCityLife
              </span>
              <span className="text-orange-400/70 text-[0.65rem] font-medium tracking-widest uppercase whitespace-nowrap">
                Organizer
              </span>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-hidden">
          {ORGANIZER_NAV.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-[0.8125rem] font-medium transition-all duration-150
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section: logout + user info */}
        <div className="flex flex-col gap-1 px-2 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
              text-[0.8125rem] font-medium text-white/40
              hover:text-red-400 hover:bg-red-500/10 transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={17} strokeWidth={2} className="flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>

          {/* User avatar */}
          <div className={`flex items-center gap-3 px-3 py-2.5 mt-1 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
              {user?.image
                ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                : <User size={14} className="text-white/50" />
              }
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-medium truncate">{user?.name ?? 'Organizer'}</span>
                <span className="text-orange-400/60 text-[0.7rem] truncate">{user?.role ?? 'Organizer'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-black border border-white/15
            flex items-center justify-center text-white/50 hover:text-white hover:border-white/30
            transition-all duration-150 z-10"
        >
          {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
        </button>
      </aside>

      {/* ── Page content ────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default OrganizerLayout;
