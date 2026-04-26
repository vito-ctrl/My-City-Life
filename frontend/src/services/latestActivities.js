import { API_BASE_URL, getStoredToken } from '../utils/auth';

export const getLatestActivities = async () => {
  const token = getStoredToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}/api/activities/latest`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch latest activities');
  }

  const payload = await response.json();

  return payload.data || [];
};
