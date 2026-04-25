import React, { useEffect, useState } from 'react';
import AdminPageShell, {
  AdminActionButton,
  AdminPagination,
  AdminStatusBadge,
} from '../../components/admin/AdminPageShell';
import { banUser, getUsers, unbanUser } from '../../services/admin';

const EMPTY_PAGE = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
};

const AdminUsers = () => {
  const [users, setUsers] = useState(EMPTY_PAGE);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const loadUsers = async (nextPage = page) => {
    setLoading(true);

    try {
      const response = await getUsers(nextPage);
      setUsers(response);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  const runAction = async (key, action, successMessage) => {
    setBusyKey(key);

    try {
      await action();
      setMessage(successMessage);
      await loadUsers(page);
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

  return (
    <AdminPageShell
      title="Admin Users"
      subtitle="Ban or unban user accounts"
      message={message}
      setMessage={setMessage}
      action={
        <AdminActionButton variant="subtle" busy={loading} onClick={() => loadUsers(page)}>
          Refresh
        </AdminActionButton>
      }
    >
      <section className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Users
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
              {users.total} records
            </p>
          </div>
          {loading && (
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
              Loading
            </p>
          )}
        </div>

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
                      <AdminStatusBadge
                        active={Boolean(user.banned_at)}
                        activeLabel="Banned"
                        inactiveLabel="Active"
                      />
                      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500">
                        {user.role ?? 'User'}
                      </span>
                      {user.is_admin && (
                        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-sky-400">
                          Admin
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight">
                      {user.name}
                    </h3>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      {user.email} | ID: {user.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton
                      variant="danger"
                      busy={busyKey === `ban-user-${user.id}`}
                      disabled={Boolean(user.banned_at) || Boolean(user.is_admin)}
                      onClick={() => handleBanUser(user.id)}
                    >
                      Ban
                    </AdminActionButton>
                    <AdminActionButton
                      variant="subtle"
                      busy={busyKey === `unban-user-${user.id}`}
                      disabled={!user.banned_at}
                      onClick={() =>
                        runAction(
                          `unban-user-${user.id}`,
                          () => unbanUser(user.id),
                          'User unbanned successfully.',
                        )
                      }
                    >
                      Unban
                    </AdminActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminPagination
          page={users.current_page}
          lastPage={users.last_page}
          onPrevious={() => setPage((current) => current - 1)}
          onNext={() => setPage((current) => current + 1)}
        />
      </section>
    </AdminPageShell>
  );
};

export default AdminUsers;
