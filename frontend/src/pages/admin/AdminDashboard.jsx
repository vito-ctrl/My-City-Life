import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import {
  approveActivity,
  approveBusiness,
  banUser,
  disapproveActivity,
  disapproveBusiness,
  getActivities,
  getBusinesses,
  getUsers,
  unbanUser,
} from '../../services/admin';

const EMPTY_PAGE = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
};

const StatusBadge = ({ active, activeLabel, inactiveLabel }) => (
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

const ActionButton = ({ children, busy, variant = 'primary', disabled = false, ...props }) => {
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

const Pagination = ({ page, lastPage, onPrevious, onNext }) => {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        Page {page} of {lastPage}
      </p>
      <div className="flex gap-2">
        <ActionButton variant="subtle" disabled={page <= 1} onClick={onPrevious}>
          Previous
        </ActionButton>
        <ActionButton variant="subtle" disabled={page >= lastPage} onClick={onNext}>
          Next
        </ActionButton>
      </div>
    </div>
  );
};

const SectionShell = ({ title, total, loading, children, pagination }) => (
  <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
          {total} records
        </p>
      </div>
      {loading && (
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
          Loading
        </p>
      )}
    </div>
    {children}
    {pagination}
  </section>
);

const AdminDashboard = () => {
  const [activities, setActivities] = useState(EMPTY_PAGE);
  const [businesses, setBusinesses] = useState(EMPTY_PAGE);
  const [users, setUsers] = useState(EMPTY_PAGE);
  const [activityPage, setActivityPage] = useState(1);
  const [businessPage, setBusinessPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const loadDashboard = async (
    nextActivityPage = activityPage,
    nextBusinessPage = businessPage,
    nextUserPage = userPage,
  ) => {
    setLoading(true);

    try {
      const [activitiesResponse, businessesResponse, usersResponse] = await Promise.all([
        getActivities(nextActivityPage),
        getBusinesses(nextBusinessPage),
        getUsers(nextUserPage),
      ]);

      setActivities(activitiesResponse);
      setBusinesses(businessesResponse);
      setUsers(usersResponse);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activityPage, businessPage, userPage]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(''), 3500);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const runAction = async (key, action, successMessage) => {
    setBusyKey(key);

    try {
      await action();
      setMessage(successMessage);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  const handleBanUser = (userId) => {
    const reason = window.prompt('Optional ban reason:');

    if (reason === null) {
      return;
    }

    runAction(
      `ban-user-${userId}`,
      () => banUser(userId, reason),
      'User banned successfully.',
    );
  };

  const handleUnbanUser = (userId) =>
    runAction(
      `unban-user-${userId}`,
      () => unbanUser(userId),
      'User unbanned successfully.',
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-orange-500" />
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                Admin Dashboard
              </h1>
            </div>
            <p className="ml-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
              Approve or disapprove activities and businesses, and ban or unban users
            </p>
          </div>

          <ActionButton variant="subtle" busy={loading} onClick={() => loadDashboard()}>
            Refresh
          </ActionButton>
        </header>

        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/80">
            {message}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
              Activities
            </p>
            <p className="mt-3 text-3xl font-black">{activities.total}</p>
          </div>
          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
              Businesses
            </p>
            <p className="mt-3 text-3xl font-black">{businesses.total}</p>
          </div>
          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
              Users
            </p>
            <p className="mt-3 text-3xl font-black">{users.total}</p>
          </div>
        </div>

        <div className="space-y-6">
          <SectionShell
            title="Activities"
            total={activities.total}
            loading={loading}
            pagination={
              <Pagination
                page={activities.current_page}
                lastPage={activities.last_page}
                onPrevious={() => setActivityPage((current) => current - 1)}
                onNext={() => setActivityPage((current) => current + 1)}
              />
            }
          >
            {activities.data.length === 0 ? (
              <p className="text-sm font-bold text-white/40">No activities found.</p>
            ) : (
              <div className="space-y-3">
                {activities.data.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <StatusBadge
                            active={Boolean(activity.is_approved)}
                            activeLabel="Approved"
                            inactiveLabel="Disapproved"
                          />
                          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500">
                            {activity.category ?? 'Activity'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-tight">
                          {activity.title}
                        </h3>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                          User: {activity.user?.name ?? 'Unknown'} | ID: {activity.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          busy={busyKey === `approve-activity-${activity.id}`}
                          disabled={Boolean(activity.is_approved)}
                          onClick={() =>
                            runAction(
                              `approve-activity-${activity.id}`,
                              () => approveActivity(activity.id),
                              'Activity approved successfully.',
                            )
                          }
                        >
                          Approve
                        </ActionButton>
                        <ActionButton
                          variant="subtle"
                          busy={busyKey === `disapprove-activity-${activity.id}`}
                          disabled={!activity.is_approved}
                          onClick={() =>
                            runAction(
                              `disapprove-activity-${activity.id}`,
                              () => disapproveActivity(activity.id),
                              'Activity disapproved successfully.',
                            )
                          }
                        >
                          Disapprove
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell
            title="Businesses"
            total={businesses.total}
            loading={loading}
            pagination={
              <Pagination
                page={businesses.current_page}
                lastPage={businesses.last_page}
                onPrevious={() => setBusinessPage((current) => current - 1)}
                onNext={() => setBusinessPage((current) => current + 1)}
              />
            }
          >
            {businesses.data.length === 0 ? (
              <p className="text-sm font-bold text-white/40">No businesses found.</p>
            ) : (
              <div className="space-y-3">
                {businesses.data.map((business) => (
                  <div
                    key={business.id}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <StatusBadge
                            active={Boolean(business.is_approved)}
                            activeLabel="Approved"
                            inactiveLabel="Disapproved"
                          />
                          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500">
                            {business.type ?? 'Business'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-tight">
                          {business.name}
                        </h3>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                          User: {business.user?.name ?? 'Unknown'} | ID: {business.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          busy={busyKey === `approve-business-${business.id}`}
                          disabled={Boolean(business.is_approved)}
                          onClick={() =>
                            runAction(
                              `approve-business-${business.id}`,
                              () => approveBusiness(business.id),
                              'Business approved successfully.',
                            )
                          }
                        >
                          Approve
                        </ActionButton>
                        <ActionButton
                          variant="subtle"
                          busy={busyKey === `disapprove-business-${business.id}`}
                          disabled={!business.is_approved}
                          onClick={() =>
                            runAction(
                              `disapprove-business-${business.id}`,
                              () => disapproveBusiness(business.id),
                              'Business disapproved successfully.',
                            )
                          }
                        >
                          Disapprove
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell
            title="Users"
            total={users.total}
            loading={loading}
            pagination={
              <Pagination
                page={users.current_page}
                lastPage={users.last_page}
                onPrevious={() => setUserPage((current) => current - 1)}
                onNext={() => setUserPage((current) => current + 1)}
              />
            }
          >
            {users.data.length === 0 ? (
              <p className="text-sm font-bold text-white/40">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.data.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <StatusBadge
                            active={Boolean(user.banned_at)}
                            activeLabel="Banned"
                            inactiveLabel="Active"
                          />
                          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500">
                            {user.role ?? 'User'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-tight">
                          {user.name}
                        </h3>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                          {user.email} | ID: {user.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          variant="danger"
                          busy={busyKey === `ban-user-${user.id}`}
                          disabled={Boolean(user.banned_at)}
                          onClick={() => handleBanUser(user.id)}
                        >
                          Ban
                        </ActionButton>
                        <ActionButton
                          variant="subtle"
                          busy={busyKey === `unban-user-${user.id}`}
                          disabled={!user.banned_at}
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          Unban
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
