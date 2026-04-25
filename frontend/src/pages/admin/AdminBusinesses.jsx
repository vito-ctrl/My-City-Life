import React, { useEffect, useState } from 'react';
import AdminPageShell, {
  AdminActionButton,
  AdminPagination,
  AdminStatusBadge,
} from '../../components/admin/AdminPageShell';
import {
  approveBusiness,
  disapproveBusiness,
  getBusinesses,
} from '../../services/admin';

const EMPTY_PAGE = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
};

const AdminBusinesses = () => {
  const [businesses, setBusinesses] = useState(EMPTY_PAGE);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const loadBusinesses = async (nextPage = page) => {
    setLoading(true);

    try {
      const response = await getBusinesses(nextPage);
      setBusinesses(response);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses(page);
  }, [page]);

  const runAction = async (key, action, successMessage) => {
    setBusyKey(key);

    try {
      await action();
      setMessage(successMessage);
      await loadBusinesses(page);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey('');
    }
  };

  return (
    <AdminPageShell
      title="Admin Businesses"
      subtitle="Approve or disapprove business records"
      message={message}
      setMessage={setMessage}
      action={
        <AdminActionButton variant="subtle" busy={loading} onClick={() => loadBusinesses(page)}>
          Refresh
        </AdminActionButton>
      }
    >
      <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Businesses
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
              {businesses.total} records
            </p>
          </div>
          {loading && (
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
              Loading
            </p>
          )}
        </div>

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
                      <AdminStatusBadge
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
                    <AdminActionButton
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
                    </AdminActionButton>
                    <AdminActionButton
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
                    </AdminActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminPagination
          page={businesses.current_page}
          lastPage={businesses.last_page}
          onPrevious={() => setPage((current) => current - 1)}
          onNext={() => setPage((current) => current + 1)}
        />
      </section>
    </AdminPageShell>
  );
};

export default AdminBusinesses;
