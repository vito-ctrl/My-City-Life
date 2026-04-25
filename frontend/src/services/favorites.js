import { API_BASE_URL, getStoredToken } from '../utils/auth';

const fetchFavoritesByType = async (type, token = getStoredToken()) => {
  if (!token) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/api/favorites/${type}/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Favorites request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchAllFavorites = async (token = getStoredToken()) => {
  const [activities, businesses] = await Promise.all([
    fetchFavoritesByType('activities', token),
    fetchFavoritesByType('businesses', token),
  ]);

  return { activities, businesses };
};
