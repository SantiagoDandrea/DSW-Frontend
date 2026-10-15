// Protector de rutas que verifica si el usuario inició sesión antes de dejarlo ingresar a la pantalla.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-blue-600 rounded-none animate-spin"></div>
        <p className="mt-3 text-xs font-sans font-bold uppercase tracking-wider text-slate-900">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
