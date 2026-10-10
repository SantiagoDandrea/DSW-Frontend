// Pantalla de checkout para seleccionar método de pago, envío o retiro y confirmar el pedido.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { pedidoService } from '../services/pedidoService';

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

export function Checkout() {
  const { items, subtotal, vaciarCarrito } = useCart();
  const { usuario } = useAuth();

  const [mediosPago, setMediosPago] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorCompra, setErrorCompra] = useState('');

  const [medioPagoId, setMedioPagoId] = useState('');
  const [requiereEnvio, setRequiereEnvio] = useState(false);
  const [domicilioEntrega, setDomicilioEntrega] = useState('');
  const [usarDomicilioRegistrado, setUsarDomicilioRegistrado] = useState(false);

  const esLasParejas =
    Boolean(usuario?.localidad?.nombre?.trim().toLowerCase().includes('las parejas'));
  const costoEnvioEstimado = requiereEnvio ? (esLasParejas ? 3000 : 15000) : 0;
  const totalEstimado = subtotal + costoEnvioEstimado;

  const [enviando, setEnviando] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);

  const solicitudEnCurso = useRef(false);

  useEffect(() => {
    let ignore = false;

    pedidoService
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
      const pedido = await pedidoService.crearPedido(datos);

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
if (items.length === 0) {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Tu carrito está vacío
      </h1>

      <Link
        to="/"
        className="inline-block mt-4 text-indigo-600"
      >
        Ir a la tienda
      </Link>
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

        <div className="mt-4 pt-4 border-t space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal de productos:</span>
            <span>{mostrarPrecio(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Costo de envío estimado:</span>
            <span>
              {requiereEnvio
                ? `${mostrarPrecio(costoEnvioEstimado)} ${
                    usuario?.localidad?.nombre ? `(${usuario.localidad.nombre})` : ''
                  }`
                : 'Gratis (Retiro en el local)'}
            </span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total estimado:</span>
            <span className="text-indigo-600">{mostrarPrecio(totalEstimado)}</span>
          </div>
        </div>

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
                  <option value="retiro">Retiro en el local (Gratis)</option>
                  <option value="envio">Envío a domicilio</option>
                </select>
              </div>

              {requiereEnvio && (
                <div className="space-y-3 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>
                      🚚 <strong>Tarifas fijas de envío:</strong> Las Parejas <strong>$3.000</strong> · Resto del país <strong>$15.000</strong>
                    </span>
                    {usuario?.localidad?.nombre && (
                      <span className="font-semibold text-indigo-700">
                        Localidad registrada: {usuario.localidad.nombre}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="domicilio"
                        className="block font-medium text-gray-700"
                      >
                        Domicilio de entrega
                      </label>

                      <label
                        className={`text-xs flex items-center gap-1.5 ${
                          usuario?.domicilio
                            ? 'cursor-pointer text-indigo-700 hover:text-indigo-900 font-medium'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={
                          usuario?.domicilio
                            ? 'Cargar tu domicilio registrado automáticamente'
                            : 'No tenés un domicilio guardado en tu perfil'
                        }
                      >
                        <input
                          type="checkbox"
                          disabled={!usuario?.domicilio}
                          checked={usarDomicilioRegistrado}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setUsarDomicilioRegistrado(checked);
                            if (checked && usuario?.domicilio) {
                              setDomicilioEntrega(usuario.domicilio);
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span>
                          {usuario?.domicilio
                            ? 'Usar mi domicilio registrado'
                            : 'Sin domicilio en tu perfil'}
                        </span>
                      </label>
                    </div>

                    <input
                      id="domicilio"
                      required
                      value={domicilioEntrega}
                      onChange={(event) => {
                        setDomicilioEntrega(event.target.value);
                        if (usarDomicilioRegistrado && event.target.value !== usuario?.domicilio) {
                          setUsarDomicilioRegistrado(false);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                      placeholder="Calle, número y datos de entrega"
                    />
                  </div>
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