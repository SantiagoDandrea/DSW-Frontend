import { apiFetch } from './api';

/**
 * Servicio para operaciones de autenticación de usuarios.
 */
export const authService = {
  /**
   * Inicia sesión con credenciales de usuario.
   * @param {{ email: string, password: string }} credenciales
   * @returns {Promise<{ token: string, usuario: Object }>}
   */
  async login({ email, password }) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Obtiene los datos del usuario autenticado actualmente.
   * @returns {Promise<Object>} Datos del perfil del usuario.
   */
  async getPerfil() {
    return apiFetch('/auth/me');
  },

  /**
   * Notifica el cierre de sesión al backend.
   * @returns {Promise<Object>}
   */
  async logout() {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },
};
