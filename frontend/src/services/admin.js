import { API_BASE_URL, getStoredToken } from '../utils/auth';

const request = async (path, options = {}) => {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error ??
      payload?.message ??
      `Request failed with status ${response.status}`,
    );
  }

  return payload;
};

export const getPendingActivities = () =>
  request('/api/admin/activities/pending');

export const approveActivity = (activityId) =>
  request(`/api/admin/activities/${activityId}/approve`, {
    method: 'PATCH',
  });

export const getPendingBusinesses = () =>
  request('/api/admin/businesses/pending');

export const approveBusiness = (businessId) =>
  request(`/api/admin/businesses/${businessId}/approve`, {
    method: 'PATCH',
  });

export const banUser = (userId, reason) =>
  request(`/api/admin/users/${userId}/ban`, {
    method: 'PATCH',
    body: JSON.stringify({
      reason: reason?.trim() || null,
    }),
  });

export const unbanUser = (userId) =>
  request(`/api/admin/users/${userId}/unban`, {
    method: 'PATCH',
  });
