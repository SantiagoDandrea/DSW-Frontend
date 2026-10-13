// Panel de administración para gestionar el stock de productos por almacén y los historiales de precios.
import { useState, useEffect, useMemo } from 'react';
import { stockService } from '../../services/stockService';
import { precioService } from '../../services/precioService';
import { productoService } from '../../services/productoService';
import { almacenService } from '../../services/almacenService';
import { SimpleCrudTable } from '../../components/admin/SimpleCrudTable';
import { AdminAlert } from '../../components/admin/AdminAlert';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const AdminInventarioPage = () => {
  const [tabActiva, setTabActiva] = useState('stock');
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [errorCatalogo, setErrorCatalogo] = useState(null);

  // Estado del selector de almacén y existencias para la pestaña de stock
  const [almacenSeleccionadoId, setAlmacenSeleccionadoId] = useState('');
  const [stocks, setStocks] = useState([]);
  const [ultimoAlmacenCargado, setUltimoAlmacenCargado] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [refreshStockKey, setRefreshStockKey] = useState(0);

  const cargandoStock = Boolean(
    almacenSeleccionadoId && ultimoAlmacenCargado !== almacenSeleccionadoId
  );

  // Modales de ajuste de stock
  const [modalStockAbierto, setModalStockAbierto] = useState(false);
  const [productoAjuste, setProductoAjuste] = useState(null);
  const [cantidadAjuste, setCantidadAjuste] = useState('');
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);
  const [errorModalStock, setErrorModalStock] = useState(null);
  const [mensajeExitoStock, setMensajeExitoStock] = useState(null);
  const [stockAEliminar, setStockAEliminar] = useState(null);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      productoService.getProductos(),
      almacenService.getAlmacenes(),
    ]).then(([prodsResult, almsResult]) => {
      if (ignore) return;
      const errores = [];
      if (prodsResult.status === 'fulfilled') {
        setProductos(prodsResult.value || []);
      } else {
        errores.push('productos');
      }
      if (almsResult.status === 'fulfilled') {
        const alms = almsResult.value || [];
        setAlmacenes(alms);
        if (alms.length > 0) {
          setAlmacenSeleccionadoId((prev) => prev || String(alms[0].id));
        }
      } else {
        errores.push('almacenes');
      }
      if (errores.length > 0) {
        setErrorCatalogo(`No se pudieron cargar los datos de ${errores.join(' y ')} para los selectores.`);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Cargar existencias de stock del almacén seleccionado
  useEffect(() => {
    if (!almacenSeleccionadoId) return;
    let ignore = false;
    stockService
      .getStocks({ almacenId: almacenSeleccionadoId })
      .then((data) => {
        if (!ignore) {
          setStocks(data || []);
          setUltimoAlmacenCargado(almacenSeleccionadoId);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorCatalogo(err.message || 'Error al cargar existencias de stock.');
          setUltimoAlmacenCargado(almacenSeleccionadoId);
        }
      });
    return () => {
      ignore = true;
    };
  }, [almacenSeleccionadoId, refreshStockKey]);

  useEffect(() => {
    if (mensajeExitoStock) {
      const timer = setTimeout(() => setMensajeExitoStock(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExitoStock]);

  const almacenActual = useMemo(() => {
    return almacenes.find((a) => String(a.id) === String(almacenSeleccionadoId));
  }, [almacenes, almacenSeleccionadoId]);

  const mapaStockPorProducto = useMemo(() => {
    const mapa = {};
    stocks.forEach((s) => {
      mapa[s.productoId] = s;
    });
    return mapa;
  }, [stocks]);

  const productosFiltradosStock = useMemo(() => {
    if (!busquedaProducto.trim()) return productos;
    const q = busquedaProducto.toLowerCase().trim();
    return productos.filter((p) =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.categoria?.nombre || '').toLowerCase().includes(q) ||
      (p.marca?.nombre || '').toLowerCase().includes(q)
    );
  }, [productos, busquedaProducto]);

  const handleAbrirAjuste = (prod) => {
    const stockExistente = mapaStockPorProducto[prod.id];
    setProductoAjuste(prod);
    setCantidadAjuste(stockExistente ? String(stockExistente.cantidad) : '0');
    setErrorModalStock(null);
    setModalStockAbierto(true);
  };

  const handleGuardarAjuste = async (e) => {
    e.preventDefault();
    if (cantidadAjuste === '' || Number(cantidadAjuste) < 0) {
      setErrorModalStock('Debe ingresar una cantidad entera válida mayor o igual a 0.');
      return;
    }

    setGuardandoAjuste(true);
    setErrorModalStock(null);

    const stockExistente = mapaStockPorProducto[productoAjuste.id];
    const nuevaCantidad = parseInt(cantidadAjuste, 10);

    try {
      if (stockExistente) {
        await stockService.actualizarStock(stockExistente.id, {
          productoId: productoAjuste.id,
          almacenId: Number(almacenSeleccionadoId),
          cantidad: nuevaCantidad,
        });
      } else {
        await stockService.crearStock({
          productoId: productoAjuste.id,
          almacenId: Number(almacenSeleccionadoId),
          cantidad: nuevaCantidad,
        });
      }

      setMensajeExitoStock(
        `Stock de "${productoAjuste.nombre}" actualizado a ${nuevaCantidad} un. en ${almacenActual?.descripcion || 'el almacén'}.`
      );
      setModalStockAbierto(false);
      setRefreshStockKey((k) => k + 1);
    } catch (err) {
      setErrorModalStock(err.message || 'Error al guardar el stock.');
    } finally {
      setGuardandoAjuste(false);
    }
  };

  const handleConfirmarEliminarStock = async () => {
    if (!stockAEliminar) return;
    setGuardandoAjuste(true);
    try {
      await stockService.eliminarStock(stockAEliminar.id);
      setMensajeExitoStock('Registro de stock eliminado.');
      setStockAEliminar(null);
      setModalStockAbierto(false);
      setRefreshStockKey((k) => k + 1);
    } catch (err) {
      setErrorModalStock(err.message || 'No se pudo eliminar el registro de stock.');
      setStockAEliminar(null);
    } finally {
      setGuardandoAjuste(false);
    }
  };

  // Configuración de la pestaña Historial de Precios (se mantiene idéntica para cumplir con el CRUD)
  const mapaProductos = useMemo(() => {
    const mapa = {};
    productos.forEach((p) => { mapa[p.id] = p; });
    return mapa;
  }, [productos]);

  const productoOptions = useMemo(
    () => productos.map((p) => ({ value: p.id, label: p.nombre })),
    [productos]
  );

  const serviciosPrecios = useMemo(() => ({
    getAll: () => precioService.getPrecios(),
    create: (data) =>
      precioService.crearPrecio({
        productoId: Number(data.productoId),
        valor: Number(data.valor),
        fechaDesde: new Date(data.fechaDesde).toISOString(),
      }),
    update: (id, data) =>
      precioService.actualizarPrecio(id, {
        productoId: Number(data.productoId),
        valor: Number(data.valor),
        fechaDesde: new Date(data.fechaDesde).toISOString(),
      }),
    delete: (id) => precioService.eliminarPrecio(id),
  }), []);

  const configPrecios = {
    title: 'Historial de Precios',
    description: 'Registro de precios comerciales y sus fechas de vigencia.',
    itemName: 'Precio',
    columns: [
      {
        key: 'producto',
        label: 'Producto',
        searchValue: (p) => mapaProductos[p.productoId]?.nombre || '',
        render: (p) => mapaProductos[p.productoId]?.nombre || `ID #${p.productoId}`,
      },
      {
        key: 'valor',
        label: 'Valor ($)',
        searchValue: (p) => String(p.valor),
        render: (p) => (
          <span className="font-bold text-gray-900">
            ${Number(p.valor).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: 'fechaDesde',
        label: 'Vigencia Desde',
        searchValue: (p) => (p.fechaDesde ? new Date(p.fechaDesde).toLocaleString('es-AR') : ''),
        render: (p) => (p.fechaDesde ? new Date(p.fechaDesde).toLocaleString('es-AR') : '-'),
      },
    ],
    fields: [
      { name: 'productoId', label: 'Producto', type: 'select', required: true, options: productoOptions },
      { name: 'valor', label: 'Precio Comercial ($)', type: 'number', required: true },
      { name: 'fechaDesde', label: 'Fecha de Vigencia', type: 'datetime-local', required: true },
    ],
    service: serviciosPrecios,
  };

  return (
    <div className="space-y-6">
      <AdminAlert type="error" message={errorCatalogo} onClose={() => setErrorCatalogo(null)} />
      <AdminAlert type="success" message={mensajeExitoStock} onClose={() => setMensajeExitoStock(null)} />

      <div className="bg-white p-2 rounded-xl shadow-xs border border-gray-200 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setTabActiva('stock')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
              tabActiva === 'stock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>📦</span>
            <span>Stock por Almacén</span>
          </button>
          <button
            onClick={() => setTabActiva('precios')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
              tabActiva === 'precios'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>💲</span>
            <span>Historial de Precios</span>
          </button>
        </div>
      </div>

      {tabActiva === 'stock' ? (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Stock por Almacén</h2>
              <p className="text-sm text-gray-500 mt-1">
                Visualice y ajuste las existencias disponibles por cada almacén o depósito.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="selector-almacen" className="text-xs font-bold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  Almacén:
                </label>
                <select
                  id="selector-almacen"
                  value={almacenSeleccionadoId}
                  onChange={(e) => setAlmacenSeleccionadoId(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {almacenes.length === 0 && <option value="">Sin almacenes registrados</option>}
                  {almacenes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Buscar producto..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-56"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {cargandoStock ? (
              <div className="p-12 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
                <p className="text-sm">Cargando inventario del almacén...</p>
              </div>
            ) : almacenes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-base font-semibold">No hay almacenes configurados</p>
                <p className="text-xs text-gray-500 mt-1">Cree al menos un almacén en la sección Tablas Maestras.</p>
              </div>
            ) : productosFiltradosStock.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-base font-semibold">No se encontraron productos</p>
                <p className="text-xs text-gray-500 mt-1">Intente ajustar los términos de búsqueda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Producto</th>
                      <th className="px-5 py-3">Categoría</th>
                      <th className="px-5 py-3">Almacén</th>
                      <th className="px-5 py-3 text-center">Stock Disponible</th>
                      <th className="px-5 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productosFiltradosStock.map((prod) => {
                      const stockExistente = mapaStockPorProducto[prod.id];
                      const cantidad = stockExistente ? stockExistente.cantidad : 0;
                      const fotoMini = prod.imagenes?.[0]?.url;

                      return (
                        <tr key={prod.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {fotoMini ? (
                                  <img src={fotoMini} alt={prod.nombre} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] text-gray-500">Sin foto</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 leading-snug">{prod.nombre}</p>
                                {prod.marca?.nombre && (
                                  <p className="text-xs text-gray-500">{prod.marca.nombre}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-700">
                            {prod.categoria?.nombre || '-'}
                          </td>
                          <td className="px-5 py-3 text-gray-700 font-medium">
                            {almacenActual?.descripcion || `Almacén #${almacenSeleccionadoId}`}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {cantidad > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                {cantidad} un.
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                0 un.
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleAbrirAjuste(prod)}
                              className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                            >
                              Ajustar Stock
                            </button>
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
            isOpen={modalStockAbierto}
            onClose={() => setModalStockAbierto(false)}
            title={productoAjuste ? `Ajustar Stock: "${productoAjuste.nombre}"` : 'Ajustar Stock'}
            subtitle={`Almacén: ${almacenActual?.descripcion || `ID #${almacenSeleccionadoId}`}`}
          >
            <form onSubmit={handleGuardarAjuste} className="space-y-4">
              {errorModalStock && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {errorModalStock}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1" htmlFor="input-cantidad-stock">
                  Cantidad de unidades en este almacén *
                </label>
                <input
                  id="input-cantidad-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={cantidadAjuste}
                  onChange={(e) => setCantidadAjuste(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingrese la cantidad física disponible en el depósito seleccionado. Si coloca 0, el producto figurará sin existencias.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                {productoAjuste && mapaStockPorProducto[productoAjuste.id] ? (
                  <button
                    type="button"
                    disabled={guardandoAjuste}
                    onClick={() => setStockAEliminar(mapaStockPorProducto[productoAjuste.id])}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    Eliminar registro
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalStockAbierto(false)}
                    disabled={guardandoAjuste}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoAjuste}
                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {guardandoAjuste ? 'Guardando...' : 'Guardar Stock'}
                  </button>
                </div>
              </div>
            </form>
          </AdminModal>

          <ConfirmModal
            isOpen={Boolean(stockAEliminar)}
            onClose={() => setStockAEliminar(null)}
            onConfirm={handleConfirmarEliminarStock}
            title="¿Eliminar registro de stock?"
            message="Esta acción removerá el registro de inventario de este producto en el almacén seleccionado (quedará con 0 unidades)."
            confirmText="Eliminar Registro"
            confirmVariant="danger"
            loading={guardandoAjuste}
          />
        </div>
      ) : (
        <SimpleCrudTable key="precios" {...configPrecios} />
      )}
    </div>
  );
};
