// Pantalla de registro de nuevos usuarios donde se completan los datos de la cuenta.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PROVINCIAS_ARGENTINA } from '../constants/provincias';
import { IconAlert } from '../components/Icons';

export const Register = () => {
  const [form, setForm] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    provincia: '',
    localidad: '',
    codigoPostal: '',
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await register({
        ...form,
        provincia: form.provincia.trim(),
        localidad: form.localidad.trim(),
        codigoPostal: form.codigoPostal.trim(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta. Revisá los datos ingresados.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-none border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-none bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xs font-display">
            M
          </div>
          <span className="inline-block px-3 py-1 rounded-none text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white mb-2">
            Alta de Cliente
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
            Crear Cuenta
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Completá tus datos para disfrutar de compras rápidas y seguimiento de pedidos
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-none font-sans flex items-center gap-2">
            <IconAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="dni">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="telefono">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                disabled={cargando}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="apellido">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                value={form.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                disabled={cargando}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="email">
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="password">
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="provincia">
              Provincia
            </label>
            <select
              id="provincia"
              name="provincia"
              required
              value={form.provincia}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              disabled={cargando}
            >
              <option value="" disabled>Seleccioná tu provincia</option>
              {PROVINCIAS_ARGENTINA.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="localidad">
                Localidad / Ciudad
              </label>
              <input
                id="localidad"
                name="localidad"
                type="text"
                required
                value={form.localidad}
                onChange={handleChange}
                placeholder="Ej: San Rafael, Rosario"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="codigoPostal">
                Código Postal
              </label>
              <input
                id="codigoPostal"
                name="codigoPostal"
                type="text"
                required
                value={form.codigoPostal}
                onChange={handleChange}
                placeholder="Ej: 5600"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                disabled={cargando}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-none shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
          >
            {cargando ? 'Registrando cuenta...' : 'Confirmar y Crear Cuenta'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 font-sans">
          ¿Ya tenés una cuenta registrada?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold underline underline-offset-4">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
};
