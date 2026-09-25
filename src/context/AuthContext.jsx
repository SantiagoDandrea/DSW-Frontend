import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './auth-context';
import { authService } from '../services/authService';
import { Usuario } from '../models/Usuario';

export const AuthProvider = ({ children }) => {
  // Inicialización directa para evitar renders en cascada y mantener persistencia síncrona
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
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
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
  }, []);

  // Escuchar evento disparado por el cliente apiFetch ante respuestas 401
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Permite iniciar sesión tanto pasando credenciales (email, password)
   * como pasando directamente token y userData ya resueltos.
   */
  const login = useCallback(async (arg1, arg2) => {
    setLoading(true);
    try {
      let tokenValue;
      let userValue;

      if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        // Llamada con credenciales: login(email, password)
        const data = await authService.login({ email: arg1, password: arg2 });
        tokenValue = data.token;
        userValue = data.usuario;
      } else {
        // Llamada con datos resueltos: login(token, userData)
        tokenValue = arg1;
        userValue = arg2 instanceof Usuario ? arg2 : Usuario.fromJSON(arg2);
      }

      setToken(tokenValue);
      setUsuario(userValue);

      if (tokenValue) {
        localStorage.setItem('token', tokenValue);
      }
      if (userValue) {
        localStorage.setItem('usuario', JSON.stringify(userValue));
      }

      return { token: tokenValue, usuario: userValue };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      token,
      isAuthenticated: Boolean(token),
      esAdmin: usuario?.esAdmin ?? (usuario?.rol === 'ADMIN'),
      loading,
      login,
      logout,
    }),
    [usuario, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
