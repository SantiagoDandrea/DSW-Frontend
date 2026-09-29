import { useState, useEffect } from 'react';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { marcaService } from '../../services/marcaService';
import { proveedorService } from '../../services/proveedorService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminAlert } from '../../components/admin/AdminAlert';

const INITIAL_FORM = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
  marcaId: '',
  proveedorId: '',
  precio: '',
  imagenUrl: '',
};

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
      {label} {required && '*'}
    </label>
    <input
      required={required}
      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      {...props}
    />
  </div>
);

const SelectField = ({ label, required, options = [], ...props }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
      {label} {required && '*'}
    </label>
    <select
      required={required}
      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const AdminProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      categoriaService.getCategorias().catch(() => []),
      marcaService.getMarcas().catch(() => []),
      proveedorService.getProveedores().catch(() => []),
    ]).then(([cats, mrcs, provs]) => {
      if (!ignore) {
        setCategorias(cats);
        setMarcas(mrcs);
        setProveedores(provs);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const params = {};
    if (filtroNombre.trim()) params.nombre = filtroNombre.trim();
    if (filtroCategoria) params.categoriaId = filtroCategoria;
    if (filtroMarca) params.marcaId = filtroMarca;

    productoService
      .getProductos(params)
      .then((data) => {
        if (!ignore) {
          setProductos(data);
          setErrorGlobal(null);
        }
      })
      .catch((err) => {
        if (!ignore) setErrorGlobal(err.message || 'Error al cargar productos.');
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [filtroNombre, filtroCategoria, filtroMarca, refreshKey]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const recargar = () => setRefreshKey((k) => k + 1);

  const handleAbrirCrear = () => {
    setFormData({
      ...INITIAL_FORM,
      categoriaId: categorias[0]?.id || '',
      marcaId: marcas[0]?.id || '',
      proveedorId: proveedores[0]?.id || '',
    });
    setProductoAEditar(null);
    setErrorModal(null);
    setModalFormAbierto(true);
  };

  const handleAbrirEditar = (prod) => {
    setProductoAEditar(prod);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      categoriaId: prod.categoria?.id || categorias[0]?.id || '',
      marcaId: prod.marca?.id || marcas[0]?.id || '',
      proveedorId: prod.proveedor?.id || proveedores[0]?.id || '',
      precio: '',
      imagenUrl: '',
    });
    setErrorModal(null);
    setModalFormAbierto(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorModal('El nombre del producto es obligatorio.');
      return;
    }
    if (!formData.categoriaId || !formData.marcaId || !formData.proveedorId) {
      setErrorModal('Debe seleccionar categoría, marca y proveedor.');
      return;
    }
    if (!productoAEditar && (!formData.precio || Number(formData.precio) < 0)) {
      setErrorModal('Debe ingresar un precio inicial válido.');
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    try {
      if (productoAEditar) {
        await productoService.actualizarProducto(productoAEditar.id, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          categoriaId: Number(formData.categoriaId),
          marcaId: Number(formData.marcaId),
          proveedorId: Number(formData.proveedorId),
        });
        setMensajeExito(`Producto "${formData.nombre}" actualizado.`);
      } else {
        await productoService.crearProducto({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          categoriaId: Number(formData.categoriaId),
          marcaId: Number(formData.marcaId),
          proveedorId: Number(formData.proveedorId),
          precio: Number(formData.precio),
          ...(formData.imagenUrl.trim() && { imagenUrl: formData.imagenUrl.trim() }),
        });
        setMensajeExito(`Producto "${formData.nombre}" creado con éxito.`);
      }
      setModalFormAbierto(false);
      recargar();
    } catch (err) {
      setErrorModal(err.message || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;
    setGuardando(true);
    setErrorGlobal(null);
    try {
      await productoService.eliminarProducto(productoAEliminar.id);
      setMensajeExito(`Producto "${productoAEliminar.nombre}" eliminado.`);
      setProductoAEliminar(null);
      recargar();
    } catch (err) {
      setErrorGlobal(err.message || 'No se pudo eliminar el producto.');
      setProductoAEliminar(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catálogo de Productos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administración del catálogo comercial, categorías, marcas y precios.
          </p>
        </div>
        <button
          onClick={handleAbrirCrear}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Alertas */}
      <AdminAlert type="success" message={mensajeExito} onClose={() => setMensajeExito(null)} />
      <AdminAlert type="error" message={errorGlobal} onClose={() => setErrorGlobal(null)} />

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
          className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <button
          onClick={() => { setFiltroNombre(''); setFiltroCategoria(''); setFiltroMarca(''); }}
          className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold border border-gray-200 transition cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
            <p className="text-sm">Cargando catálogo...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">No se encontraron productos</p>
            <p className="text-xs text-gray-400 mt-1">Intente ajustar los filtros o cree un nuevo producto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Proveedor</th>
                  <th className="px-5 py-3">Precio Actual</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((prod) => {
                  const fotoMini = prod.imagenes?.[0]?.url;
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {fotoMini ? (
                              <img src={fotoMini} alt={prod.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">Sin foto</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-snug">{prod.nombre}</p>
                            {prod.descripcion && (
                              <p className="text-xs text-gray-400 line-clamp-1">{prod.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{prod.categoria?.nombre || '-'}</td>
                      <td className="px-5 py-3">{prod.marca?.nombre || '-'}</td>
                      <td className="px-5 py-3">{prod.proveedor?.nombre || '-'}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        ${Number(prod.precioActual || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAbrirEditar(prod)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setProductoAEliminar(prod)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition cursor-pointer"
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

      {/* Modal Crear / Editar */}
      <AdminModal
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        title={productoAEditar ? `Editar "${productoAEditar.nombre}"` : 'Nuevo Producto'}
        subtitle="Complete los datos comerciales del producto"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {errorModal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorModal}
            </div>
          )}

          <InputField
            label="Nombre"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej. Smart TV 55 Pulgadas 4K"
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Breve descripción o especificaciones"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectField
              label="Categoría"
              required
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
              options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            />
            <SelectField
              label="Marca"
              required
              value={formData.marcaId}
              onChange={(e) => setFormData({ ...formData, marcaId: e.target.value })}
              options={marcas.map((m) => ({ value: m.id, label: m.nombre }))}
            />
            <SelectField
              label="Proveedor"
              required
              value={formData.proveedorId}
              onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
              options={proveedores.map((p) => ({ value: p.id, label: p.nombre }))}
            />
          </div>

          {!productoAEditar && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <InputField
                label="Precio Inicial ($)"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                placeholder="0.00"
              />
              <InputField
                label="URL Imagen"
                type="url"
                value={formData.imagenUrl}
                onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalFormAbierto(false)}
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
              {guardando ? 'Guardando...' : productoAEditar ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={Boolean(productoAEliminar)}
        onClose={() => setProductoAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        title={`¿Eliminar "${productoAEliminar?.nombre}"?`}
        message="Esta acción eliminará el producto del catálogo. Si ya posee transacciones asociadas, se bloqueará la baja para proteger la integridad."
        confirmText="Eliminar Producto"
        confirmVariant="danger"
        loading={guardando}
      />
    </div>
  );
};
