import React, { useEffect, useState } from 'react';
import AdminPageShell, {
  AdminActionButton,
  AdminPagination,
  AdminStatusBadge,
} from '../../components/admin/AdminPageShell';
import {
  approveActivity,
  disapproveActivity,
  getActivities,
} from '../../services/admin';

const EMPTY_PAGE = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
};

const AdminActivities = () => {
  const [activities, setActivities] = useState(EMPTY_PAGE);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const loadActivities = async (nextPage = page) => {
    setLoading(true);

    try {
      const response = await getActivities(nextPage);
      setActivities(response);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(page);
  }, [page]);

  const runAction = async (key, action, successMessage) => {
    setBusyKey(key);

    try {
      await action();
      setMessage(successMessage);
      await loadActivities(page);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  return (
    <AdminPageShell
      title="Admin Activities"
      subtitle="Approve or disapprove activity records"
      message={message}
      setMessage={setMessage}
      action={
        <AdminActionButton variant="subtle" busy={loading} onClick={() => loadActivities(page)}>
          Refresh
        </AdminActionButton>
      }
    >
      <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Activities
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
              {activities.total} records
            </p>
          </div>
          {loading && (
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
              Loading
            </p>
          )}
        </div>

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
                      <AdminStatusBadge
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
                      User: {activity.user?.name ?? 'Unknown'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton
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
                    </AdminActionButton>
                    <AdminActionButton
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
                    </AdminActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminPagination
          page={activities.current_page}
          lastPage={activities.last_page}
          onPrevious={() => setPage((current) => current - 1)}
          onNext={() => setPage((current) => current + 1)}
        />
      </section>
    </AdminPageShell>
  );
};

export default AdminActivities;
