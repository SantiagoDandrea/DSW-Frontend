import { useContext } from 'react';
import { AuthContext } from './auth-context';

/**
 * Hook personalizado para acceder al estado y acciones de autenticación.
 * @returns {{
 *   usuario: Object|null,
 *   token: string|null,
 *   isAuthenticated: boolean,
 *   esAdmin: boolean,
 *   login: Function,
 *   logout: Function
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
