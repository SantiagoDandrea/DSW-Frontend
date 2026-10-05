// Tabla genérica para listar, buscar, crear, editar y eliminar datos de cualquier entidad en el panel de administración.
import { useState, useEffect, useMemo } from 'react';
import { AdminModal } from './AdminModal';
import { ConfirmModal } from './ConfirmModal';
import { AdminAlert } from './AdminAlert';

export const SimpleCrudTable = ({
  title,
  description,
  itemName = 'Elemento',
  itemKey = 'id',
  columns = [],
  fields = [],
  service,
}) => {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemAEditar, setItemAEditar] = useState(null);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    service
      .getAll()
      .then((data) => {
        if (!ignore) {
          setItems(data || []);
          setErrorGlobal(null);
        }
      })
      .catch((err) => {
        if (!ignore) setErrorGlobal(err.message || `Error al cargar ${itemName.toLowerCase()}s.`);
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [service, itemName, refreshKey]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const recargar = () => setRefreshKey((k) => k + 1);

  const itemsFiltrados = useMemo(() => {
    if (!busqueda.trim()) return items;
    const q = busqueda.toLowerCase().trim();
    return items.filter((item) =>
      columns.some((col) => {
        let texto = '';
        if (col.searchValue) {
          texto = col.searchValue(item);
        } else if (item[col.key] !== undefined && item[col.key] !== null) {
          texto = String(item[col.key]);
        } else if (col.render) {
          const rendered = col.render(item);
          if (typeof rendered === 'string' || typeof rendered === 'number') {
            texto = String(rendered);
          } else if (rendered && rendered.props && rendered.props.children) {
            const ch = rendered.props.children;
            texto = Array.isArray(ch) ? ch.join(' ') : String(ch);
          }
        }
        return String(texto).toLowerCase().includes(q);
      })
    );
  }, [items, busqueda, columns]);

  const handleAbrirCrear = () => {
    const initialData = {};
    fields.forEach((f) => {
      initialData[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    setFormData(initialData);
    setItemAEditar(null);
    setErrorModal(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (item) => {
    const editData = {};
    fields.forEach((f) => {
      let val = item[f.name] !== undefined && item[f.name] !== null ? item[f.name] : '';
      if (f.type === 'datetime-local' && val) {
        const d = val instanceof Date ? val : new Date(val);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }
      editData[f.name] = val;
    });
    setFormData(editData);
    setItemAEditar(item);
    setErrorModal(null);
    setModalAbierto(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal(null);

    try {
      if (itemAEditar) {
        await service.update(itemAEditar[itemKey], formData);
        setMensajeExito(`${itemName} actualizado correctamente.`);
      } else {
        await service.create(formData);
        setMensajeExito(`${itemName} creado con éxito.`);
      }
      setModalAbierto(false);
      recargar();
    } catch (err) {
      setErrorModal(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!itemAEliminar) return;
    setGuardando(true);
    setErrorGlobal(null);

    try {
      await service.delete(itemAEliminar[itemKey]);
      setMensajeExito(`${itemName} eliminado correctamente.`);
      setItemAEliminar(null);
      recargar();
    } catch (err) {
      const msg = err.status === 409 || err.status === 400
        ? 'No se puede eliminar: tiene otros registros asociados (restricción de integridad).'
        : (err.message || `No se pudo eliminar el ${itemName.toLowerCase()}.`);
      setErrorGlobal(msg);
      setItemAEliminar(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden space-y-4">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <button
          onClick={handleAbrirCrear}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
        >
          <span>+</span>
          <span>Nuevo {itemName}</span>
        </button>
      </div>

      <div className="px-5 space-y-2">
        <AdminAlert type="success" message={mensajeExito} onClose={() => setMensajeExito(null)} />
        <AdminAlert type="error" message={errorGlobal} onClose={() => setErrorGlobal(null)} />
      </div>

      <div className="px-5">
        <input
          type="text"
          placeholder={`Buscar en ${title.toLowerCase()}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        {cargando ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
            <p className="text-sm">Cargando datos...</p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">No se encontraron registros</p>
            <p className="text-xs text-gray-400 mt-1">Cree un nuevo elemento o modifique la búsqueda.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-y border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-5 py-3">{col.label}</th>
                ))}
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itemsFiltrados.map((item) => (
                <tr key={item[itemKey]} className="hover:bg-gray-50 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3">
                      {col.render ? col.render(item) : (item[col.key] ?? '-')}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAbrirEditar(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setItemAEliminar(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={itemAEditar ? `Editar ${itemName}` : `Nuevo ${itemName}`}
        subtitle="Complete los campos solicitados"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {errorModal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{errorModal}</div>
          )}

          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  name={f.name}
                  required={f.required}
                  value={formData[f.name] ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="" disabled>Seleccione una opción</option>
                  {f.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={f.type || 'text'}
                  required={f.required}
                  placeholder={f.placeholder || ''}
                  value={formData[f.name] ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {f.helperText && <p className="text-xs text-gray-400 mt-1">{f.helperText}</p>}
            </div>
          ))}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
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
              {guardando ? 'Guardando...' : itemAEditar ? 'Guardar Cambios' : `Crear ${itemName}`}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={Boolean(itemAEliminar)}
        onClose={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        title={`¿Eliminar ${itemName.toLowerCase()}?`}
        message="Esta acción no se puede deshacer. Si posee registros vinculados, el sistema rechazará la eliminación para preservar la integridad referencial."
        confirmText="Eliminar"
        confirmVariant="danger"
        loading={guardando}
      />
    </div>
  );
};
