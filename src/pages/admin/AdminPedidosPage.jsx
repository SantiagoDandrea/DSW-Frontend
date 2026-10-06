// Panel de administración para supervisar pedidos, cambiar sus estados de entrega o cancelarlos.
import { useState, useEffect } from 'react';
import { pedidoService } from '../../services/pedidoService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminAlert } from '../../components/admin/AdminAlert';

const TRANSICIONES_PERMITIDAS = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADOS_CANCELABLES = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION'];

const ESTADOS_INFO = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  EN_PREPARACION: { label: 'En Preparación', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ENVIADO: { label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ENTREGADO: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELADO: { label: 'Cancelado', color: 'bg-rose-100 text-rose-800 border-rose-200' },
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
  const [usuarioInput, setUsuarioInput] = useState('');
  const [usuarioDebounced, setUsuarioDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsuarioDebounced(usuarioInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [usuarioInput]);

  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [pedidoACambiarEstado, setPedidoACambiarEstado] = useState(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('');
  const [pedidoACancelar, setPedidoACancelar] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
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
    if (usuarioDebounced.trim()) params.usuario = usuarioDebounced.trim();

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
  }, [filtros, usuarioDebounced, refreshKey]);

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
    setUsuarioDebounced('');
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
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Supervisión del ciclo de compras, detalle de órdenes, transiciones de estado y cancelaciones.
          </p>
        </div>
        <button
          onClick={recargar}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition cursor-pointer"
        >
          ↻ Actualizar
        </button>
      </div>

      <AdminAlert type="success" message={mensajeExito} onClose={() => setMensajeExito(null)} />
      <AdminAlert type="error" message={errorGlobal} onClose={() => setErrorGlobal(null)} />

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              onChange={handleFiltroChange}
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              title="Fecha Desde"
            />
          </div>
          <div>
            <input
              type="date"
              name="fechaHasta"
              value={filtros.fechaHasta}
              onChange={handleFiltroChange}
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              title="Fecha Hasta"
            />
          </div>
          <div>
            <input
              type="text"
              name="usuario"
              value={usuarioInput}
              onChange={(e) => setUsuarioInput(e.target.value)}
              placeholder="DNI o nombre de cliente..."
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleLimpiarFiltros}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            Limpiar todos los filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
            <p className="text-sm">Cargando órdenes de compra...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">No se encontraron pedidos</p>
            <p className="text-xs text-gray-400 mt-1">Intente cambiar los filtros de fecha o estado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Nº Orden / Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Entrega</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidos.map((p) => {
                  const est = ESTADOS_INFO[p.estado] || { label: p.estado, color: 'bg-gray-100 text-gray-800' };
                  const transiciones = TRANSICIONES_PERMITIDAS[p.estado] || [];
                  const cancelable = ESTADOS_CANCELABLES.includes(p.estado);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="font-bold text-gray-900">#{p.id}</div>
                        <div className="text-xs text-gray-400">
                          {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : '-'}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900">
                          {p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Cliente'}
                        </div>
                        <div className="text-xs text-gray-400">{p.cliente?.email || p.cliente?.dni}</div>
                      </td>
                      <td className="px-5 py-3 font-extrabold text-gray-900">
                        ${Number(p.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${est.color}`}>
                          {est.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">
                        {p.envio ? (
                          <span>🚚 Domicilio ({p.envio.domicilioEntrega || 'Dirección registrada'})</span>
                        ) : (
                          <span>🏬 Retiro en sucursal</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerDetalle(p.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                          >
                            Detalle
                          </button>
                          {transiciones.length > 0 && (
                            <button
                              onClick={() => handleAbrirCambiarEstado(p)}
                              className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition cursor-pointer"
                            >
                              Estado
                            </button>
                          )}
                          {cancelable && (
                            <button
                              onClick={() => setPedidoACancelar(p)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition cursor-pointer"
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
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl text-xs">
              <div>
                <p className="font-bold text-gray-700 uppercase tracking-wider mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{pedidoDetalle.cliente?.nombre} {pedidoDetalle.cliente?.apellido}</p>
                <p className="text-gray-500">DNI: {pedidoDetalle.cliente?.dni}</p>
                <p className="text-gray-500">{pedidoDetalle.cliente?.email}</p>
              </div>
              <div>
                <p className="font-bold text-gray-700 uppercase tracking-wider mb-1">Pago & Entrega</p>
                <p className="text-gray-700"><strong>Medio de pago:</strong> {pedidoDetalle.medioPago?.nombre || 'Efectivo / Transferencia'}</p>
                <p className="text-gray-700">
                  <strong>Entrega:</strong> {pedidoDetalle.envio ? `Envío a domicilio (${pedidoDetalle.envio.domicilioEntrega})` : 'Retiro en sucursal'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Productos ({pedidoDetalle.detalles?.length || 0})</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 font-bold text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Precio Unit.</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pedidoDetalle.detalles?.map((det) => (
                      <tr key={det.id}>
                        <td className="p-3 font-semibold text-gray-900">{det.producto?.nombre || `Producto #${det.productoId}`}</td>
                        <td className="p-3 text-center font-bold text-gray-700">{det.cantidad}</td>
                        <td className="p-3 text-right">${Number(det.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right font-bold text-gray-900">${Number(det.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
              <span className="font-bold text-gray-700">Total Liquidado:</span>
              <span className="text-xl font-extrabold text-indigo-700">
                ${Number(pedidoDetalle.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setPedidoDetalle(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
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
        subtitle={`Estado actual: ${pedidoACambiarEstado?.estado}`}
      >
        <form onSubmit={handleConfirmarCambioEstado} className="space-y-4">
          {errorModal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{errorModal}</div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Nuevo Estado Autorizado:
            </label>
            <select
              value={nuevoEstadoSeleccionado}
              onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {(TRANSICIONES_PERMITIDAS[pedidoACambiarEstado?.estado] || []).map((trans) => (
                <option key={trans} value={trans}>
                  {ESTADOS_INFO[trans]?.label || trans}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setPedidoACambiarEstado(null)}
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
