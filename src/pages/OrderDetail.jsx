// Pantalla de detalle de pedido con emisión e impresión de comprobante oficial de compra y gestión de entrega.
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pedidoService } from '../services/pedidoService';
import { envioService } from '../services/envioService';
import {
  IconPrinter,
  IconTruck,
  IconStore,
  IconCreditCard,
} from '../components/Icons';

const ESTADOS_CANCELABLES = ['PENDIENTE'];
const ESTADOS_ENVIO_CANCELABLE = ['PENDIENTE', 'EN_PREPARACION'];

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

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

export function OrderDetail() {
  const { id } = useParams();

  const [resultado, setResultado] = useState({
    id: null,
    pedido: null,
    error: '',
  });

  const [cancelando, setCancelando] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState('');
  const solicitudEnCurso = useRef(false);

  const [editandoDomicilio, setEditandoDomicilio] = useState(false);
  const [nuevoDomicilio, setNuevoDomicilio] = useState('');
  const [guardandoDomicilio, setGuardandoDomicilio] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [cancelandoEnvio, setCancelandoEnvio] = useState(false);

  useEffect(() => {
    let ignore = false;

    pedidoService
      .getPedidoById(id)
      .then((pedido) => {
        if (!ignore) {
          setResultado({ id, pedido, error: '' });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setResultado({
            id,
            pedido: null,
            error: error.message || 'No pudimos cargar el pedido.',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleCancelarPedido() {
    if (solicitudEnCurso.current) return;

    const confirmado = window.confirm(
      '¿Querés cancelar este pedido? Esta acción no se puede deshacer.'
    );

    if (!confirmado) return;

    solicitudEnCurso.current = true;
    setCancelando(true);
    setErrorCancelacion('');

    try {
      const pedido = await pedidoService.cancelarPedido(id);
      setResultado({
        id,
        pedido,
        error: '',
      });
    } catch (error) {
      setErrorCancelacion(error.message || 'No pudimos cancelar el pedido.');
    } finally {
      solicitudEnCurso.current = false;
      setCancelando(false);
    }
  }

  async function handleGuardarDomicilio(envioId) {
    if (!nuevoDomicilio.trim()) {
      setErrorEnvio('Ingresá el domicilio de entrega.');
      return;
    }

    setGuardandoDomicilio(true);
    setErrorEnvio('');

    try {
      await envioService.actualizarDomicilio(envioId, nuevoDomicilio.trim());
      const pedido = await pedidoService.getPedidoById(id);
      setResultado({ id, pedido, error: '' });
      setEditandoDomicilio(false);
    } catch (error) {
      setErrorEnvio(error.message || 'No pudimos actualizar el domicilio.');
    } finally {
      setGuardandoDomicilio(false);
    }
  }

  async function handleCancelarEnvio(envioId) {
    const confirmado = window.confirm(
      '¿Querés cancelar el envío a domicilio? El pedido sigue activo, pero vas a tener que retirarlo en el local.'
    );

    if (!confirmado) return;

    setCancelandoEnvio(true);
    setErrorEnvio('');

    try {
      await envioService.cancelarEnvio(envioId);
      const pedido = await pedidoService.getPedidoById(id);
      setResultado({ id, pedido, error: '' });
    } catch (error) {
      setErrorEnvio(error.message || 'No pudimos cancelar el envío.');
    } finally {
      setCancelandoEnvio(false);
    }
  }

  if (resultado.id !== id) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-none animate-spin mb-3" />
        <p role="status" className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900">Cargando comprobante del pedido...</p>
      </main>
    );
  }

  if (resultado.error || !resultado.pedido) {
    return (
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-none p-10 border border-slate-200 shadow-xs font-sans">
          <p role="alert" className="text-rose-950 text-xs font-bold mb-4">
            {resultado.error || 'No encontramos el pedido solicitado.'}
          </p>
          <Link
            to="/mis-pedidos"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-none text-xs font-bold uppercase tracking-wider hover:bg-blue-700 shadow-xs transition"
          >
            ← Volver a mis pedidos
          </Link>
        </div>
      </main>
    );
  }

  const pedido = resultado.pedido;
  const puedeCancelar = ESTADOS_CANCELABLES.includes(pedido.estado);
  const envioActivo = Boolean(pedido.envio) && pedido.envio.estado !== 'CANCELADO';
  const puedeEditarDomicilio =
    pedido.envio?.estado === 'PENDIENTE' && pedido.estado === 'PENDIENTE';
  const puedeCancelarEnvio =
    pedido.envio &&
    ESTADOS_ENVIO_CANCELABLE.includes(pedido.envio.estado) &&
    ESTADOS_CANCELABLES.includes(pedido.estado);

  const detallesAgrupados = agruparDetalles(pedido.detalles);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 print:p-0 print:max-w-none print:w-full">
      {/* Botones de acción superiores (Ocultos en impresión) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden mb-6">
        <Link
          to="/mis-pedidos"
          className="text-xs font-sans font-medium text-slate-600 hover:text-blue-600 transition"
        >
          ← Volver al historial de pedidos
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-none shadow-xs transition duration-150 cursor-pointer"
        >
          <IconPrinter className="w-4 h-4 text-blue-600" />
          <span>Imprimir comprobante oficial</span>
        </button>
      </div>

      {/* Contenedor del Comprobante / Recibo */}
      <div className="bg-white rounded-none border border-slate-200 shadow-xs p-6 sm:p-10 print:shadow-none print:p-0 print:border-none print:m-0">
        {/* Cabecera para Imprimir (Comprobante Oficial) */}
        <div className="hidden print:block pb-6 mb-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
                MiTienda Comercio Digital
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-sans">
                Electrodomésticos, Tecnología y Colchones
              </p>
              <p className="text-xs text-slate-500 font-sans">
                Las Parejas, Santa Fe, Argentina • CUIT: 30-71492044-8
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-sans">
              <span className="inline-block px-3 py-1 font-bold text-xs uppercase border border-slate-300 rounded-none mb-1">
                COMPROBANTE OFICIAL DE COMPRA
              </span>
              <p className="font-bold text-slate-900 mt-1">ORDEN #{pedido.id}</p>
              <p>Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
        </div>

        {/* Encabezado en pantalla */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 print:border-none print:pb-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display uppercase">
                Orden #{pedido.id}
              </h1>
              <span
                role="status"
                className="px-2.5 py-0.5 text-xs font-sans font-bold uppercase tracking-wider rounded-none bg-blue-50 text-blue-800 border border-blue-200"
              >
                {pedido.estado === 'ENVIADO' && (!pedido.envio || pedido.envio.estado === 'CANCELADO')
                  ? 'Listo para retiro'
                  : pedido.estado.replaceAll('_', ' ')}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-500 mt-1">
              Registrado el {new Date(pedido.fecha).toLocaleString('es-AR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Tabla de Productos / Ítems de la orden */}
        <div className="mt-8">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 mb-4 print:mb-2">
            Artículos Adquiridos
          </h2>

          <div className="border border-slate-200 rounded-none overflow-hidden print:border-slate-300">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-sans font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 print:bg-slate-100 print:border-slate-300">
                <tr>
                  <th scope="col" className="px-5 py-3">Producto</th>
                  <th scope="col" className="px-5 py-3 text-center">Cantidad</th>
                  <th scope="col" className="px-5 py-3 text-right">Precio Unitario</th>
                  <th scope="col" className="px-5 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {detallesAgrupados.map((detalle) => (
                  <tr key={detalle.productoId ?? detalle.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-950">
                      {detalle.producto?.nombre || 'Producto'}
                    </td>
                    <td className="px-5 py-3.5 text-center font-sans font-bold text-slate-900">
                      {detalle.cantidad}
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans font-medium text-slate-700">
                      {mostrarPrecio(detalle.precioUnitario)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans font-bold text-slate-950">
                      {mostrarPrecio(detalle.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información de Pago, Envío y Totales */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-start print:grid-cols-2 print:border-slate-300 font-sans">
          <div className="space-y-4 text-xs">
            <div className="p-5 bg-slate-50/60 rounded-none border border-slate-200 print:bg-transparent print:border-slate-200 space-y-2.5">
              <h3 className="font-sans font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Forma de Pago y Entrega
              </h3>
              <p className="flex items-center gap-1.5 text-slate-800">
                <IconCreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Medio de pago: <strong>{pedido.medioPago?.descripcion || 'No registrado'}</strong></span>
              </p>

              {envioActivo ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-start gap-1.5 text-slate-800">
                    <IconTruck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {editandoDomicilio ? (
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                          <input
                            type="text"
                            value={nuevoDomicilio}
                            aria-label="Nuevo domicilio de entrega"
                            onChange={(e) => setNuevoDomicilio(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-none text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            placeholder="Nuevo domicilio de entrega"
                          />
                          <button
                            type="button"
                            disabled={guardandoDomicilio}
                            onClick={() => handleGuardarDomicilio(pedido.envio.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-none text-xs font-bold uppercase hover:bg-blue-700 disabled:opacity-50"
                          >
                            {guardandoDomicilio ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoDomicilio(false)}
                            className="px-3 py-1.5 border border-slate-300 rounded-none text-xs font-medium hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <p>
                          Domicilio: <strong>{pedido.envio.domicilioEntrega}</strong>
                          {puedeEditarDomicilio && (
                            <button
                              type="button"
                              onClick={() => {
                                setNuevoDomicilio(pedido.envio.domicilioEntrega);
                                setEditandoDomicilio(true);
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer print:hidden"
                            >
                              Editar
                            </button>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 pl-5">
                    Estado del envío: <strong className="text-slate-950">{pedido.envio.estado.replaceAll('_', ' ')}</strong>
                  </p>

                  <p className="text-slate-700 pl-5">
                    Costo computado: <strong>{mostrarPrecio(pedido.envio.costo)}</strong>
                  </p>

                  {errorEnvio && (
                    <p role="alert" className="text-rose-600 pl-5 font-bold print:hidden">
                      {errorEnvio}
                    </p>
                  )}

                  {puedeCancelarEnvio && (
                    <div className="pt-2 pl-5 print:hidden">
                      <button
                        type="button"
                        disabled={cancelandoEnvio}
                        onClick={() => handleCancelarEnvio(pedido.envio.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
                      >
                        {cancelandoEnvio ? 'Cancelando envío...' : 'Cancelar envío (retirar en el local)'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-800">
                  <IconStore className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {pedido.envio && pedido.estado === 'CANCELADO'
                      ? 'Entrega: el pedido fue cancelado.'
                      : pedido.envio
                        ? 'Entrega: retiro en el local (el envío fue cancelado).'
                        : 'Entrega: retiro sin cargo en nuestro local comercial (Las Parejas, Santa Fe).'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cuadro de Totales */}
          <div className="bg-slate-50/60 p-5 rounded-none border border-slate-200 print:bg-transparent print:border-slate-200 space-y-2.5 text-xs font-sans">
            <div className="flex justify-between text-slate-700">
              <span>Subtotal artículos:</span>
              <span className="font-bold text-slate-950">
                {mostrarPrecio(
                  detallesAgrupados.reduce((acc, d) => acc + (d.subtotal || 0), 0)
                )}
              </span>
            </div>

            {envioActivo && (
              <div className="flex justify-between text-slate-700">
                <span>Costo de envío:</span>
                <span className="font-bold text-slate-950">
                  {mostrarPrecio(pedido.envio.costo)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
              <span className="font-bold uppercase text-slate-900">Total Liquidado:</span>
              <span className="text-2xl font-black text-slate-950 font-display">
                {mostrarPrecio(pedido.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones de cancelación y avisos */}
        {errorCancelacion && (
          <p role="alert" className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-950 text-xs font-sans rounded-none print:hidden">
            {errorCancelacion}
          </p>
        )}

        {puedeCancelar && (
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end print:hidden">
            <button
              type="button"
              disabled={cancelando}
              onClick={handleCancelarPedido}
              className="px-5 py-2.5 border border-rose-300 text-rose-600 rounded-none hover:bg-rose-50 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer"
            >
              {cancelando ? 'Cancelando orden...' : 'Cancelar pedido'}
            </button>
          </div>
        )}

        {/* Pie de comprobante para impresión */}
        <div className="hidden print:block mt-12 pt-6 border-t border-slate-300 text-[10px] text-slate-500 font-sans text-center">
          <p>Comprobante no válido como factura según normativas vigentes. Válido como orden de retiro y seguimiento de entrega.</p>
          <p className="mt-1">MiTienda E-Commerce • Gracias por su compra.</p>
        </div>
      </div>
    </main>
  );
}