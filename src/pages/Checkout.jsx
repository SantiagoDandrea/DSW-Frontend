// Pantalla de checkout para seleccionar método de pago, envío o retiro y confirmar el pedido.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { pedidoService } from '../services/pedidoService';

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
  const [tipoEnvio, setTipoEnvio] = useState(''); // '' | 'LOCAL' | 'NACIONAL'
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [localidadDestino, setLocalidadDestino] = useState('');
  const [provinciaDestino, setProvinciaDestino] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  const costoEnvioEstimado = requiereEnvio
    ? tipoEnvio === 'LOCAL'
      ? 3000
      : tipoEnvio === 'NACIONAL'
      ? 15000
      : 0
    : 0;
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

    if (requiereEnvio) {
      if (!tipoEnvio) {
        setErrorCompra('Seleccioná la zona de entrega (Local o Nacional).');
        return;
      }

      if (!calle.trim()) {
        setErrorCompra('Ingresá el nombre de la calle.');
        return;
      }

      const numTrim = numero.trim();
      if (!numTrim || !/^\d+$/.test(numTrim) || Number(numTrim) <= 0) {
        setErrorCompra('El campo "Número" es obligatorio y debe contener solo números.');
        return;
      }

      if (tipoEnvio === 'NACIONAL') {
        if (!localidadDestino.trim()) {
          setErrorCompra('Ingresá la localidad de entrega.');
          return;
        }
        if (!provinciaDestino.trim()) {
          setErrorCompra('Ingresá la provincia de entrega.');
          return;
        }
        if (!codigoPostal.trim()) {
          setErrorCompra('Ingresá el código postal.');
          return;
        }
      }
    }

    let domicilioCompleto = '';
    if (requiereEnvio) {
      if (tipoEnvio === 'LOCAL') {
        domicilioCompleto = `${calle.trim()} ${numero.trim()}, Las Parejas`;
      } else {
        domicilioCompleto = `${calle.trim()} ${numero.trim()}, ${localidadDestino.trim()}, ${provinciaDestino.trim()} (CP ${codigoPostal.trim()})`;
      }
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
            tipoEnvio,
            localidad: tipoEnvio === 'LOCAL' ? 'Las Parejas' : localidadDestino.trim(),
            domicilioEntrega: domicilioCompleto,
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
              {!requiereEnvio
                ? 'Gratis (Retiro en el local)'
                : !tipoEnvio
                ? 'Seleccioná la zona de envío'
                : tipoEnvio === 'LOCAL'
                ? `${mostrarPrecio(3000)} (Local - Las Parejas)`
                : `${mostrarPrecio(15000)} (Nacional - Resto del país)`}
            </span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total estimado:</span>
            <span className="text-indigo-600">{mostrarPrecio(totalEstimado)}</span>
          </div>
        </div>

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
                <div className="space-y-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <div>
                    <label
                      htmlFor="tipoEnvio"
                      className="block font-medium text-gray-700 mb-2"
                    >
                      Zona de entrega
                    </label>

                    <select
                      id="tipoEnvio"
                      required
                      value={tipoEnvio}
                      onChange={(event) => setTipoEnvio(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                    >
                      <option value="">Seleccioná la zona de entrega</option>
                      <option value="LOCAL">
                        Envío local (Las Parejas) — $3.000
                      </option>
                      <option value="NACIONAL">
                        Envío nacional (Resto del país) — $15.000
                      </option>
                    </select>
                  </div>

                  {tipoEnvio && (
                    <div className="pt-2 border-t border-gray-200 space-y-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          Dirección de entrega {tipoEnvio === 'LOCAL' ? '(Las Parejas)' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="calle"
                            className="block text-xs font-medium text-gray-700 mb-1"
                          >
                            Calle
                          </label>
                          <input
                            id="calle"
                            type="text"
                            required
                            value={calle}
                            onChange={(e) => setCalle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                            placeholder="Ej. San Martín"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="numero"
                            className="block text-xs font-medium text-gray-700 mb-1"
                          >
                            Número
                          </label>
                          <input
                            id="numero"
                            type="text"
                            inputMode="numeric"
                            required
                            value={numero}
                            onChange={(e) => {
                              const soloNumeros = e.target.value.replace(/\D/g, '');
                              setNumero(soloNumeros);
                            }}
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                            placeholder="Ej. 1234"
                          />
                        </div>
                      </div>

                      {tipoEnvio === 'NACIONAL' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label
                              htmlFor="localidadDestino"
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Localidad
                            </label>
                            <input
                              id="localidadDestino"
                              type="text"
                              required
                              value={localidadDestino}
                              onChange={(e) => setLocalidadDestino(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                              placeholder="Ej. Rosario"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="provinciaDestino"
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Provincia
                            </label>
                            <input
                              id="provinciaDestino"
                              type="text"
                              required
                              value={provinciaDestino}
                              onChange={(e) => setProvinciaDestino(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                              placeholder="Ej. Santa Fe"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="codigoPostal"
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Código Postal
                            </label>
                            <input
                              id="codigoPostal"
                              type="text"
                              required
                              value={codigoPostal}
                              onChange={(e) => setCodigoPostal(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                              placeholder="Ej. S2000"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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