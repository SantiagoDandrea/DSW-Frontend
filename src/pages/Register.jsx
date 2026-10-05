// Pantalla de registro de nuevos usuarios donde se completan los datos de la cuenta.
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { localidadService } from '../services/localidadService';

export const Register = () => {
  const [form, setForm] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    localidadId: '',
  });
  const [localidades, setLocalidades] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    localidadService.getLocalidades()
      .then((data) => {
        if (!ignore) {
          setLocalidades(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await register({ ...form, localidadId: Number(form.localidadId) });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta. Revisá los datos ingresados.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-sm text-gray-600 mt-1">
            Registrate para empezar a comprar
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dni">
                DNI
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                pattern="[0-9]{7,8}"
                title="7 u 8 dígitos numéricos"
                value={form.dni}
                onChange={handleChange}
                placeholder="30111222"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefono">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                required
                value={form.telefono}
                onChange={handleChange}
                placeholder="3471112233"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={cargando}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="apellido">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                value={form.apellido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={cargando}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              required
              minLength={8}
              title="Mínimo 8 caracteres, con mayúscula, minúscula y número"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="localidadId">
              Localidad
            </label>
            <select
              id="localidadId"
              name="localidadId"
              required
              value={form.localidadId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={cargando}
            >
              <option value="" disabled>Seleccioná tu localidad</option>
              {localidades.map((localidad) => (
                <option key={localidad.id} value={localidad.id}>
                  {localidad.nombre} ({localidad.provincia})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cargando ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
};
