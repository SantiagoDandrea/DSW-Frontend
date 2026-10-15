// Pantalla del historial de pedidos del usuario, con filtros por estado, fechas y buscador.
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { pedidoService } from '../services/pedidoService';
import {
  IconPackage,
  IconSearch,
  IconClose,
  IconCreditCard,
  IconTruck,
  IconStore,
} from '../components/Icons';

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
  PENDIENTE: 'bg-amber-100 text-amber-950 border-amber-900',
  CONFIRMADO: 'bg-sky-100 text-sky-950 border-sky-900',
  EN_PREPARACION: 'bg-blue-100 text-blue-950 border-blue-900',
  ENVIADO: 'bg-purple-100 text-purple-950 border-purple-900',
  ENTREGADO: 'bg-emerald-100 text-emerald-950 border-emerald-900',
  CANCELADO: 'bg-rose-100 text-rose-950 border-rose-900',
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

    pedidoService.getPedidos(params)
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
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-none text-xs font-sans font-bold uppercase tracking-wider bg-blue-600 text-white mb-2">
            Registro de Cliente
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display uppercase">
            Mis Pedidos
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Historial de compras, comprobantes oficiales y seguimiento en tiempo real.
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-sans font-medium text-slate-600 hover:text-blue-600 transition"
        >
          ← Volver a la tienda
        </Link>
      </div>

      {cargando ? (
        <div className="bg-white rounded-none border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <div className="inline-block h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-none animate-spin mb-3" />
          <p className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900">Cargando historial de pedidos...</p>
        </div>
      ) : error ? (
        <div role="alert" className="bg-rose-50 border border-rose-200 rounded-none p-8 text-center max-w-md mx-auto shadow-xs">
          <p className="text-rose-950 text-xs font-sans font-bold mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-none border border-slate-200 p-12 sm:p-16 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <IconPackage className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1 font-display uppercase">
            Todavía no tenés pedidos registrados
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-sans">
            Cuando realices una compra, vas a poder descargar tus comprobantes y hacer el seguimiento desde acá.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition"
          >
            Ver Categorías
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filtros de búsqueda */}
          <div className="bg-white p-5 sm:p-6 rounded-none border border-slate-200 shadow-xs space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-6">
                <label
                  htmlFor="busqueda-pedidos"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Buscar en pedidos
                </label>
                <div className="relative">
                  <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="busqueda-pedidos"
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por #ID, medio de pago o domicilio..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label
                  htmlFor="filtro-estado"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Estado
                </label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition cursor-pointer"
                >
                  {ESTADOS.map((est) => (
                    <option key={est.value} value={est.value}>
                      {est.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                {hayFiltrosActivos ? (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-none text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconClose className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                ) : (
                  <div className="hidden md:block h-10" />
                )}
              </div>
            </div>

            {/* Filtro de Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label
                  htmlFor="fecha-desde"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Fecha desde
                </label>
                <input
                  id="fecha-desde"
                  type="date"
                  value={fechaDesde}
                  max={fechaHasta || undefined}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="fecha-hasta"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Fecha hasta
                </label>
                <input
                  id="fecha-hasta"
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {rangoFechasInvalido && (
              <p role="alert" className="text-xs text-rose-600 font-bold pt-1">
                La fecha «Desde» no puede ser posterior a la fecha «Hasta».
              </p>
            )}

            <div className="text-xs text-slate-500 pt-2 flex items-center justify-between border-t border-slate-100">
              <span>
                Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
              </span>
              {hayFiltrosActivos && (
                <span className="text-blue-600 font-bold uppercase">
                  Filtros activos
                </span>
              )}
            </div>
          </div>

          {/* Lista de Pedidos */}
          {pedidosFiltrados.length === 0 && !rangoFechasInvalido ? (
            <div className="bg-white rounded-none border border-slate-200 p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
              <p className="text-sm font-bold text-slate-900 uppercase">
                No encontramos pedidos con estos filtros
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-5 font-sans">
                Modificá las fechas o limpiá los términos de búsqueda.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-none text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => {
                const badgeClass =
                  ESTADO_BADGES[pedido.estado] ||
                  'bg-slate-100 text-slate-900 border-slate-200';
                const tieneEnvio = Boolean(pedido.envio);
                const tieneEnvioValido =
                  tieneEnvio && pedido.envio.estado !== 'CANCELADO';

                return (
                  <article
                    key={pedido.id}
                    className="bg-white rounded-none border border-slate-200 hover:border-slate-300 p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-900 font-display">
                          ORDEN #{pedido.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-none text-[11px] font-sans font-bold uppercase tracking-wider border ${badgeClass}`}
                        >
                          {pedido.estado === 'ENVIADO' && !tieneEnvioValido
                            ? 'Listo para retiro'
                            : pedido.estado.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-sans text-slate-500">
                        {pedido.fecha
                          ? new Date(pedido.fecha).toLocaleString('es-AR', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-5 font-sans">
                      <div>
                        <span className="font-medium uppercase tracking-wider text-slate-400 block mb-1">
                          Medio de Pago
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <IconCreditCard className="w-4 h-4 text-blue-600" />
                          <span>{pedido.medioPago?.descripcion || 'No especificado'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium uppercase tracking-wider text-slate-400 block mb-1">
                          Modalidad de Entrega
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                          {tieneEnvioValido ? (
                            <>
                              <IconTruck className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="truncate">Envío: {pedido.envio.domicilioEntrega}</span>
                            </>
                          ) : (
                            <>
                              <IconStore className="w-4 h-4 text-blue-600 shrink-0" />
                              <span>{tieneEnvio ? 'Retiro (envío cancelado)' : 'Retiro en sucursal (Las Parejas)'}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="font-medium uppercase tracking-wider text-slate-400 block mb-1">
                          Total Liquidado
                        </span>
                        <p className="text-xl font-black text-slate-900 font-display">
                          {mostrarPrecio(pedido.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                      <Link
                        to={`/pedidos/${pedido.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-none shadow-xs transition"
                      >
                        <span>Ver detalle y comprobante</span>
                        <span>→</span>
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