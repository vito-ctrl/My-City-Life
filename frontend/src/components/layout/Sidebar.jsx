import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  CalendarDays,
  MapPin,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,        label: 'Home',        to: '/' },
  { icon: Compass,     label: 'Explore',     to: '/explore' },
  { icon: CalendarDays,label: 'Events',      to: '/events' },
  { icon: MapPin,      label: 'Nearby',      to: '/nearby' },
  { icon: Bookmark,    label: 'Saved',       to: '/saved' },
  { icon: Bell,        label: 'Notifications', to: '/notifications' },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const Sidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear token / auth state here
    navigate('/login');
  };

  return (
    <aside
      className={`
        relative flex flex-col h-screen
        bg-black border-r border-white/10
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-[220px]'}
      `}
    >
      {/* Subtle gradient top accent matching Register.jsx */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[rgba(40,85,95,0.9)] via-[rgba(210,145,120,0.7)] to-transparent" />

      {/* Logo / Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <MapPin size={14} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="text-white text-[0.8125rem] font-semibold tracking-tight whitespace-nowrap">
            MyCityLife
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-hidden">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-[0.8125rem] font-medium transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-white/10 text-white'
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

      {/* Bottom section */}
      <div className="flex flex-col gap-1 px-2 pb-4 border-t border-white/10 pt-3">
        {BOTTOM_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-[0.8125rem] font-medium transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-white/10 text-white'
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

        {/* Logout */}
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
              ? <img src={`/storage/${user.image}`} alt={user.name} className="w-full h-full object-cover" />
              : <User size={14} className="text-white/50" />
            }
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white text-xs font-medium truncate">{user?.name ?? 'Guest'}</span>
              <span className="text-white/35 text-[0.7rem] truncate capitalize">{user?.role ?? ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-black border border-white/15
          flex items-center justify-center text-white/50 hover:text-white hover:border-white/30
          transition-all duration-150 z-10"
      >
        {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
      </button>
    </aside>
  );
};

export default Sidebar;