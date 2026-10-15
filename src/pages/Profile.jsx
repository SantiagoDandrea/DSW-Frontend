// Pantalla del perfil de usuario para ver y actualizar datos personales, localidad o contraseña.
import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { localidadService } from '../services/localidadService';
import { IconAlert, IconCheck } from '../components/Icons';

export const Profile = () => {
  const { usuario, actualizarPerfil } = useAuth();
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    email: usuario?.email || '',
    telefono: usuario?.telefono || '',
    localidadId: usuario?.localidad?.id || '',
    password: '',
  });
  const [localidades, setLocalidades] = useState([]);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

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
    setExito(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(false);
    setCargando(true);

    const { password, ...resto } = form;
    const datos = {
      ...resto,
      localidadId: Number(resto.localidadId),
    };
    if (password) {
      datos.password = password;
    }

    try {
      await actualizarPerfil(datos);
      setForm((prev) => ({ ...prev, password: '' }));
      setExito(true);
    } catch (err) {
      setError(err.message || 'No pudimos actualizar tu perfil.');
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) {
    return (
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Tenés que iniciar sesión para visualizar tu perfil de usuario.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header de Mi Cuenta */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold uppercase tracking-widest bg-blue-600 text-white mb-2">
          Mi Cuenta
        </span>
        <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-950 tracking-tight uppercase">
          Perfil de Usuario
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Administrá tus datos personales, información de contacto y credenciales de acceso.
        </p>
      </div>

      <div className="bg-white rounded-none border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner de Identidad del Cliente */}
        <div className="p-6 sm:p-8 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-none bg-blue-600 border border-white flex items-center justify-center text-white font-black text-2xl font-display">
              {usuario.nombre ? usuario.nombre[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-display font-black tracking-tight uppercase">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                DNI: {usuario.dni} • {usuario.email}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">Localidad asignada</span>
            <span className="text-sm font-bold text-white uppercase">
              {usuario.localidad ? `${usuario.localidad.nombre} (${usuario.localidad.provincia})` : 'Sin asignar'}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-none flex items-center gap-3">
              <IconAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {exito && (
            <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-none font-bold flex items-center gap-3">
              <IconCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Tus datos fueron actualizados correctamente.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-display font-black uppercase text-slate-950 border-b border-slate-200 pb-2 mb-4">
                Datos Personales y Contacto
              </h3>

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
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    disabled={cargando}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="telefono">
                    Teléfono de Contacto
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="localidadId">
                  Localidad de Entrega Habitual
                </label>
                <select
                  id="localidadId"
                  name="localidadId"
                  required
                  value={form.localidadId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-display font-black uppercase text-slate-950 mb-1">
                Seguridad de la Cuenta
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Completá este campo solo si deseás cambiar tu contraseña de acceso.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="password">
                  Nueva contraseña (opcional)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  title="Mínimo 8 caracteres, con mayúscula, minúscula y número"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para conservar la actual"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  disabled={cargando}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={cargando}
                className="w-full sm:w-auto py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-none shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {cargando ? 'Guardando cambios...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
