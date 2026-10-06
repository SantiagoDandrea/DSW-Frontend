// Panel de administración para crear, editar, listar y eliminar usuarios y gestionar sus roles.
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { usuarioService } from '../../services/usuarioService';
import { localidadService } from '../../services/localidadService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminAlert } from '../../components/admin/AdminAlert';

const INITIAL_FORM = {
  dni: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  rol: 'CLIENTE',
  localidadId: '',
};

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
      {label} {required && '*'}
    </label>
    <input
      required={required}
      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    />
  </div>
);

const SelectField = ({ label, required, options = [], helperText, ...props }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
      {label} {required && '*'}
    </label>
    <select
      required={required}
      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {helperText && <p className="text-[11px] text-amber-600 mt-1">{helperText}</p>}
  </div>
);

const validarPasswordFrontend = (password) => {
  if (!password || password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe tener al menos una mayúscula.';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe tener al menos una minúscula.';
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe tener al menos un número.';
  }
  return null;
};

export const AdminUsuariosPage = () => {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const [errorGlobal, setErrorGlobal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    let ignore = false;
    localidadService
      .getLocalidades()
      .then((data) => {
        if (!ignore) {
          const ordenadas = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
          setLocalidades(ordenadas);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorGlobal(err.message || 'Error al cargar localidades para los formularios.');
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    usuarioService
      .getUsuarios()
      .then((data) => {
        if (!ignore) {
          setUsuarios(data);
          setErrorGlobal(null);
        }
      })
      .catch((err) => {
        if (!ignore) setErrorGlobal(err.message || 'Error al obtener la lista de usuarios.');
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const recargar = () => setRefreshKey((k) => k + 1);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroRol && u.rol !== filtroRol) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideDni = u.dni?.toLowerCase().includes(q);
        const coincideNombre = u.nombre?.toLowerCase().includes(q);
        const coincideApellido = u.apellido?.toLowerCase().includes(q);
        const coincideEmail = u.email?.toLowerCase().includes(q);
        if (!coincideDni && !coincideNombre && !coincideApellido && !coincideEmail) return false;
      }
      return true;
    });
  }, [usuarios, filtroRol, busqueda]);

  const handleAbrirCrear = () => {
    setUsuarioAEditar(null);
    setFormData({
      ...INITIAL_FORM,
      localidadId: localidades[0]?.id || '',
    });
    setErrorModal(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (u) => {
    setUsuarioAEditar(u);
    setFormData({
      dni: u.dni,
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      email: u.email || '',
      telefono: u.telefono || '',
      password: '',
      rol: u.rol || 'CLIENTE',
      localidadId: u.localidad?.id || localidades[0]?.id || '',
    });
    setErrorModal(null);
    setModalAbierto(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      setErrorModal('Nombre, Apellido y Email son campos obligatorios.');
      return;
    }
    if (usuarioAEditar && usuarioAEditar.dni === usuarioActual?.dni && formData.rol !== 'ADMIN') {
      setErrorModal('No podés remover tu propio rol de ADMIN mientras estás en sesión.');
      return;
    }
    if (!usuarioAEditar) {
      const dniLimpio = formData.dni.trim();
      if (!dniLimpio) {
        setErrorModal('El DNI es obligatorio.');
        return;
      }
      if (!/^\d{7,8}$/.test(dniLimpio)) {
        setErrorModal('El DNI debe tener entre 7 y 8 dígitos numéricos.');
        return;
      }
    }
    if (!usuarioAEditar) {
      const errorPass = validarPasswordFrontend(formData.password);
      if (errorPass) {
        setErrorModal(errorPass);
        return;
      }
    }
    if (usuarioAEditar && formData.password.trim()) {
      const errorPass = validarPasswordFrontend(formData.password.trim());
      if (errorPass) {
        setErrorModal(errorPass);
        return;
      }
    }
    if (!formData.localidadId) {
      setErrorModal('Seleccione una localidad.');
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    try {
      if (usuarioAEditar) {
        const datosActualizar = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          rol: formData.rol,
          localidadId: Number(formData.localidadId),
        };
        if (formData.password.trim()) {
          datosActualizar.password = formData.password.trim();
        }
        await usuarioService.actualizarUsuario(usuarioAEditar.dni, datosActualizar);
        setMensajeExito(`Usuario ${formData.nombre} ${formData.apellido} actualizado.`);
      } else {
        await usuarioService.crearUsuario({
          dni: formData.dni.trim(),
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          password: formData.password,
          rol: formData.rol,
          localidadId: Number(formData.localidadId),
        });
        setMensajeExito(`Usuario ${formData.nombre} ${formData.apellido} registrado.`);
      }
      setModalAbierto(false);
      recargar();
    } catch (err) {
      setErrorModal(err.message || 'Error al procesar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    if (usuarioAEliminar.dni === usuarioActual?.dni) {
      setErrorGlobal('No podés eliminar tu propia cuenta mientras estás en sesión.');
      setUsuarioAEliminar(null);
      return;
    }

    setGuardando(true);
    setErrorGlobal(null);
    try {
      await usuarioService.eliminarUsuario(usuarioAEliminar.dni);
      setMensajeExito(`Usuario ${usuarioAEliminar.nombre} ${usuarioAEliminar.apellido} eliminado.`);
      setUsuarioAEliminar(null);
      recargar();
    } catch (err) {
      setErrorGlobal(err.message || 'Error al eliminar el usuario.');
      setUsuarioAEliminar(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administración de cuentas de clientes y administradores del sistema.
          </p>
        </div>
        <button
          onClick={handleAbrirCrear}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
        >
          + Nuevo Usuario
        </button>
      </div>

      <AdminAlert type="success" message={mensajeExito} onClose={() => setMensajeExito(null)} />
      <AdminAlert type="error" message={errorGlobal} onClose={() => setErrorGlobal(null)} />

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Buscar por DNI, nombre, apellido o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Todos los roles</option>
            <option value="CLIENTE">Clientes</option>
            <option value="ADMIN">Administradores</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
            <p className="text-sm">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">No se encontraron usuarios</p>
            <p className="text-xs text-gray-400 mt-1">Pruebe ajustando los términos de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">DNI</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Localidad</th>
                  <th className="px-5 py-3">Teléfono</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosFiltrados.map((u) => {
                  const esActual = u.dni === usuarioActual?.dni;
                  return (
                    <tr key={u.dni} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>{u.nombre} {u.apellido}</span>
                          {esActual && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded">Tú</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-700">{u.dni}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.rol === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {u.localidad?.nombre || '-'}
                      </td>
                      <td className="px-5 py-3">{u.telefono || '-'}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAbrirEditar(u)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setUsuarioAEliminar(u)}
                            disabled={esActual}
                            title={esActual ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={usuarioAEditar ? `Editar ${usuarioAEditar.nombre} ${usuarioAEditar.apellido}` : 'Nuevo Usuario'}
        subtitle={usuarioAEditar ? `DNI: ${usuarioAEditar.dni}` : 'Alta de cuenta y credenciales'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {errorModal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorModal}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="DNI"
              required={!usuarioAEditar}
              disabled={Boolean(usuarioAEditar)}
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              placeholder="Sin puntos ni espacios"
            />
            <SelectField
              label="Rol"
              required
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              disabled={Boolean(usuarioAEditar && usuarioAEditar.dni === usuarioActual?.dni)}
              helperText={
                usuarioAEditar && usuarioAEditar.dni === usuarioActual?.dni
                  ? 'No podés modificar tu propio rol en sesión.'
                  : undefined
              }
              options={[
                { value: 'CLIENTE', label: 'CLIENTE' },
                { value: 'ADMIN', label: 'ADMIN' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Nombre"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <InputField
              label="Apellido"
              required
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <InputField
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Localidad"
              required
              value={formData.localidadId}
              onChange={(e) => setFormData({ ...formData, localidadId: e.target.value })}
              options={localidades.map((loc) => ({
                value: loc.id,
                label: `${loc.nombre} (${loc.provincia})`,
              }))}
            />
            <InputField
              label={usuarioAEditar ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              type="password"
              required={!usuarioAEditar}
              placeholder={usuarioAEditar ? 'Dejar en blanco para no modificar' : 'Mín. 8 caracteres (mayús, minús, núm)'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              disabled={guardando}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : usuarioAEditar ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={Boolean(usuarioAEliminar)}
        onClose={() => setUsuarioAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        title={`¿Eliminar al usuario ${usuarioAEliminar?.nombre} ${usuarioAEliminar?.apellido}?`}
        message="Esta acción revocará el acceso del usuario a la plataforma. No se puede revertir."
        confirmText="Eliminar Cuenta"
        confirmVariant="danger"
        loading={guardando}
      />
    </div>
  );
};
