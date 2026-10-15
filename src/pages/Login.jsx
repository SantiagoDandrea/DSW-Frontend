// Pantalla de inicio de sesión con diseño moderno, inputs accesibles y manejo de credenciales.
import { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { IconAlert } from '../components/Icons';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { login, isAuthenticated, esAdmin, sesionVencida } = useAuth();
  const location = useLocation();

  const from = location.state?.from;
  const destino = from
    ? `${from.pathname}${from.search || ''}${from.hash || ''}`
    : (esAdmin ? '/admin' : '/');

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
      setError(err.message || 'Credenciales inválidas. Verificá tu correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-none border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-none bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xs font-display">
            M
          </div>
          <span className="inline-block px-3 py-1 rounded-none text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white mb-2">
            Identificación de Usuario
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Ingresá a tu cuenta para continuar tus compras y pedidos
          </p>
        </div>

        {sesionVencida && !error && (
          <div role="status" className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-none font-sans flex items-center gap-2">
            <IconAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {sesionVencida === 'desactivada'
                ? 'Tu cuenta fue desactivada. Contactá al administrador.'
                : 'Tu sesión venció. Volvé a iniciar sesión para continuar.'}
            </span>
          </div>
        )}

        {error && (
          <div role="alert" className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-none font-sans flex items-center gap-2">
            <IconAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-none shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-center gap-2.5 text-xs text-slate-500 text-center font-sans">
          <div>
            ¿No tenés una cuenta?{' '}
            <Link to="/registro" className="text-blue-600 hover:text-blue-800 font-bold underline underline-offset-4">
              Registrate acá
            </Link>
          </div>
          <div>
            <Link to="/" className="text-slate-400 hover:text-slate-700 transition">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
