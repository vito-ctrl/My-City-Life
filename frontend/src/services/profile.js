import {
  API_BASE_URL,
  clearAuthSession,
  getStoredToken,
  setStoredUser,
} from '../utils/auth';

export const fetchCurrentProfile = async (token = getStoredToken()) => {
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    throw new Error(`Profile request failed with status ${response.status}`);
  }

  const payload = await response.json();

  return {
    user: setStoredUser(payload.user),
    details: payload.data ?? null,
  };
};
