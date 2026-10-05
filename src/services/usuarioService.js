// Servicio para consultar, crear, actualizar y eliminar usuarios y roles en la API.
import { apiFetch } from './api';
import { Usuario } from '../models/Usuario';

export const usuarioService = {
  async getUsuarios(filtros = {}) {
    const query = new URLSearchParams();
    if (filtros.rol) query.append('rol', filtros.rol);
    if (filtros.search) query.append('search', filtros.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/usuarios?${queryString}` : '/usuarios';
    const data = await apiFetch(endpoint);
    return data.map((u) => Usuario.fromJSON(u));
  },

  async getUsuarioByDni(dni) {
    const data = await apiFetch(`/usuarios/${dni}`);
    return Usuario.fromJSON(data);
  },

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

  async actualizarUsuario(dni, datos) {
    const payload = {
      ...datos,
    };
    if (datos.localidadId) {
      payload.localidadId = Number(datos.localidadId);
    }
    if (!payload.password) {
      delete payload.password;
    }

    const data = await apiFetch(`/usuarios/${dni}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return Usuario.fromJSON(data);
  },

  async eliminarUsuario(dni) {
    return apiFetch(`/usuarios/${dni}`, {
      method: 'DELETE',
    });
  },
};

