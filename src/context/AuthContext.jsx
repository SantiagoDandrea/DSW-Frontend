import { useState } from 'react';
import { AuthContext } from './auth-context';
import { authService } from '../services/authService';
import { Usuario } from '../models/Usuario';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        return Usuario.fromJSON(JSON.parse(usuarioGuardado));
      } catch (err) {
        console.error('Error al parsear usuario de localStorage:', err);
        return null;
      }
    }
    return null;
  });

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    
    setToken(data.token);
    setUsuario(data.usuario);

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Error durante el cierre de sesión en backend:', err);
    } finally {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  };

  const value = {
    usuario,
    token,
    isAuthenticated: Boolean(token),
    esAdmin: usuario?.esAdmin ?? false,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
