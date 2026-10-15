// Panel de administración para crear, editar, eliminar y listar productos del catálogo junto a sus fotos.
import { useState, useEffect, useId } from 'react';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { marcaService } from '../../services/marcaService';
import { proveedorService } from '../../services/proveedorService';
import { almacenService } from '../../services/almacenService';
import { stockService } from '../../services/stockService';
import { precioService } from '../../services/precioService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminAlert } from '../../components/admin/AdminAlert';
import { IconPlus, IconSearch } from '../../components/Icons';

const INITIAL_FORM = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
  marcaId: '',
  proveedorId: '',
  precio: '',
  imagenUrl: '',
  almacenId: '',
  stockInicial: '',
};

const InputField = ({ label, required, ...props }) => {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        required={required}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
        {...props}
      />
    </div>
  );
};

const SelectField = ({ label, required, options = [], ...props }) => {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
        {label} {required && '*'}
      </label>
      <select
        id={id}
        required={required}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export const AdminProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [busquedaInput, setBusquedaInput] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroNombre(busquedaInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [busquedaInput]);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [imagenesProducto, setImagenesProducto] = useState([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');
  const [guardandoImagen, setGuardandoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState('');
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      categoriaService.getCategorias(),
      marcaService.getMarcas(),
      proveedorService.getProveedores(),
      almacenService.getAlmacenes(),
    ]).then(([catsResult, mrcsResult, provsResult, almResult]) => {
      if (ignore) return;
      const errores = [];
      if (catsResult.status === 'fulfilled') setCategorias(catsResult.value || []);
      else errores.push('categorías');
      if (mrcsResult.status === 'fulfilled') setMarcas(mrcsResult.value || []);
      else errores.push('marcas');
      if (provsResult.status === 'fulfilled') setProveedores(provsResult.value || []);
      else errores.push('proveedores');
      if (almResult.status === 'fulfilled') setAlmacenes(almResult.value || []);
      else errores.push('almacenes');

      if (errores.length > 0) {
        setErrorGlobal(`No se pudieron cargar los datos de ${errores.join(', ')} para los selectores.`);
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
      proveedorId: '',
      almacenId: almacenes[0]?.id || '',
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
      proveedorId: prod.proveedor?.id ? String(prod.proveedor.id) : '',
      precio: prod.precioActual != null ? String(prod.precioActual) : '',
      imagenUrl: '',
      almacenId: '',
      stockInicial: '',
    });
    setImagenesProducto(prod.imagenes || []);
    setNuevaImagenUrl('');
    setErrorImagen('');
    setErrorModal(null);
    setModalFormAbierto(true);
  };

  const handleAgregarImagen = async () => {
    if (!nuevaImagenUrl.trim() || !productoAEditar) return;

    setGuardandoImagen(true);
    setErrorImagen('');

    try {
      const imagen = await productoService.agregarImagen(productoAEditar.id, {
        url: nuevaImagenUrl.trim(),
      });
      setImagenesProducto((prev) => [...prev, imagen]);
      setNuevaImagenUrl('');
      recargar();
    } catch (err) {
      setErrorImagen(err.message || 'No se pudo agregar la imagen.');
    } finally {
      setGuardandoImagen(false);
    }
  };

  const handleEliminarImagen = async (imagenId) => {
    setGuardandoImagen(true);
    setErrorImagen('');

    try {
      await productoService.eliminarImagen(imagenId);
      setImagenesProducto((prev) => prev.filter((img) => img.id !== imagenId));
      recargar();
    } catch (err) {
      setErrorImagen(err.message || 'No se pudo eliminar la imagen.');
    } finally {
      setGuardandoImagen(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorModal('El nombre del producto es obligatorio.');
      return;
    }
    if (!formData.categoriaId || !formData.marcaId) {
      setErrorModal('Debe seleccionar categoría y marca.');
      return;
    }
    if (!formData.precio || Number(formData.precio) < 0) {
      setErrorModal('Debe ingresar un precio válido.');
      return;
    }

    if (!productoAEditar) {
      if (formData.stockInicial && Number(formData.stockInicial) > 0 && !formData.almacenId) {
        setErrorModal('Debe seleccionar un almacén si ingresa stock inicial.');
        return;
      }
      if (formData.almacenId && (!formData.stockInicial || Number(formData.stockInicial) < 0)) {
        setErrorModal('Debe indicar la cantidad de stock inicial para el almacén seleccionado.');
        return;
      }
    }

    setGuardando(true);
    setErrorModal(null);

    const proveedorIdLimpio = formData.proveedorId ? Number(formData.proveedorId) : null;

    try {
      if (productoAEditar) {
        await productoService.actualizarProducto(productoAEditar.id, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          categoriaId: Number(formData.categoriaId),
          marcaId: Number(formData.marcaId),
          proveedorId: proveedorIdLimpio,
        });

        const nuevoPrecio = Number(formData.precio);
        if (nuevoPrecio >= 0 && nuevoPrecio !== Number(productoAEditar.precioActual)) {
          await precioService.crearPrecio({
            productoId: productoAEditar.id,
            valor: nuevoPrecio,
            fechaDesde: new Date().toISOString(),
          });
        }

        setMensajeExito(`Producto "${formData.nombre}" actualizado.`);
      } else {
        const nuevoProd = await productoService.crearProducto({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          categoriaId: Number(formData.categoriaId),
          marcaId: Number(formData.marcaId),
          proveedorId: proveedorIdLimpio,
          precio: Number(formData.precio),
        });

        if (formData.imagenUrl && formData.imagenUrl.trim()) {
          try {
            await productoService.agregarImagen(nuevoProd.id, {
              url: formData.imagenUrl.trim(),
            });
          } catch (imgErr) {
            console.error('Error al registrar imagen inicial:', imgErr);
          }
        }

        if (formData.stockInicial && Number(formData.stockInicial) > 0 && formData.almacenId) {
          try {
            await stockService.crearStock({
              productoId: nuevoProd.id,
              almacenId: Number(formData.almacenId),
              cantidad: Number(formData.stockInicial),
            });
          } catch (stockErr) {
            console.error('Error al registrar stock inicial:', stockErr);
          }
        }

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
      <div className="bg-white p-6 rounded-none border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black uppercase text-slate-950 tracking-tight">Catálogo de Productos</h2>
          <p className="text-xs font-sans text-slate-500 mt-1">
            Administración del catálogo comercial, categorías, marcas y precios.
          </p>
        </div>
        <button
          onClick={handleAbrirCrear}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-none shadow-xs transition cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <AdminAlert type="success" message={mensajeExito} onClose={() => setMensajeExito(null)} />
      <AdminAlert type="error" message={errorGlobal} onClose={() => setErrorGlobal(null)} />

      <div className="bg-white p-4 sm:p-5 rounded-none border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-center font-sans">
        <div className="relative">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            aria-label="Buscar productos por nombre"
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
          />
        </div>
        <select
          aria-label="Filtrar por categoría"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar por marca"
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <button
          onClick={() => { setBusquedaInput(''); setFiltroNombre(''); setFiltroCategoria(''); setFiltroMarca(''); }}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-none text-xs font-sans font-medium uppercase tracking-wider transition cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="bg-white rounded-none border border-slate-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Cargando catálogo...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            <p className="text-base font-bold uppercase text-slate-900">No se encontraron productos</p>
            <p className="text-xs text-slate-500 mt-1">Intente ajustar los filtros o cree un nuevo producto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 font-sans">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3">Producto</th>
                  <th scope="col" className="px-5 py-3">Categoría</th>
                  <th scope="col" className="px-5 py-3">Marca</th>
                  <th scope="col" className="px-5 py-3">Proveedor</th>
                  <th scope="col" className="px-5 py-3">Precio Actual</th>
                  <th scope="col" className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((prod) => {
                  const fotoMini = prod.imagenes?.[0]?.url;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {fotoMini ? (
                              <img src={fotoMini} alt={prod.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-slate-400">Sin foto</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950 leading-snug">{prod.nombre}</p>
                            {prod.descripcion && (
                              <p className="text-xs text-slate-500 line-clamp-1">{prod.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{prod.categoria?.nombre || '-'}</td>
                      <td className="px-5 py-3">{prod.marca?.nombre || '-'}</td>
                      <td className="px-5 py-3">{prod.proveedor?.nombre || '-'}</td>
                      <td className="px-5 py-3 font-bold text-slate-950 font-sans">
                        ${Number(prod.precioActual || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAbrirEditar(prod)}
                            className="px-2.5 py-1 text-xs font-bold uppercase text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-none transition cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setProductoAEliminar(prod)}
                            className="px-2.5 py-1 text-xs font-bold uppercase text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-none transition cursor-pointer"
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
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        title={productoAEditar ? `Editar "${productoAEditar.nombre}"` : 'Nuevo Producto'}
        subtitle="Complete los datos comerciales del producto"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 font-sans">
          {errorModal && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-950 font-bold text-xs rounded-none">
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
            <label htmlFor="producto-descripcion" className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">Descripción</label>
            <textarea
              id="producto-descripcion"
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
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
              label="Proveedor (opcional)"
              value={formData.proveedorId}
              onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
              options={[
                { value: '', label: 'Sin proveedor' },
                ...proveedores.map((p) => ({ value: p.id, label: p.nombre })),
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <InputField
              label={productoAEditar ? 'Precio ($)' : 'Precio Inicial ($)'}
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              placeholder="0.00"
            />
            {!productoAEditar && (
              <InputField
                label="URL Imagen"
                type="url"
                value={formData.imagenUrl}
                onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            )}
          </div>

          {!productoAEditar && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <SelectField
                label="Almacén para stock inicial"
                value={formData.almacenId}
                onChange={(e) => setFormData({ ...formData, almacenId: e.target.value })}
                options={[
                  { value: '', label: 'Sin stock inicial' },
                  ...almacenes.map((a) => ({
                    value: a.id,
                    label: a.descripcion || `Almacén #${a.id}`,
                  })),
                ]}
              />
              <InputField
                label="Stock Inicial (unidades)"
                type="number"
                min="0"
                value={formData.stockInicial}
                onChange={(e) => setFormData({ ...formData, stockInicial: e.target.value })}
                placeholder="0"
              />
            </div>
          )}

          {productoAEditar && (
            <div className="pt-2 border-t border-slate-200 font-sans">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Imágenes
              </p>

              {imagenesProducto.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {imagenesProducto.map((img) => (
                    <li
                      key={img.id}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-none px-3 py-2"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-10 h-10 object-cover rounded-none border border-slate-200"
                      />
                      <span className="flex-1 text-xs text-slate-700 truncate">
                        {img.url}
                      </span>
                      <button
                        type="button"
                        disabled={guardandoImagen}
                        onClick={() => handleEliminarImagen(img.id)}
                        className="text-xs font-bold uppercase text-rose-700 hover:text-rose-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {errorImagen && (
                <p role="alert" className="text-xs text-rose-700 mb-2 font-bold">
                  {errorImagen}
                </p>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  aria-label="Dirección (URL) de la nueva imagen"
                  value={nuevaImagenUrl}
                  onChange={(e) => setNuevaImagenUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  disabled={guardandoImagen || !nuevaImagenUrl.trim()}
                  onClick={handleAgregarImagen}
                  className="px-5 py-2 bg-blue-600 text-white rounded-none text-xs font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setModalFormAbierto(false)}
              disabled={guardando}
              className="px-5 py-2 text-xs font-sans font-medium uppercase tracking-wider text-slate-700 bg-white border border-slate-300 rounded-none hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : productoAEditar ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </AdminModal>

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
