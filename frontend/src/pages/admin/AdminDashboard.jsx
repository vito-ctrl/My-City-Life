import React, { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import {
  approveActivity,
  approveBusiness,
  banBusiness,
  banUser,
  fetchPendingActivities,
  fetchPendingBusinesses,
  unbanBusiness,
  unbanUser,
} from '../../services/admin';

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const Toast = ({ message }) => {
  if (!message) {
    return null;
  }

  const isSuccess = message.startsWith('✓');

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-bold shadow-2xl ${
        isSuccess
          ? 'border-emerald-500/30 bg-[#0a0a0a] text-emerald-400'
          : 'border-red-500/30 bg-[#0a0a0a] text-red-400'
      }`}
    >
      {isSuccess ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
      <span>{message.replace(/^[✓✗]\s*/, '')}</span>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
    <div className="mb-4 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
        {label}
      </span>
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2 text-orange-400">
        <Icon size={16} />
      </div>
    </div>
    <p className="text-3xl font-black uppercase tracking-tight text-white">{value}</p>
    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
      {hint}
    </p>
  </div>
);

const ActionButton = ({ children, busy, variant = 'primary', disabled = false, ...props }) => {
  const variants = {
    primary: 'border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white',
    danger: 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white',
    subtle: 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white',
  };

  return (
    <button
      className={`rounded-xl border px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
      disabled={busy || disabled}
      {...props}
    >
      {busy ? 'Working...' : children}
    </button>
  );
};

const SectionShell = ({ title, subtitle, icon: Icon, action, children }) => (
  <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-1.5 flex items-center gap-3">
          <div className="h-7 w-1.5 rounded-full bg-orange-500" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            {title}
          </h2>
        </div>
        <p className="ml-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/20">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-white/5 bg-black/20 p-3 text-orange-400 sm:block">
          <Icon size={18} />
        </div>
        {action}
      </div>
    </div>
    {children}
  </section>
);

const EmptyState = ({ icon: Icon, title, body }) => (
  <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center">
    <Icon size={28} className="mx-auto mb-4 text-white/20" />
    <p className="text-sm font-black uppercase tracking-widest text-white/60">{title}</p>
    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/20">{body}</p>
  </div>
);

const Pagination = ({ page, lastPage, onChange }) => {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        Page {page} of {lastPage}
      </p>
      <div className="flex items-center gap-2">
        <ActionButton
          variant="subtle"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </ActionButton>
        <ActionButton
          variant="subtle"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
        >
          Next
        </ActionButton>
      </div>
    </div>
  );
};

const IdModerationCard = ({
  icon: Icon,
  title,
  subtitle,
  idLabel,
  form,
  setForm,
  onBan,
  onUnban,
  banBusy,
  unbanBusy,
}) => (
  <div className="rounded-[24px] border border-white/5 bg-black/20 p-5">
    <div className="mb-5 flex items-start gap-4">
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
          {idLabel}
        </span>
        <input
          type="number"
          min="1"
          value={form.id}
          onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm font-bold text-white outline-none transition-all placeholder:text-white/15 focus:border-orange-500/40"
          placeholder="Enter a numeric ID"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
          Ban reason
        </span>
        <textarea
          value={form.reason}
          onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          rows="4"
          className="w-full resize-none rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm font-bold text-white outline-none transition-all placeholder:text-white/15 focus:border-orange-500/40"
          placeholder="Optional internal note for why this record is being banned"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton variant="danger" busy={banBusy} onClick={onBan}>
          Ban
        </ActionButton>
        <ActionButton variant="subtle" busy={unbanBusy} onClick={onUnban}>
          Remove Ban
        </ActionButton>
      </div>
    </div>
  </div>
);

const PendingActivityRow = ({ activity, busy, onApprove }) => (
  <div className="grid gap-4 border-t border-white/5 px-4 py-4 first:border-t-0 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-orange-500">
        {activity.category ?? 'Activity'}
      </p>
      <h3 className="mt-1 truncate text-sm font-black uppercase italic tracking-tight text-white">
        {activity.title ?? `Activity #${activity.id}`}
      </h3>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
        Submitted {formatDate(activity.created_at)}
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
      <span className="rounded-full border border-white/10 px-2.5 py-1">
        Owner: {activity.user?.name ?? 'Unknown'}
      </span>
      <span className="rounded-full border border-white/10 px-2.5 py-1">
        ID: {activity.id}
      </span>
      {activity.start_time && (
        <span className="rounded-full border border-white/10 px-2.5 py-1">
          Starts: {formatDate(activity.start_time)}
        </span>
      )}
    </div>

    <div className="flex items-center gap-2 sm:justify-end">
      <ActionButton busy={busy} onClick={() => onApprove(activity.id)}>
        Approve
      </ActionButton>
    </div>
  </div>
);

const PendingBusinessRow = ({ business, approveBusy, banBusy, onApprove, onBan }) => (
  <div className="grid gap-4 border-t border-white/5 px-4 py-4 first:border-t-0 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-orange-500">
        {business.type ?? 'Business'}
      </p>
      <h3 className="mt-1 truncate text-sm font-black uppercase italic tracking-tight text-white">
        {business.name ?? `Business #${business.id}`}
      </h3>
      <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
        {business.location ?? 'No location provided'}
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
      <span className="rounded-full border border-white/10 px-2.5 py-1">
        Owner: {business.user?.name ?? 'Unknown'}
      </span>
      <span className="rounded-full border border-white/10 px-2.5 py-1">
        ID: {business.id}
      </span>
      <span className="rounded-full border border-white/10 px-2.5 py-1">
        Submitted {formatDate(business.created_at)}
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <ActionButton busy={approveBusy} onClick={() => onApprove(business.id)}>
        Approve
      </ActionButton>
      <ActionButton variant="danger" busy={banBusy} onClick={() => onBan(business.id)}>
        Ban
      </ActionButton>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [activities, setActivities] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [businesses, setBusinesses] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [activityPage, setActivityPage] = useState(1);
  const [businessPage, setBusinessPage] = useState(1);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [userForm, setUserForm] = useState({ id: '', reason: '' });
  const [businessForm, setBusinessForm] = useState({ id: '', reason: '' });

  const showToast = (message) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(null), 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const loadActivities = async (page = activityPage) => {
    setLoadingActivities(true);

    try {
      const payload = await fetchPendingActivities(page);
      setActivities(payload);
    } catch (error) {
      showToast(`✗ ${error.message}`);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadBusinesses = async (page = businessPage) => {
    setLoadingBusinesses(true);

    try {
      const payload = await fetchPendingBusinesses(page);
      setBusinesses(payload);
    } catch (error) {
      showToast(`✗ ${error.message}`);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    loadActivities(activityPage);
  }, [activityPage]);

  useEffect(() => {
    loadBusinesses(businessPage);
  }, [businessPage]);

  const refreshAll = async () => {
    setRefreshing(true);

    try {
      await Promise.all([loadActivities(activityPage), loadBusinesses(businessPage)]);
      showToast('✓ Moderation queues refreshed.');
    } finally {
      setRefreshing(false);
    }
  };

  const runAction = async (key, action, successMessage) => {
    setBusyAction(key);

    try {
      await action();
      showToast(`✓ ${successMessage}`);
    } catch (error) {
      showToast(`✗ ${error.message}`);
    } finally {
      setBusyAction('');
    }
  };

  const handleApproveActivity = (activityId) =>
    runAction(
      `activity-approve-${activityId}`,
      async () => {
        await approveActivity(activityId);
        await loadActivities(activityPage);
      },
      `Activity #${activityId} approved.`,
    );

  const handleApproveBusiness = (businessId) =>
    runAction(
      `business-approve-${businessId}`,
      async () => {
        await approveBusiness(businessId);
        await loadBusinesses(businessPage);
      },
      `Business #${businessId} approved.`,
    );

  const handleBanBusiness = (businessId, reason = '') =>
    runAction(
      `business-ban-${businessId}`,
      async () => {
        await banBusiness(businessId, reason);
        await loadBusinesses(businessPage);
      },
      `Business #${businessId} banned.`,
    );

  const parseId = (value, label) => {
    const parsedValue = Number.parseInt(value, 10);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      throw new Error(`Enter a valid ${label} ID.`);
    }

    return parsedValue;
  };

  const handleUserBan = async () => {
    let userId;

    try {
      userId = parseId(userForm.id, 'user');
    } catch (error) {
      showToast(`✗ ${error.message}`);
      return;
    }

    await runAction(
      `user-ban-${userId}`,
      () => banUser(userId, userForm.reason),
      `User #${userId} banned.`,
    );
  };

  const handleUserUnban = async () => {
    let userId;

    try {
      userId = parseId(userForm.id, 'user');
    } catch (error) {
      showToast(`✗ ${error.message}`);
      return;
    }

    await runAction(
      `user-unban-${userId}`,
      () => unbanUser(userId),
      `User #${userId} unbanned.`,
    );
  };

  const handleBusinessBanById = async () => {
    let businessId;

    try {
      businessId = parseId(businessForm.id, 'business');
    } catch (error) {
      showToast(`✗ ${error.message}`);
      return;
    }

    await runAction(
      `business-ban-id-${businessId}`,
      async () => {
        await banBusiness(businessId, businessForm.reason);
        await loadBusinesses(businessPage);
      },
      `Business #${businessId} banned.`,
    );
  };

  const handleBusinessUnbanById = async () => {
    let businessId;

    try {
      businessId = parseId(businessForm.id, 'business');
    } catch (error) {
      showToast(`✗ ${error.message}`);
      return;
    }

    await runAction(
      `business-unban-${businessId}`,
      () => unbanBusiness(businessId),
      `Business #${businessId} unbanned.`,
    );
  };

  const summary = useMemo(
    () => [
      {
        icon: FiClock,
        label: 'Pending Activities',
        value: activities.total ?? 0,
        hint: 'Waiting for manual approval',
      },
      {
        icon: FiBriefcase,
        label: 'Pending Businesses',
        value: businesses.total ?? 0,
        hint: 'Listings that still need review',
      },
      {
        icon: FiShield,
        label: 'Moderation Tools',
        value: 'Live',
        hint: 'Ban and unban actions are ready',
      },
    ],
    [activities.total, businesses.total],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <Toast message={toastMessage} />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-8%] top-[-8%] h-[420px] w-[420px] rounded-full bg-orange-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-12%] left-[-8%] h-[320px] w-[320px] rounded-full bg-white/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-orange-500" />
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                Admin <span className="text-orange-500">Moderation</span>
              </h1>
            </div>
            <p className="ml-5 max-w-2xl text-[10px] font-black uppercase tracking-[0.28em] text-white/20">
              Review pending submissions and manage bans without leaving the main app flow
            </p>
          </div>

          <ActionButton variant="subtle" busy={refreshing} onClick={refreshAll}>
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw size={12} />
              Refresh Dashboard
            </span>
          </ActionButton>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {summary.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <IdModerationCard
            icon={FiUsers}
            title="User Access Control"
            subtitle="Use exact IDs to ban or restore individual accounts"
            idLabel="User ID"
            form={userForm}
            setForm={setUserForm}
            onBan={handleUserBan}
            onUnban={handleUserUnban}
            banBusy={busyAction === `user-ban-${userForm.id}`}
            unbanBusy={busyAction === `user-unban-${userForm.id}`}
          />

          <IdModerationCard
            icon={FiBriefcase}
            title="Business Access Control"
            subtitle="Ban or restore organizer listings directly by business ID"
            idLabel="Business ID"
            form={businessForm}
            setForm={setBusinessForm}
            onBan={handleBusinessBanById}
            onUnban={handleBusinessUnbanById}
            banBusy={busyAction === `business-ban-id-${businessForm.id}`}
            unbanBusy={busyAction === `business-unban-${businessForm.id}`}
          />
        </div>

        <div className="space-y-8">
          <SectionShell
            title="Pending Activities"
            subtitle="Approve newly submitted activity records"
            icon={FiClock}
            action={
              <ActionButton
                variant="subtle"
                busy={loadingActivities}
                onClick={() => loadActivities(activityPage)}
              >
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCw size={12} />
                  Refresh
                </span>
              </ActionButton>
            }
          >
            {loadingActivities ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-[20px] border border-white/5 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : activities.data?.length ? (
              <>
                <div className="overflow-hidden rounded-[24px] border border-white/5 bg-black/20">
                  {activities.data.map((activity) => (
                    <PendingActivityRow
                      key={activity.id}
                      activity={activity}
                      busy={busyAction === `activity-approve-${activity.id}`}
                      onApprove={handleApproveActivity}
                    />
                  ))}
                </div>
                <Pagination
                  page={activities.current_page}
                  lastPage={activities.last_page}
                  onChange={setActivityPage}
                />
              </>
            ) : (
              <EmptyState
                icon={FiCheckCircle}
                title="No pending activities"
                body="Everything submitted so far has already been reviewed"
              />
            )}
          </SectionShell>

          <SectionShell
            title="Pending Businesses"
            subtitle="Approve or ban new business listings"
            icon={FiBriefcase}
            action={
              <ActionButton
                variant="subtle"
                busy={loadingBusinesses}
                onClick={() => loadBusinesses(businessPage)}
              >
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCw size={12} />
                  Refresh
                </span>
              </ActionButton>
            }
          >
            {loadingBusinesses ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-[20px] border border-white/5 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : businesses.data?.length ? (
              <>
                <div className="overflow-hidden rounded-[24px] border border-white/5 bg-black/20">
                  {businesses.data.map((business) => (
                    <PendingBusinessRow
                      key={business.id}
                      business={business}
                      approveBusy={busyAction === `business-approve-${business.id}`}
                      banBusy={busyAction === `business-ban-${business.id}`}
                      onApprove={handleApproveBusiness}
                      onBan={(businessId) => {
                        const reason = window.prompt('Optional ban reason for this business:');

                        if (reason === null) {
                          return;
                        }

                        handleBanBusiness(businessId, reason);
                      }}
                    />
                  ))}
                </div>
                <Pagination
                  page={businesses.current_page}
                  lastPage={businesses.last_page}
                  onChange={setBusinessPage}
                />
              </>
            ) : (
              <EmptyState
                icon={FiCheckCircle}
                title="No pending businesses"
                body="All submitted listings are already in a reviewed state"
              />
            )}
          </SectionShell>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
