import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Route Guard para verificar si el usuario está autenticado y tiene rol de administrador.
 * - Si está en estado de carga (verificando persistencia), muestra un spinner.
 * - Si no está autenticado, redirige a /login guardando la ubicación previa.
 * - Si está autenticado pero no es admin, redirige al Home (o vista no autorizada).
 * - Si es admin, renderiza los componentes hijos.
 */
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
