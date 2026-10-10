// Pantalla del perfil de usuario para ver y actualizar datos personales, localidad o contraseña.
import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { localidadService } from '../services/localidadService';

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
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
        <p>Tenés que iniciar sesión para ver tu perfil.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mi Perfil</h1>
        <p className="text-sm text-gray-600 mb-6">DNI {usuario.dni}</p>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {exito && (
          <div role="status" className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            Perfil actualizado correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
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
              placeholder="Dejar en blanco para no cambiarla"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cargando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  );
};
