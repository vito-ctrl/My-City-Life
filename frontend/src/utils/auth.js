export const API_BASE_URL = 'http://127.0.0.1:8000';
export const AUTH_CHANGE_EVENT = 'mycitylife:auth-change';

const isAbsoluteUrl = (value = '') =>
  value.startsWith('http://') || value.startsWith('https://');

export const normalizeImageUrl = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === `${API_BASE_URL}/storage`) {
    return null;
  }

  if (isAbsoluteUrl(trimmedValue)) {
    return trimmedValue;
  }

  const normalizedPath = trimmedValue
    .replace(/^\/?storage\//, '')
    .replace(/^\/+/, '');

  return normalizedPath ? `${API_BASE_URL}/storage/${normalizedPath}` : null;
};

export const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    ...user,
    image: normalizeImageUrl(user.image),
  };
};

export const getStoredToken = () => localStorage.getItem('token');

export const getStoredUser = () => {
  const userValue = localStorage.getItem('user');

  if (!userValue) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(userValue));
  } catch (error) {
    console.error('Unable to parse stored user', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const dispatchAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  }
};

export const setStoredUser = (user) => {
  const normalizedUser = normalizeUser(user);

  if (normalizedUser) {
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  } else {
    localStorage.removeItem('user');
  }

  dispatchAuthChange();
  return normalizedUser;
};

export const setAuthSession = ({ token, user } = {}) => {
  if (token !== undefined && token !== null) {
    localStorage.setItem('token', token);
  }

  let normalizedUser;

  if (user !== undefined) {
    normalizedUser = normalizeUser(user);

    if (normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem('user');
    }
  }

  dispatchAuthChange();
  return normalizedUser ?? null;
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  dispatchAuthChange();
};
