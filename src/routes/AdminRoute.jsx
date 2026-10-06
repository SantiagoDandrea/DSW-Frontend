// Protector de rutas que asegura que solo los usuarios administradores puedan acceder a la pantalla.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, esAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-gray-500 font-medium">Verificando permisos...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
