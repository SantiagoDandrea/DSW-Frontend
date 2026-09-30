import { apiFetch } from './api';
import { Usuario } from '../models/Usuario';

/**
 * Servicio para gestión administrativa de usuarios y asignación de roles.
 */
export const usuarioService = {
  /**
   * Obtiene la lista completa de usuarios del sistema con filtros opcionales.
   * @param {Object} [filtros]
   * @param {string} [filtros.rol] - 'ADMIN' o 'CLIENTE'
   * @param {string} [filtros.search] - Búsqueda por texto (nombre, apellido, DNI, email)
   * @returns {Promise<Usuario[]>}
   */
  async getUsuarios(filtros = {}) {
    const query = new URLSearchParams();
    if (filtros.rol) query.append('rol', filtros.rol);
    if (filtros.search) query.append('search', filtros.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/usuarios?${queryString}` : '/usuarios';
    const data = await apiFetch(endpoint);
    return data.map((u) => Usuario.fromJSON(u));
  },

  /**
   * Obtiene los datos detallados de un usuario por su DNI.
   * @param {string} dni
   * @returns {Promise<Usuario>}
   */
  async getUsuarioByDni(dni) {
    const data = await apiFetch(`/usuarios/${dni}`);
    return Usuario.fromJSON(data);
  },

  /**
   * Da de alta un nuevo usuario en el sistema con rol específico.
   * @param {Object} datos
   * @param {string} datos.dni
   * @param {string} datos.nombre
   * @param {string} datos.apellido
   * @param {string} datos.email
   * @param {string} datos.password
   * @param {string} [datos.telefono]
   * @param {number} datos.localidadId
   * @param {string} [datos.rol] - 'CLIENTE' o 'ADMIN' (por defecto 'CLIENTE')
   * @returns {Promise<Usuario>}
   */
  async crearUsuario(datos) {
    const payload = {
      ...datos,
      localidadId: Number(datos.localidadId),
      rol: datos.rol || 'CLIENTE',
    };
    const data = await apiFetch('/usuarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return Usuario.fromJSON(data);
  },

  /**
   * Actualiza los datos de un usuario existente.
   * @param {string} dni
   * @param {Object} datos
   * @returns {Promise<Usuario>}
   */
  async actualizarUsuario(dni, datos) {
    const payload = {
      ...datos,
    };
    if (datos.localidadId) {
      payload.localidadId = Number(datos.localidadId);
    }
    // Solo enviar contraseña si se especificó una nueva
    if (!payload.password) {
      delete payload.password;
    }

    const data = await apiFetch(`/usuarios/${dni}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return Usuario.fromJSON(data);
  },

  /**
   * Elimina un usuario por su DNI.
   * @param {string} dni
   * @returns {Promise<Object>}
   */
  async eliminarUsuario(dni) {
    return apiFetch(`/usuarios/${dni}`, {
      method: 'DELETE',
    });
  },
};
