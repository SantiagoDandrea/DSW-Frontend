const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente HTTP centralizado para comunicación con el backend.
 *
 * @param {string} endpoint - Ruta relativa del endpoint (ej. '/categorias', '/productos').
 * @param {RequestInit} [options={}] - Opciones de configuración de fetch (method, headers, body, etc.).
 * @returns {Promise<any>} Datos de la respuesta en formato JSON.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Manejo de respuestas vacías (ej: 204 No Content)
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Error HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
