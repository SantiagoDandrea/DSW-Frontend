import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { checkoutService } from '../services/checkoutService';

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

export function Checkout() {
  const { items, subtotal, vaciarCarrito } = useCart();

  const [mediosPago, setMediosPago] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorCompra, setErrorCompra] = useState('');

  const [medioPagoId, setMedioPagoId] = useState('');
  const [requiereEnvio, setRequiereEnvio] = useState(false);
  const [domicilioEntrega, setDomicilioEntrega] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);

  const solicitudEnCurso = useRef(false);

  useEffect(() => {
    let ignore = false;

    checkoutService
      .getMediosPago()
      .then((datos) => {
        if (!ignore) {
          setMediosPago(datos);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setErrorCarga(
            error.message || 'No pudimos cargar los medios de pago.'
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setCargando(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleConfirmarCompra(event) {
    event.preventDefault();

    if (solicitudEnCurso.current || pedidoCreado) return;

    setErrorCompra('');

    if (items.length === 0) {
      setErrorCompra('El carrito está vacío.');
      return;
    }

    if (!medioPagoId) {
      setErrorCompra('Seleccioná un medio de pago.');
      return;
    }

    if (requiereEnvio && !domicilioEntrega.trim()) {
      setErrorCompra('Ingresá el domicilio de entrega.');
      return;
    }

    const datos = {
      productos: items.map(({ producto, cantidad }) => ({
        productoId: producto.id,
        cantidad,
      })),
      medioPagoId: Number(medioPagoId),
      envio: requiereEnvio
        ? {
            requiereEnvio: true,
            domicilioEntrega: domicilioEntrega.trim(),
          }
        : {
            requiereEnvio: false,
          },
    };

    solicitudEnCurso.current = true;
    setEnviando(true);

    try {
      const pedido = await checkoutService.crearPedido(datos);

      setPedidoCreado(pedido);
      vaciarCarrito();
    } catch (error) {
      setErrorCompra(
        error.status
          ? error.message
          : 'No pudimos confirmar la respuesta del servidor. ' +
            'Antes de reintentar, verificá si el pedido fue creado.'
      );
    } finally {
      solicitudEnCurso.current = false;
      setEnviando(false);
    }
  }

  // Mostrar la confirmación antes del estado de carrito vacío.
if (pedidoCreado) {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-green-700">
          Pedido creado correctamente
        </h1>

        <p className="mt-4 text-gray-800">
          Número de pedido: <strong>{pedidoCreado.id}</strong>
        </p>

        <p className="mt-2 text-gray-700">
          Estado: {pedidoCreado.estado}
        </p>

        {pedidoCreado.envio && (
          <p className="mt-2 text-gray-700">
            Envío: {mostrarPrecio(pedidoCreado.envio.costo)}
          </p>
        )}

        <p className="mt-4 text-xl font-bold text-gray-900">
          Total: {mostrarPrecio(pedidoCreado.total)}
        </p>

        <p className="mt-3 text-sm text-gray-600">
          El pedido fue registrado con el medio de pago elegido.
        </p>

        <Link
          to={`/pedidos/${pedidoCreado.id}`}
          className="block mt-6 font-medium text-indigo-600 hover:text-indigo-800"
        >
          Ver detalle del pedido →
        </Link>

        <Link
          to="/mis-pedidos"
          className="block mt-3 text-indigo-600 hover:text-indigo-800"
        >
          Ver mis pedidos
        </Link>

        <Link
          to="/"
          className="inline-block mt-6 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Confirmar pedido
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <ul className="space-y-3">
          {items.map(({ producto, cantidad }) => (
            <li
              key={producto.id}
              className="flex justify-between gap-4 text-gray-700"
            >
              <span>
                {producto.nombre} × {cantidad}
              </span>

              <span>
                {mostrarPrecio(
                  Number(producto.precioActual ?? 0) * cantidad
                )}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 pt-4 border-t font-bold text-gray-900">
          Subtotal estimado: {mostrarPrecio(subtotal)}
        </p>

        <p className="mt-2 text-sm text-gray-600">
          El importe definitivo se calcula al confirmar el pedido
          con los precios vigentes y el envío correspondiente.
        </p>

        {cargando ? (
          <p role="status" className="mt-6">
            Cargando medios de pago...
          </p>
        ) : errorCarga ? (
          <div className="mt-6">
            <p role="alert" className="text-red-700">
              {errorCarga}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-indigo-600"
            >
              Reintentar carga
            </button>
          </div>
        ) : mediosPago.length === 0 ? (
          <p role="alert" className="mt-6 text-red-700">
            No hay medios de pago disponibles.
          </p>
        ) : (
          <form
            onSubmit={handleConfirmarCompra}
            className="mt-6"
          >
            <fieldset disabled={enviando} className="space-y-5">
              <div>
                <label
                  htmlFor="medioPago"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Medio de pago
                </label>

                <select
                  id="medioPago"
                  required
                  value={medioPagoId}
                  onChange={(event) =>
                    setMedioPagoId(event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="">Seleccioná una opción</option>

                  {mediosPago.map((medio) => (
                    <option key={medio.id} value={medio.id}>
                      {medio.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="entrega"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Forma de entrega
                </label>

                <select
                  id="entrega"
                  value={requiereEnvio ? 'envio' : 'retiro'}
                  onChange={(event) =>
                    setRequiereEnvio(event.target.value === 'envio')
                  }
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="retiro">Retiro en el local</option>
                  <option value="envio">Envío a domicilio</option>
                </select>
              </div>

              {requiereEnvio && (
                <div>
                  <label
                    htmlFor="domicilio"
                    className="block font-medium text-gray-700 mb-2"
                  >
                    Domicilio de entrega
                  </label>

                  <input
                    id="domicilio"
                    required
                    value={domicilioEntrega}
                    onChange={(event) =>
                      setDomicilioEntrega(event.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Calle, número y datos de entrega"
                  />
                </div>
              )}

              {errorCompra && (
                <p role="alert" className="text-red-700">
                  {errorCompra}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Creando pedido...' : 'Confirmar pedido'}
              </button>
            </fieldset>
          </form>
        )}

        <Link
          to="/carrito"
          className={`inline-block mt-5 text-indigo-600 ${
            enviando ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-disabled={enviando}
          tabIndex={enviando ? -1 : undefined}
        >
          Volver al carrito
        </Link>
      </div>
    </main>
  );
}