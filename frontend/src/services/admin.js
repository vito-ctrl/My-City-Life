import { API_BASE_URL, getStoredToken } from '../utils/auth';

const buildHeaders = (includeJson = false) => {
  const headers = {
    Accept: 'application/json',
  };

  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const parseResponse = async (response) => {
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

const request = async (path, options = {}) => {
  const includeJson = options.body !== undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(includeJson),
      ...(options.headers ?? {}),
    },
  });

  return parseResponse(response);
};

export const fetchPendingActivities = (page = 1) =>
  request(`/api/admin/activities/pending?page=${page}`);

export const approveActivity = (activityId) =>
  request(`/api/admin/activities/${activityId}/approve`, {
    method: 'PATCH',
  });

export const fetchPendingBusinesses = (page = 1) =>
  request(`/api/admin/businesses/pending?page=${page}`);

export const approveBusiness = (businessId) =>
  request(`/api/admin/businesses/${businessId}/approve`, {
    method: 'PATCH',
  });

export const banBusiness = (businessId, reason) =>
  request(`/api/admin/businesses/${businessId}/ban`, {
    method: 'PATCH',
    body: JSON.stringify({
      reason: reason?.trim() || null,
    }),
  });

export const unbanBusiness = (businessId) =>
  request(`/api/admin/businesses/${businessId}/unban`, {
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
