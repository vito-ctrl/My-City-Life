import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import {
  approveActivity,
  approveBusiness,
  banUser,
  getPendingActivities,
  getPendingBusinesses,
  unbanUser,
} from '../../services/admin';

const AdminDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [businessesTotal, setBusinessesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [activitiesResponse, businessesResponse] = await Promise.all([
        getPendingActivities(),
        getPendingBusinesses(),
      ]);

      setActivities(activitiesResponse.data ?? []);
      setBusinesses(businessesResponse.data ?? []);
      setActivitiesTotal(activitiesResponse.total ?? 0);
      setBusinessesTotal(businessesResponse.total ?? 0);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApproveActivity = async (activityId) => {
    setBusyKey(`activity-${activityId}`);

    try {
      await approveActivity(activityId);
      setMessage('Activity approved successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  const handleApproveBusiness = async (businessId) => {
    setBusyKey(`business-${businessId}`);

    try {
      await approveBusiness(businessId);
      setMessage('Business approved successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  const parseUserId = () => {
    const parsedId = Number.parseInt(userId, 10);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new Error('Enter a valid user ID.');
    }

    return parsedId;
  };

  const handleBanUser = async () => {
    let parsedId;

    try {
      parsedId = parseUserId();
    } catch (error) {
      setMessage(error.message);
      return;
    }

    setBusyKey('ban-user');

    try {
      await banUser(parsedId, reason);
      setMessage('User banned successfully.');
      setReason('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  const handleUnbanUser = async () => {
    let parsedId;

    try {
      parsedId = parseUserId();
    } catch (error) {
      setMessage(error.message);
      return;
    }

    setBusyKey('unban-user');

    try {
      await unbanUser(parsedId);
      setMessage('User unbanned successfully.');
      setReason('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-orange-500" />
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              Admin Dashboard
            </h1>
          </div>
          <p className="ml-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
            Approve activities, approve businesses, and ban or unban users
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/80">
            {message}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
              Pending Activities
            </p>
            <p className="mt-3 text-3xl font-black">{activitiesTotal}</p>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
              Pending Businesses
            </p>
            <p className="mt-3 text-3xl font-black">{businessesTotal}</p>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <button
              onClick={loadDashboard}
              className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-400 transition hover:bg-orange-500 hover:text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-xl font-black uppercase italic tracking-tight">User Ban Control</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_auto]">
            <input
              type="number"
              min="1"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User ID"
              className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm font-bold outline-none focus:border-orange-500/40"
            />
            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional ban reason"
              className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm font-bold outline-none focus:border-orange-500/40"
            />
            <div className="flex gap-2">
              <button
                onClick={handleBanUser}
                disabled={busyKey === 'ban-user'}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                {busyKey === 'ban-user' ? 'Working...' : 'Ban'}
              </button>
              <button
                onClick={handleUnbanUser}
                disabled={busyKey === 'unban-user'}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                {busyKey === 'unban-user' ? 'Working...' : 'Unban'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight">Pending Activities</h2>

            {loading ? (
              <p className="mt-5 text-sm font-bold text-white/50">Loading...</p>
            ) : activities.length === 0 ? (
              <p className="mt-5 text-sm font-bold text-white/40">No pending activities.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-orange-500">
                      {activity.category ?? 'Activity'}
                    </p>
                    <h3 className="mt-2 text-sm font-black uppercase italic tracking-tight">
                      {activity.title}
                    </h3>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      User: {activity.user?.name ?? 'Unknown'} | ID: {activity.id}
                    </p>
                    <button
                      onClick={() => handleApproveActivity(activity.id)}
                      disabled={busyKey === `activity-${activity.id}`}
                      className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-400 transition hover:bg-orange-500 hover:text-white disabled:opacity-50"
                    >
                      {busyKey === `activity-${activity.id}` ? 'Working...' : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight">Pending Businesses</h2>

            {loading ? (
              <p className="mt-5 text-sm font-bold text-white/50">Loading...</p>
            ) : businesses.length === 0 ? (
              <p className="mt-5 text-sm font-bold text-white/40">No pending businesses.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-orange-500">
                      {business.type ?? 'Business'}
                    </p>
                    <h3 className="mt-2 text-sm font-black uppercase italic tracking-tight">
                      {business.name}
                    </h3>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      User: {business.user?.name ?? 'Unknown'} | ID: {business.id}
                    </p>
                    <button
                      onClick={() => handleApproveBusiness(business.id)}
                      disabled={busyKey === `business-${business.id}`}
                      className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-400 transition hover:bg-orange-500 hover:text-white disabled:opacity-50"
                    >
                      {busyKey === `business-${business.id}` ? 'Working...' : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
