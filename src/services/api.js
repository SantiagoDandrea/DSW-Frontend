// Cliente HTTP centralizado que envía las peticiones a la API incluyendo el token de autenticación.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const token = localStorage.getItem('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      const teniaSesion = Boolean(token);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { status: 401, teniaSesion } }));
    }

    const errorMessage = data?.message || data?.error || `Error HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

