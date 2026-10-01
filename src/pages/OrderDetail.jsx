import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkoutService } from '../services/checkoutService';

const ESTADOS_CANCELABLES = [
  'PENDIENTE',
  'CONFIRMADO',
  'EN_PREPARACION',
];

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
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

  useEffect(() => {
    let ignore = false;

    checkoutService
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
      const pedido = await checkoutService.cancelarPedido(id);

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

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
      <Link to="/mis-pedidos" className="text-indigo-600">
        ← Mis pedidos
      </Link>

      <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pedido #{pedido.id}
        </h1>

        <p className="mt-2 text-gray-600">
          {new Date(pedido.fecha).toLocaleString('es-AR')}
        </p>

        <p role="status" className="mt-3 font-semibold text-gray-800">
          Estado: {pedido.estado.replaceAll('_', ' ')}
        </p>

        <h2 className="mt-6 mb-3 text-lg font-bold text-gray-900">
          Productos
        </h2>

        <ul className="divide-y">
          {pedido.detalles.map((detalle) => (
            <li key={detalle.id} className="py-3">
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

          {pedido.envio ? (
            <>
              <p>
                Domicilio: {pedido.envio.domicilioEntrega}
              </p>

              <p>
                Estado del envío:{' '}
                {pedido.envio.estado.replaceAll('_', ' ')}
              </p>

              <p>
                Costo del envío: {mostrarPrecio(pedido.envio.costo)}
              </p>
            </>
          ) : (
            <p>Entrega: retiro en el local.</p>
          )}

          <p className="pt-3 text-xl font-bold text-gray-900">
            Total: {mostrarPrecio(pedido.total)}
          </p>
        </div>

        {errorCancelacion && (
          <p role="alert" className="mt-5 text-red-700">
            {errorCancelacion}
          </p>
        )}

        {puedeCancelar && (
          <button
            type="button"
            disabled={cancelando}
            onClick={handleCancelarPedido}
            className="mt-6 px-5 py-3 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        )}
      </div>
    </main>
  );
}