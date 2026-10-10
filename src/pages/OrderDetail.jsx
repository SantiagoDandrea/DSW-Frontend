import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pedidoService } from '../services/pedidoService';
import { envioService } from '../services/envioService';

const ESTADOS_CANCELABLES = [
  'PENDIENTE',
];

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
      setErrorCancelacion(
        error.message || 'No pudimos cancelar el pedido.'
      );
    } finally {
      solicitudEnCurso.current = false;
      setCancelando(false);
    }
  }

  async function handleGuardarDomicilio(envioId) {
    if (!nuevoDomicilio.trim()) return;

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
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p role="status">Cargando pedido...</p>
      </main>
    );
  }

  if (resultado.error || !resultado.pedido) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p role="alert" className="text-red-700">
          {resultado.error || 'No encontramos el pedido.'}
        </p>

        <Link
          to="/mis-pedidos"
          className="inline-block mt-4 text-indigo-600"
        >
          Volver a mis pedidos
        </Link>
      </main>
    );
  }

  const pedido = resultado.pedido;
  const puedeCancelar = ESTADOS_CANCELABLES.includes(pedido.estado);
  const puedeEditarDomicilio =
    pedido.envio?.estado === 'PENDIENTE' && pedido.estado === 'PENDIENTE';
  const puedeCancelarEnvio =
    pedido.envio &&
    ESTADOS_ENVIO_CANCELABLE.includes(pedido.envio.estado) &&
    ESTADOS_CANCELABLES.includes(pedido.estado);

  const detallesAgrupados = agruparDetalles(pedido.detalles);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between print:hidden mb-3">
        <Link to="/mis-pedidos" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Volver a mis pedidos
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition cursor-pointer"
        >
          <span>🖨️</span>
          <span>Imprimir comprobante</span>
        </button>
      </div>

      <div className="mt-2 bg-white rounded-xl shadow-sm p-6 print:shadow-none print:p-0 print:border-none">
        <div className="hidden print:block pb-4 mb-4 border-b border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">MiTienda</h2>
              <p className="text-xs text-gray-500">Comprobante de Orden de Compra</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Pedido #{pedido.id}
        </h1>

        <p className="mt-2 text-gray-600">
          {new Date(pedido.fecha).toLocaleString('es-AR')}
        </p>

        <p role="status" className="mt-3 font-semibold text-gray-800 print:hidden">
          Estado:{' '}
          <span className="font-bold text-indigo-700">
            {pedido.estado === 'ENVIADO' && (!pedido.envio || pedido.envio.estado === 'CANCELADO')
              ? 'Listo para retiro'
              : pedido.estado.replaceAll('_', ' ')}
          </span>
        </p>

        <h2 className="mt-6 mb-3 text-lg font-bold text-gray-900">
          Productos
        </h2>

        <ul className="divide-y">
          {detallesAgrupados.map((detalle) => (
            <li key={detalle.productoId ?? detalle.id} className="py-3">
              <p className="font-medium text-gray-900">
                {detalle.producto?.nombre || 'Producto'}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {detalle.cantidad} unidad(es) ×{' '}
                {mostrarPrecio(detalle.precioUnitario)}
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                Subtotal: {mostrarPrecio(detalle.subtotal)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 border-t space-y-2 text-gray-700">
          <p>
            Medio de pago: {pedido.medioPago?.descripcion}
          </p>

          {pedido.envio && pedido.envio.estado !== 'CANCELADO' ? (
            <>
              {editandoDomicilio ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={nuevoDomicilio}
                    onChange={(e) => setNuevoDomicilio(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nuevo domicilio de entrega"
                  />
                  <button
                    type="button"
                    disabled={guardandoDomicilio}
                    onClick={() => handleGuardarDomicilio(pedido.envio.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {guardandoDomicilio ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoDomicilio(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p>
                  Domicilio: {pedido.envio.domicilioEntrega}
                  {puedeEditarDomicilio && (
                    <button
                      type="button"
                      onClick={() => {
                        setNuevoDomicilio(pedido.envio.domicilioEntrega);
                        setEditandoDomicilio(true);
                      }}
                      className="ml-2 text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer print:hidden"
                    >
                      Editar
                    </button>
                  )}
                </p>
              )}

              <p>
                Estado del envío:{' '}
                {pedido.envio.estado.replaceAll('_', ' ')}
              </p>

              <p>
                Costo del envío: {mostrarPrecio(pedido.envio.costo)}
              </p>

              {errorEnvio && (
                <p role="alert" className="text-red-700 print:hidden">
                  {errorEnvio}
                </p>
              )}

              {puedeCancelarEnvio && (
                <button
                  type="button"
                  disabled={cancelandoEnvio}
                  onClick={() => handleCancelarEnvio(pedido.envio.id)}
                  className="text-sm text-red-700 hover:text-red-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed print:hidden"
                >
                  {cancelandoEnvio ? 'Cancelando envío...' : 'Cancelar envío (retirar en el local)'}
                </button>
              )}
            </>
          ) : (
            <p>
              Entrega: Retiro en sucursal
              {pedido.envio?.estado === 'CANCELADO' ? ' (Envío cancelado)' : ''}
            </p>
          )}

          <p className="pt-3 text-xl font-bold text-gray-900 border-t print:border-gray-300">
            Total: {mostrarPrecio(pedido.total)}
          </p>
        </div>

        {errorCancelacion && (
          <p role="alert" className="mt-5 text-red-700 print:hidden">
            {errorCancelacion}
          </p>
        )}

        {puedeCancelar && (
          <button
            type="button"
            disabled={cancelando}
            onClick={handleCancelarPedido}
            className="mt-6 px-5 py-3 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
          >
            {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        )}
      </div>
    </main>
  );
}