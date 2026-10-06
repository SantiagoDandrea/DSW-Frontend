// Panel de administración para consultar el estado de envíos, editar domicilios de entrega y cancelar despachos.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { envioService } from '../../services/envioService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminAlert } from '../../components/admin/AdminAlert';

const ESTADOS_INFO = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  EN_PREPARACION: { label: 'En Preparación', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  EN_TRANSITO: { label: 'En Tránsito', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ENTREGADO: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELADO: { label: 'Cancelado', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const ESTADOS_ENVIO_CANCELABLES = ['PENDIENTE', 'EN_PREPARACION'];
const ESTADOS_PEDIDO_CANCELABLES = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION'];

const puedeEditar = (envio) =>
  envio.estado === 'PENDIENTE' && envio.pedido?.estado === 'PENDIENTE';

const puedeCancelar = (envio) =>
  ESTADOS_ENVIO_CANCELABLES.includes(envio.estado) &&
  ESTADOS_PEDIDO_CANCELABLES.includes(envio.pedido?.estado);

const mostrarPrecio = (valor) =>
  Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

export const AdminEnviosPage = () => {
  const [envios, setEnvios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [estado, setEstado] = useState('');
  const [pedidoIdInput, setPedidoIdInput] = useState('');
  const [pedidoIdDebounced, setPedidoIdDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPedidoIdDebounced(pedidoIdInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [pedidoIdInput]);

  const [envioAEditar, setEnvioAEditar] = useState(null);
  const [nuevoDomicilio, setNuevoDomicilio] = useState('');
  const [envioACancelar, setEnvioACancelar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  useEffect(() => {
    let ignore = false;

    envioService
      .getEnvios({ estado, pedidoId: pedidoIdDebounced })
      .then((data) => {
        if (!ignore) {
          setEnvios(data);
          setErrorGlobal(null);
        }
      })
      .catch((err) => {
        if (!ignore) setErrorGlobal(err.message || 'Error al cargar los envíos.');
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [estado, pedidoIdDebounced, refreshKey]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const recargar = () => setRefreshKey((k) => k + 1);

  const handleLimpiarFiltros = () => {
    setEstado('');
    setPedidoIdInput('');
    setPedidoIdDebounced('');
  };

  const handleAbrirEditar = (envio) => {
    setEnvioAEditar(envio);
    setNuevoDomicilio(envio.domicilioEntrega || '');
    setErrorModal(null);
  };

  const handleGuardarDomicilio = async (e) => {
    e.preventDefault();
    if (!envioAEditar || !nuevoDomicilio.trim()) return;

    setGuardando(true);
    setErrorModal(null);
    try {
      await envioService.actualizarDomicilio(envioAEditar.id, nuevoDomicilio.trim());
      setMensajeExito(`Domicilio del envío #${envioAEditar.id} actualizado.`);
      setEnvioAEditar(null);
      recargar();
    } catch (err) {
      setErrorModal(err.message || 'No se pudo actualizar el domicilio.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarCancelacion = async () => {
    if (!envioACancelar) return;

    setGuardando(true);
    setErrorGlobal(null);
    try {
      await envioService.cancelarEnvio(envioACancelar.id);
      setMensajeExito(
        `Envío #${envioACancelar.id} cancelado. El pedido #${envioACancelar.pedidoId} sigue activo (retiro en el local).`
      );
      setEnvioACancelar(null);
      recargar();
    } catch (err) {
      setErrorGlobal(err.message || 'No se pudo cancelar el envío.');
      setEnvioACancelar(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Envíos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Entregas a domicilio de todos los pedidos: seguimiento por estado, corrección de domicilio y cancelación.
          </p>
        </div>
        <button
          type="button"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            aria-label="Filtrar por estado del envío"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS_INFO).map(([clave, info]) => (
              <option key={clave} value={clave}>{info.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            aria-label="Filtrar por número de pedido"
            value={pedidoIdInput}
            onChange={(e) => setPedidoIdInput(e.target.value)}
            placeholder="Nº de pedido..."
            className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleLimpiarFiltros}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            Limpiar todos los filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div role="status" className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
            <p className="text-sm">Cargando envíos...</p>
          </div>
        ) : envios.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">No se encontraron envíos</p>
            <p className="text-xs text-gray-400 mt-1">Probá cambiando el estado o el número de pedido.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-5 py-3">Envío</th>
                  <th scope="col" className="px-5 py-3">Pedido / Cliente</th>
                  <th scope="col" className="px-5 py-3">Domicilio</th>
                  <th scope="col" className="px-5 py-3">Costo</th>
                  <th scope="col" className="px-5 py-3">Estado</th>
                  <th scope="col" className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {envios.map((envio) => {
                  const info = ESTADOS_INFO[envio.estado] || { label: envio.estado, color: 'bg-gray-100 text-gray-800 border-gray-200' };
                  const cliente = envio.pedido?.cliente;

                  return (
                    <tr key={envio.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-bold text-gray-900">#{envio.id}</td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900">Pedido #{envio.pedidoId}</div>
                        <div className="text-xs text-gray-400">
                          {cliente ? `${cliente.nombre} ${cliente.apellido}` : '-'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-700">{envio.domicilioEntrega}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">{mostrarPrecio(envio.costo)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${info.color}`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to="/admin/pedidos"
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
                          >
                            Ver pedidos
                          </Link>
                          {puedeEditar(envio) && (
                            <button
                              type="button"
                              onClick={() => handleAbrirEditar(envio)}
                              className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition cursor-pointer"
                            >
                              Domicilio
                            </button>
                          )}
                          {puedeCancelar(envio) && (
                            <button
                              type="button"
                              onClick={() => setEnvioACancelar(envio)}
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
        isOpen={Boolean(envioAEditar)}
        onClose={() => setEnvioAEditar(null)}
        title={`Editar domicilio - Envío #${envioAEditar?.id}`}
        subtitle={`Pedido #${envioAEditar?.pedidoId}`}
      >
        <form onSubmit={handleGuardarDomicilio} className="space-y-4">
          {errorModal && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorModal}
            </div>
          )}

          <div>
            <label htmlFor="nuevo-domicilio" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Domicilio de entrega <span className="text-rose-500">*</span>
            </label>
            <input
              id="nuevo-domicilio"
              type="text"
              required
              value={nuevoDomicilio}
              onChange={(e) => setNuevoDomicilio(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEnvioAEditar(null)}
              disabled={guardando}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !nuevoDomicilio.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar domicilio'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={Boolean(envioACancelar)}
        onClose={() => setEnvioACancelar(null)}
        onConfirm={handleConfirmarCancelacion}
        title={`¿Cancelar el envío #${envioACancelar?.id}?`}
        message="El pedido sigue activo pero pasa a retiro en el local, y el costo del flete se descuenta del total. No se puede deshacer."
        confirmText="Cancelar envío"
        confirmVariant="danger"
        loading={guardando}
      />
    </div>
  );
};
