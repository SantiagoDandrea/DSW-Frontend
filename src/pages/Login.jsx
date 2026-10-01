import { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { login, isAuthenticated, esAdmin } = useAuth();
  const location = useLocation();

  // Si venía de una ruta protegida, siempre volvemos ahí; si no, según el rol.
  // Se recalcula en cada render, así que ya refleja el usuario recién logueado.
  const from = location.state?.from;
  const destino = from
    ? `${from.pathname}${from.search || ''}${from.hash || ''}`
    : (esAdmin ? '/admin' : '/');

  // Apenas isAuthenticated pasa a true (login exitoso), este componente se
  // vuelve a renderizar por el cambio en AuthContext y redirige acá.
  if (isAuthenticated) {
    return <Navigate to={destino} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ingresá a tu cuenta para gestionar tus compras
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-600">
          <div>
            ¿No tenés una cuenta?{' '}
            <Link to="/registro" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Registrate acá
            </Link>
          </div>
          <div>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-700">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
