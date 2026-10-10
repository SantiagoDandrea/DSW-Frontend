// Barra de navegación superior que muestra el logo de la tienda, los accesos de usuario y el carrito de compras.
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Header = ({ cartCount = 0 }) => {
  const { usuario, isAuthenticated, esAdmin, logout } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white shadow-md print:hidden">
      <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
        MiTienda
      </Link>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        {isAuthenticated ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center text-sm font-medium text-gray-700">
              <Link to="/perfil" className="hover:text-indigo-600 transition">
                {usuario?.nombre || 'Usuario'}
              </Link>
              {esAdmin && (
                <Link
                  to="/admin"
                  className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                  title="Panel de Administración"
                >
                  Admin
                </Link>
              )}
            </span>
            <Link
              to="/mis-pedidos"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              Mis pedidos
            </Link>
            <button
              onClick={logout}
              className="text-xs font-medium text-gray-500 hover:text-red-600 px-2 py-1 rounded border border-gray-200 hover:border-red-200 transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition"
          >
            Iniciar sesión
          </Link>
        )}

        <Link
          to="/carrito"
          className="relative p-2 text-gray-600 hover:text-indigo-600 cursor-pointer"
          aria-label={
            cartCount > 0
              ? `Ver carrito de compras, ${cartCount} ${cartCount === 1 ? 'unidad' : 'unidades'}`
              : 'Ver carrito de compras'
          }
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
          {cartCount > 0 && (
            <span aria-hidden="true" className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};