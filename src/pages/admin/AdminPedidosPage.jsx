import { useState, useEffect, useMemo } from 'react';
import { pedidoService } from '../../services/pedidoService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminAlert } from '../../components/admin/AdminAlert';
import { IconTruck, IconStore } from '../../components/Icons';

function agruparDetalles(detalles) {
  if (!Array.isArray(detalles)) return [];
  const mapa = new Map();
  for (const det of detalles) {
    const key = det.productoId ?? det.producto?.id ?? det.id;
    if (!mapa.has(key)) {
      mapa.set(key, { ...det });
    } else {
      const item = mapa.get(key);
      item.cantidad = (item.cantidad || 0) + (det.cantidad || 0);
      item.subtotal = (item.subtotal || 0) + (det.subtotal || 0);
    }
  }
  return Array.from(mapa.values());
}

const TRANSICIONES_PERMITIDAS = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADOS_CANCELABLES = ['PENDIENTE', 'CONFIRMADO'];

const ESTADOS_INFO = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  EN_PREPARACION: { label: 'En Preparación', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  ENVIADO: { label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ENTREGADO: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELADO: { label: 'Cancelado', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const getEstadoInfo = (estado, tieneEnvio) => {
  if (estado === 'ENVIADO' && !tieneEnvio) {
    return { label: 'Listo para Retiro', color: 'bg-teal-100 text-teal-800 border-teal-200' };
  }
  return ESTADOS_INFO[estado] || { label: estado, color: 'bg-gray-100 text-gray-800' };
};

export const AdminPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filtros, setFiltros] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  // El backend solo filtra por DNI exacto, así que el cliente se filtra acá sobre la lista ya cargada
  const [usuarioInput, setUsuarioInput] = useState('');

  const rangoFechasInvalido = Boolean(
    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta
  );

  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const detallesVisuales = agruparDetalles(pedidoDetalle?.detalles);

  const [pedidoACambiarEstado, setPedidoACambiarEstado] = useState(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('');
  const [pedidoACancelar, setPedidoACancelar] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    if (rangoFechasInvalido) return;

    let ignore = false;

    const params = {};
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.fechaDesde) {
      const [y, m, d] = filtros.fechaDesde.split('-').map(Number);
      params.fechaDesde = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
    }
    if (filtros.fechaHasta) {
      const [y, m, d] = filtros.fechaHasta.split('-').map(Number);
      params.fechaHasta = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
    }

    pedidoService
      .getPedidos(params)
      .then((data) => {
        if (!ignore) {
          setPedidos(data);
          setErrorGlobal(null);
        }
      })
      .catch((err) => {
        if (!ignore) setErrorGlobal(err.message || 'Error al cargar pedidos.');
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [filtros, rangoFechasInvalido, refreshKey]);

  const pedidosVisibles = useMemo(() => {
    if (rangoFechasInvalido) return [];

    const texto = usuarioInput.trim().toLowerCase();
    if (!texto) return pedidos;

    return pedidos.filter((p) => {
      const cliente = p.cliente;
      if (!cliente) return false;
      const nombreCompleto = `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.toLowerCase();
      return (
        nombreCompleto.includes(texto) ||
        String(cliente.dni ?? '').includes(texto)
      );
    });
  }, [pedidos, usuarioInput, rangoFechasInvalido]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const recargar = () => setRefreshKey((k) => k + 1);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ estado: '', fechaDesde: '', fechaHasta: '' });
    setUsuarioInput('');
  };

  const handleVerDetalle = async (pedidoId) => {
    try {
      const fullPedido = await pedidoService.getPedidoById(pedidoId);
      setPedidoDetalle(fullPedido);
    } catch (err) {
      setErrorGlobal(err.message || 'Error al obtener detalle del pedido.');
    }
  };

  const handleAbrirCambiarEstado = (p) => {
    const permitidos = TRANSICIONES_PERMITIDAS[p.estado] || [];
    setPedidoACambiarEstado(p);
    setNuevoEstadoSeleccionado(permitidos[0] || '');
    setErrorModal(null);
  };

  const handleConfirmarCambioEstado = async (e) => {
    e.preventDefault();
    if (!pedidoACambiarEstado || !nuevoEstadoSeleccionado) return;

    setGuardando(true);
    setErrorModal(null);
    try {
      await pedidoService.cambiarEstado(pedidoACambiarEstado.id, nuevoEstadoSeleccionado);
      setMensajeExito(`Pedido #${pedidoACambiarEstado.id} pasó a "${nuevoEstadoSeleccionado}".`);
      setPedidoACambiarEstado(null);
      recargar();
    } catch (err) {
      setErrorModal(err.message || 'Error al actualizar el estado del pedido.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarCancelacion = async () => {
    if (!pedidoACancelar) return;

    setGuardando(true);
    setErrorGlobal(null);
    try {
      await pedidoService.cancelarPedido(pedidoACancelar.id);
      setMensajeExito(`Pedido #${pedidoACancelar.id} cancelado y stock restituido.`);
      setPedidoACancelar(null);
      recargar();
    } catch (err) {
      setErrorGlobal(err.message || 'Error al cancelar el pedido.');
      setPedidoACancelar(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-none border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black uppercase text-slate-950 tracking-tight">Gestión de Pedidos</h2>
          <p className="text-xs font-sans text-slate-500 mt-1">
            Supervisión del ciclo de compras, detalle de órdenes, transiciones de estado y cancelaciones.
          </p>
        </div>
        <button
          onClick={recargar}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-medium uppercase tracking-wider rounded-none border border-slate-300 transition cursor-pointer"
        >
          <span>↻ Actualizar lista</span>
        </button>
      </div>

      <AdminAlert type="success" message={mensajeExito} onClose={() => setMensajeExito(null)} />
      <AdminAlert type="error" message={errorGlobal} onClose={() => setErrorGlobal(null)} />

      <div className="bg-white p-5 sm:p-6 rounded-none border border-slate-200 shadow-xs space-y-3 font-sans">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <select
              name="estado"
              aria-label="Filtrar por estado del pedido"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="">Todos los estados</option>
              {Object.keys(ESTADOS_INFO).map((est) => (
                <option key={est} value={est}>{ESTADOS_INFO[est].label}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              name="fechaDesde"
              value={filtros.fechaDesde}
              max={filtros.fechaHasta || undefined}
              onChange={handleFiltroChange}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              title="Fecha Desde"
              aria-label="Pedidos desde la fecha"
            />
          </div>
          <div>
            <input
              type="date"
              name="fechaHasta"
              value={filtros.fechaHasta}
              min={filtros.fechaDesde || undefined}
              onChange={handleFiltroChange}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              title="Fecha Hasta"
              aria-label="Pedidos hasta la fecha"
            />
          </div>
          <div>
            <input
              type="text"
              name="usuario"
              value={usuarioInput}
              onChange={(e) => setUsuarioInput(e.target.value)}
              placeholder="DNI o nombre de cliente..."
              aria-label="Buscar por DNI o nombre del cliente"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>
        </div>
        {rangoFechasInvalido && (
          <p role="alert" className="text-xs text-rose-600 font-bold">
            La fecha «Desde» no puede ser posterior a la fecha «Hasta». Corregí el rango para ver los pedidos.
          </p>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleLimpiarFiltros}
            className="text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition cursor-pointer"
          >
            Limpiar todos los filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-none border border-slate-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Cargando órdenes de compra...</p>
          </div>
        ) : pedidosVisibles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            <p className="text-base font-bold uppercase text-slate-900">No se encontraron pedidos</p>
            <p className="text-xs text-slate-500 mt-1">Intente cambiar los filtros de fecha o estado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 font-sans">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3">Nº Orden / Fecha</th>
                  <th scope="col" className="px-5 py-3">Cliente</th>
                  <th scope="col" className="px-5 py-3">Total</th>
                  <th scope="col" className="px-5 py-3 whitespace-nowrap">Estado</th>
                  <th scope="col" className="px-5 py-3">Entrega</th>
                  <th scope="col" className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidosVisibles.map((p) => {
                  const tieneEnvio = Boolean(p.envio) && p.envio.estado !== 'CANCELADO';
                  const est = getEstadoInfo(p.estado, tieneEnvio);
                  const transiciones = TRANSICIONES_PERMITIDAS[p.estado] || [];
                  const cancelable = ESTADOS_CANCELABLES.includes(p.estado);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-950">#{p.id}</div>
                        <div className="text-xs text-slate-500">
                          {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : '-'}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-950">
                          {p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Cliente'}
                        </div>
                        <div className="text-xs text-slate-500">{p.cliente?.email || p.cliente?.dni}</div>
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-950 font-sans">
                        ${Number(p.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-none text-xs font-bold uppercase tracking-wider border ${est.color}`}>
                          {est.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-700">
                        {tieneEnvio ? (
                          <span className="flex items-center gap-1.5">
                            <IconTruck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Domicilio ({p.envio.domicilioEntrega || 'Dirección registrada'})</span>
                          </span>
                        ) : p.envio ? (
                          <span className="flex items-center gap-1.5">
                            <IconStore className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Retiro en sucursal (envío cancelado)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <IconStore className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Retiro en sucursal</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerDetalle(p.id)}
                            className="px-2.5 py-1 text-xs font-bold uppercase text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-none transition cursor-pointer"
                          >
                            Detalle
                          </button>
                          {transiciones.length > 0 && (
                            <button
                              onClick={() => handleAbrirCambiarEstado(p)}
                              className="px-2.5 py-1 text-xs font-bold uppercase text-sky-700 bg-sky-50 hover:bg-sky-600 hover:text-white border border-sky-200 rounded-none transition cursor-pointer"
                            >
                              Estado
                            </button>
                          )}
                          {cancelable && (
                            <button
                              onClick={() => setPedidoACancelar(p)}
                              className="px-2.5 py-1 text-xs font-bold uppercase text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-none transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
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
        isOpen={Boolean(pedidoDetalle)}
        onClose={() => setPedidoDetalle(null)}
        title={pedidoDetalle ? `Orden #${pedidoDetalle.id}` : ''}
        subtitle={pedidoDetalle?.fecha ? `Registrado el ${new Date(pedidoDetalle.fecha).toLocaleString('es-AR')}` : ''}
        maxWidth="max-w-2xl"
      >
        {pedidoDetalle && (
          <div className="space-y-5 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/60 border border-slate-200 rounded-none text-xs">
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-wider mb-1">Cliente</p>
                <p className="font-bold text-slate-950">{pedidoDetalle.cliente?.nombre} {pedidoDetalle.cliente?.apellido}</p>
                <p className="text-slate-600">DNI: {pedidoDetalle.cliente?.dni}</p>
                <p className="text-slate-600">{pedidoDetalle.cliente?.email}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-wider mb-1">Pago & Entrega</p>
                <p className="text-slate-700"><strong>Medio de pago:</strong> {pedidoDetalle.medioPago?.nombre || 'Efectivo / Transferencia'}</p>
                <p className="text-slate-700">
                  <strong>Entrega:</strong>{' '}
                  {pedidoDetalle.envio && pedidoDetalle.envio.estado !== 'CANCELADO'
                    ? `Envío a domicilio (${pedidoDetalle.envio.domicilioEntrega})`
                    : pedidoDetalle.envio
                      ? 'Retiro en sucursal (envío cancelado)'
                      : 'Retiro en sucursal'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Productos ({detallesVisuales.length})</h3>
              <div className="border border-slate-200 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-700 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3">Producto</th>
                      <th scope="col" className="p-3 text-center">Cant.</th>
                      <th scope="col" className="p-3 text-right">Precio Unit.</th>
                      <th scope="col" className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detallesVisuales.map((det) => (
                      <tr key={det.productoId ?? det.id}>
                        <td className="p-3 font-bold text-slate-950">{det.producto?.nombre || `Producto #${det.productoId}`}</td>
                        <td className="p-3 text-center font-bold text-slate-950">{det.cantidad}</td>
                        <td className="p-3 text-right">${Number(det.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right font-bold text-slate-950">${Number(det.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
              <span className="font-bold uppercase text-slate-900">Total Liquidado:</span>
              <span className="text-xl font-display font-black text-blue-600">
                ${Number(pedidoDetalle.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setPedidoDetalle(null)}
                className="px-5 py-2 text-xs font-medium uppercase tracking-wider text-slate-700 bg-white border border-slate-300 rounded-none hover:bg-slate-50 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={Boolean(pedidoACambiarEstado)}
        onClose={() => setPedidoACambiarEstado(null)}
        title={`Cambiar Estado - Pedido #${pedidoACambiarEstado?.id}`}
        subtitle={`Estado actual: ${
          pedidoACambiarEstado
            ? getEstadoInfo(pedidoACambiarEstado.estado, Boolean(pedidoACambiarEstado.envio)).label
            : ''
        }`}
      >
        <form onSubmit={handleConfirmarCambioEstado} className="space-y-4 font-sans">
          {errorModal && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-300 text-rose-950 font-bold text-xs rounded-none">{errorModal}</div>
          )}

          <div>
            <label htmlFor="pedido-nuevo-estado" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nuevo Estado Autorizado:
            </label>
            <select
              id="pedido-nuevo-estado"
              value={nuevoEstadoSeleccionado}
              onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-medium focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
            >
              {(TRANSICIONES_PERMITIDAS[pedidoACambiarEstado?.estado] || []).map((trans) => {
                let label = ESTADOS_INFO[trans]?.label || trans;
                if (!pedidoACambiarEstado?.envio) {
                  if (trans === 'ENVIADO') label = 'Listo para retiro';
                  if (trans === 'ENTREGADO') label = 'Entregado en sucursal';
                }
                return (
                  <option key={trans} value={trans}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setPedidoACambiarEstado(null)}
              disabled={guardando}
              className="px-5 py-2 text-xs font-medium uppercase tracking-wider text-slate-700 bg-white border border-slate-300 rounded-none hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : 'Confirmar Transición'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={Boolean(pedidoACancelar)}
        onClose={() => setPedidoACancelar(null)}
        onConfirm={handleConfirmarCancelacion}
        title={`¿Cancelar el Pedido #${pedidoACancelar?.id}?`}
        message="Esta acción cancelará la orden de compra y revertirá automáticamente el stock reservado en los almacenes correspondientes."
        confirmText="Confirmar Cancelación"
        confirmVariant="danger"
        loading={guardando}
      />
    </div>
  );
};
