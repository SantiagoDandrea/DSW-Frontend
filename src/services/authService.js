// Servicio para gestionar la autenticación de usuarios: iniciar sesión, registrarse y actualizar el perfil.
import { apiFetch } from './api';
import { Usuario } from '../models/Usuario';

export const authService = {
  async login({ email, password }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: data.token, usuario: Usuario.fromJSON(data.usuario) };
  },

  async register(datos) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    return { token: data.token, usuario: Usuario.fromJSON(data.usuario) };
  },

  async getPerfil() {
    const data = await apiFetch('/auth/me');
    return Usuario.fromJSON(data);
  },

  async actualizarPerfil(datos) {
    const data = await apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
    return Usuario.fromJSON(data);
  },

  async logout() {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },
};

