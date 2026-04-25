import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../layout/Header';

const TABS = [
  { to: '/admin/activities', label: 'Activities' },
  { to: '/admin/businesses', label: 'Businesses' },
  { to: '/admin/users', label: 'Users' },
];

export const AdminActionButton = ({
  children,
  busy,
  variant = 'primary',
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white',
    subtle: 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white',
    danger: 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white',
  };

  return (
    <button
      className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
      disabled={busy || disabled}
      {...props}
    >
      {busy ? 'Working...' : children}
    </button>
  );
};

export const AdminStatusBadge = ({ active, activeLabel, inactiveLabel }) => (
  <span
    className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${
      active
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        : 'border-white/10 bg-white/[0.03] text-white/45'
    }`}
  >
    {active ? activeLabel : inactiveLabel}
  </span>
);

export const AdminPagination = ({ page, lastPage, onPrevious, onNext }) => {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        Page {page} of {lastPage}
      </p>
      <div className="flex gap-2">
        <AdminActionButton variant="subtle" disabled={page <= 1} onClick={onPrevious}>
          Previous
        </AdminActionButton>
        <AdminActionButton variant="subtle" disabled={page >= lastPage} onClick={onNext}>
          Next
        </AdminActionButton>
      </div>
    </div>
  );
};

const AdminPageShell = ({ title, subtitle, message, setMessage, action, children }) => {
  const location = useLocation();

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(''), 3500);

    return () => window.clearTimeout(timeoutId);
  }, [message, setMessage]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-orange-500" />
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                {title}
              </h1>
            </div>
            <p className="ml-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
              {subtitle}
            </p>
          </div>

          {action}
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to;

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                  active
                    ? 'border-orange-500/20 bg-orange-500/10 text-orange-400'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/80">
            {message}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default AdminPageShell;
