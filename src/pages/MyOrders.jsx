// Pantalla del historial de pedidos del usuario, con filtros por estado, fechas y buscador.
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { pedidoService } from '../services/pedidoService';

function mostrarPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'EN_PREPARACION', label: 'En preparación' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const ESTADO_BADGES = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_PREPARACION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ENVIADO: 'bg-teal-50 text-teal-700 border-teal-200',
  ENTREGADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function MyOrders() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    let ignore = false;

    const params = usuario?.dni ? { usuario: usuario.dni } : {};

    pedidoService
      .getPedidos(params)
      .then((datos) => {
        if (!ignore) {
          const pedidosPropios = usuario?.dni
            ? (datos || []).filter((p) => p.cliente?.dni === usuario.dni)
            : datos || [];
          setPedidos(pedidosPropios);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'No pudimos cargar tus pedidos.');
        }
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [usuario?.dni]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const hayFiltrosActivos = Boolean(
    busqueda.trim() || filtroEstado || fechaDesde || fechaHasta
  );

  const rangoFechasInvalido = Boolean(
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
  );

  const pedidosFiltrados = useMemo(() => {
    if (rangoFechasInvalido) return [];

    return pedidos.filter((pedido) => {
      if (busqueda.trim()) {
        const termino = busqueda.trim().toLowerCase().replace(/^#/, '');
        const idCoincide = String(pedido.id).includes(termino);
        const medioPagoCoincide = (pedido.medioPago?.descripcion || '')
          .toLowerCase()
          .includes(termino);
        const domicilioCoincide = (pedido.envio?.domicilioEntrega || '')
          .toLowerCase()
          .includes(termino);

        if (!idCoincide && !medioPagoCoincide && !domicilioCoincide) {
          return false;
        }
      }

      if (filtroEstado && pedido.estado !== filtroEstado) {
        return false;
      }

      if (fechaDesde) {
        const fechaPedido = new Date(pedido.fecha);
        const desde = new Date(`${fechaDesde}T00:00:00`);
        if (fechaPedido < desde) return false;
      }

      if (fechaHasta) {
        const fechaPedido = new Date(pedido.fecha);
        const hasta = new Date(`${fechaHasta}T23:59:59.999`);
        if (fechaPedido > hasta) return false;
      }

      return true;
    });
  }, [pedidos, busqueda, filtroEstado, fechaDesde, fechaHasta, rangoFechasInvalido]);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Historial de compras, estados de entrega y seguimiento.
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          ← Volver a la tienda
        </Link>
      </div>

      {cargando ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-12 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
          <p className="text-sm font-medium">Cargando tus pedidos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p role="alert" className="text-red-700 text-sm font-medium mb-3">
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl">
            📦
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Todavía no tenés pedidos
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Cuando realices una compra, vas a poder seguir su estado y entrega desde acá.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label
                  htmlFor="busqueda-pedidos"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  Buscar en pedidos
                </label>
                <div className="relative">
                  <input
                    id="busqueda-pedidos"
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por #ID, medio de pago, domicilio..."
                    className="w-full px-3.5 py-2 pl-9 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <svg
                    className="w-4 h-4 text-gray-500 absolute left-3 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  htmlFor="filtro-estado"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  Estado
                </label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {ESTADOS.map((est) => (
                    <option key={est.value} value={est.value}>
                      {est.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {hayFiltrosActivos && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="w-full px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-sm font-semibold transition cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <label
                  htmlFor="fecha-desde"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Fecha desde
                </label>
                <input
                  id="fecha-desde"
                  type="date"
                  value={fechaDesde}
                  max={fechaHasta || undefined}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="fecha-hasta"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Fecha hasta
                </label>
                <input
                  id="fecha-hasta"
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {rangoFechasInvalido && (
              <p role="alert" className="text-sm text-rose-700">
                La fecha «Desde» no puede ser posterior a la fecha «Hasta». Corregí el rango para ver tus pedidos.
              </p>
            )}

            <div className="text-xs text-gray-500 pt-1 flex items-center justify-between">
              <span>
                Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
              </span>
              {hayFiltrosActivos && (
                <span className="text-indigo-600 font-medium">
                  Filtros activos
                </span>
              )}
            </div>
          </div>

          {pedidosFiltrados.length === 0 && rangoFechasInvalido ? null : pedidosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-10 text-center text-gray-500">
              <p className="text-base font-semibold text-gray-800">
                No encontramos pedidos con los filtros aplicados
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Probá cambiando los términos de búsqueda o limpiando los filtros.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => {
                const badgeClass =
                  ESTADO_BADGES[pedido.estado] ||
                  'bg-gray-50 text-gray-700 border-gray-200';
                const tieneEnvio = Boolean(pedido.envio);

                return (
                  <article
                    key={pedido.id}
                    className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 hover:border-indigo-200 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">
                          Pedido #{pedido.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
                        >
                          {pedido.estado.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {pedido.fecha
                          ? new Date(pedido.fecha).toLocaleString('es-AR', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                          Medio de Pago
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5">
                          {pedido.medioPago?.descripcion || 'No especificado'}
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                          Entrega
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5 truncate">
                          {tieneEnvio && pedido.envio.estado !== 'CANCELADO'
                            ? `Envío: ${pedido.envio.domicilioEntrega}`
                            : tieneEnvio
                              ? 'Retiro en sucursal (envío cancelado)'
                              : 'Retiro en sucursal'}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                          Total
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                          {mostrarPrecio(pedido.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                      <Link
                        to={`/pedidos/${pedido.id}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition"
                      >
                        Ver detalle del pedido →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}