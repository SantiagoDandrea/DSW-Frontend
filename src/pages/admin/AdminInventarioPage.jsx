import { useState, useEffect, useMemo } from 'react';
import { stockService } from '../../services/stockService';
import { precioService } from '../../services/precioService';
import { productoService } from '../../services/productoService';
import { almacenService } from '../../services/almacenService';
import { SimpleCrudTable } from '../../components/admin/SimpleCrudTable';

export const AdminInventarioPage = () => {
  const [tabActiva, setTabActiva] = useState('stock'); // 'stock' | 'precios'
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      productoService.getProductos().catch(() => []),
      almacenService.getAlmacenes().catch(() => []),
    ]).then(([prods, alms]) => {
      if (!ignore) {
        setProductos(prods);
        setAlmacenes(alms);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const mapaProductos = useMemo(() => {
    const mapa = {};
    productos.forEach((p) => { mapa[p.id] = p; });
    return mapa;
  }, [productos]);

  const mapaAlmacenes = useMemo(() => {
    const mapa = {};
    almacenes.forEach((a) => { mapa[a.id] = a; });
    return mapa;
  }, [almacenes]);

  const servicios = useMemo(() => ({
    stock: {
      getAll: () => stockService.getStocks(),
      create: (data) =>
        stockService.crearStock({
          productoId: Number(data.productoId),
          almacenId: Number(data.almacenId),
          cantidad: Number(data.cantidad),
        }),
      update: (id, data) =>
        stockService.actualizarStock(id, {
          productoId: Number(data.productoId),
          almacenId: Number(data.almacenId),
          cantidad: Number(data.cantidad),
        }),
      delete: (id) => stockService.eliminarStock(id),
    },
    precios: {
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
    },
  }), []);

  const productoOptions = useMemo(
    () => productos.map((p) => ({ value: p.id, label: p.nombre })),
    [productos]
  );

  const almacenOptions = useMemo(
    () => almacenes.map((a) => ({ value: a.id, label: a.descripcion })),
    [almacenes]
  );

  const configStock = {
    title: 'Inventario de Stock',
    description: 'Control de unidades físicas disponibles por producto y almacén.',
    itemName: 'Stock',
    columns: [
      {
        key: 'producto',
        label: 'Producto',
        render: (s) => mapaProductos[s.productoId]?.nombre || s.producto?.nombre || `ID #${s.productoId}`,
      },
      {
        key: 'almacen',
        label: 'Almacén',
        render: (s) => mapaAlmacenes[s.almacenId]?.descripcion || s.almacen?.descripcion || `Almacén #${s.almacenId}`,
      },
      {
        key: 'cantidad',
        label: 'Cantidad',
        render: (s) => <span className="font-bold text-gray-900">{s.cantidad} un.</span>,
      },
    ],
    fields: [
      { name: 'productoId', label: 'Producto', type: 'select', required: true, options: productoOptions },
      { name: 'almacenId', label: 'Almacén', type: 'select', required: true, options: almacenOptions },
      { name: 'cantidad', label: 'Cantidad de unidades', type: 'number', required: true },
    ],
    service: servicios.stock,
  };

  const configPrecios = {
    title: 'Historial de Precios',
    description: 'Registro de precios comerciales y sus fechas de vigencia.',
    itemName: 'Precio',
    columns: [
      {
        key: 'producto',
        label: 'Producto',
        render: (p) => mapaProductos[p.productoId]?.nombre || `ID #${p.productoId}`,
      },
      {
        key: 'valor',
        label: 'Valor ($)',
        render: (p) => (
          <span className="font-bold text-gray-900">
            ${Number(p.valor).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: 'fechaDesde',
        label: 'Vigencia Desde',
        render: (p) => (p.fechaDesde ? new Date(p.fechaDesde).toLocaleString('es-AR') : '-'),
      },
    ],
    fields: [
      { name: 'productoId', label: 'Producto', type: 'select', required: true, options: productoOptions },
      { name: 'valor', label: 'Precio Comercial ($)', type: 'number', required: true },
      { name: 'fechaDesde', label: 'Fecha de Vigencia', type: 'datetime-local', required: true },
    ],
    service: servicios.precios,
  };

  return (
    <div className="space-y-6">
      {/* Selector de pestañas */}
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

      {/* Tabla ABM activa */}
      {tabActiva === 'stock' ? (
        <SimpleCrudTable key="stock" {...configStock} />
      ) : (
        <SimpleCrudTable key="precios" {...configPrecios} />
      )}
    </div>
  );
};
