// Hook personalizado para acceder fácilmente a la sesión del usuario y funciones de autenticación.
import { useContext } from 'react';
import { AuthContext } from './auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
