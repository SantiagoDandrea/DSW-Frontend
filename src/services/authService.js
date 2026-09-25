import { apiFetch } from './api';
import { Usuario } from '../models/Usuario';

/**
 * Servicio para operaciones de autenticación de usuarios.
 */
export const authService = {
  /**
   * Inicia sesión con credenciales de usuario.
   * @param {{ email: string, password: string }} credenciales
   * @returns {Promise<{ token: string, usuario: Usuario }>}
   */
  async login({ email, password }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: data.token, usuario: Usuario.fromJSON(data.usuario) };
  },

  /**
   * Registra un nuevo usuario cliente en el sistema.
   * @param {{ dni: string, nombre: string, apellido: string, email: string, telefono: string, localidadId: number, password: string }} datos
   * @returns {Promise<{ token: string, usuario: Usuario }>}
   */
  async register(datos) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    return { token: data.token, usuario: Usuario.fromJSON(data.usuario) };
  },

  /**
   * Obtiene los datos del usuario autenticado actualmente.
   * @returns {Promise<Usuario>} Datos del perfil del usuario.
   */
  async getPerfil() {
    const data = await apiFetch('/auth/me');
    return Usuario.fromJSON(data);
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
