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

export const getActivities = (page = 1) =>
  request(`/api/admin/activities?page=${page}`);

export const approveActivity = (activityId) =>
  request(`/api/admin/activities/${activityId}/approve`, {
    method: 'PATCH',
  });

export const disapproveActivity = (activityId) =>
  request(`/api/admin/activities/${activityId}/disapprove`, {
    method: 'PATCH',
  });

export const getBusinesses = (page = 1) =>
  request(`/api/admin/businesses?page=${page}`);

export const approveBusiness = (businessId) =>
  request(`/api/admin/businesses/${businessId}/approve`, {
    method: 'PATCH',
  });

export const disapproveBusiness = (businessId) =>
  request(`/api/admin/businesses/${businessId}/disapprove`, {
    method: 'PATCH',
  });

export const getUsers = (page = 1) =>
  request(`/api/admin/users?page=${page}`);

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
