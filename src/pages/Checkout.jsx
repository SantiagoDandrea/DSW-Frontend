// Pantalla de checkout para seleccionar método de pago, envío o retiro y confirmar el pedido.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { pedidoService } from '../services/pedidoService';
import {
  IconCheck,
  IconTruck,
  IconShield,
  IconPackage,
} from '../components/Icons';

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

function mensajeDeCompraFallida(error) {
  if (error.status === 409 && /^Stock insuficiente/.test(error.message || '')) {
    const producto = /para el producto "(.+?)"/.exec(error.message)?.[1];

    return producto
      ? `No hay stock suficiente de "${producto}" para completar tu pedido. Probá con una cantidad menor o quitalo del carrito.`
      : 'No hay stock suficiente de alguno de los productos para completar tu pedido. Probá con una cantidad menor.';
  }

  return error.status
    ? error.message
    : 'No pudimos confirmar la respuesta del servidor. Antes de reintentar, verificá si el pedido fue creado.';
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

    pedidoService.getMediosPago()
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
      setErrorCompra(mensajeDeCompraFallida(error));
    } finally {
      solicitudEnCurso.current = false;
      setEnviando(false);
    }
  }

  if (pedidoCreado) {
    return (
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-none border border-slate-200 shadow-sm p-6 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-none bg-emerald-50 border border-emerald-400 text-emerald-600 flex items-center justify-center">
            <IconCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950 tracking-tight uppercase">
            Pedido creado correctamente
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-sans">
            Tu orden ha sido registrada en el sistema y se encuentra lista para su procesamiento.
          </p>

          <div className="mt-8 p-6 bg-slate-50 rounded-none border border-slate-200 text-left space-y-3 font-sans">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-600 uppercase">Número de pedido:</span>
              <strong className="text-slate-950 text-base font-black">#{pedidoCreado.id}</strong>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-600 uppercase">Estado de la orden:</span>
              <span className="px-2.5 py-0.5 rounded-none text-xs font-bold uppercase bg-amber-50 text-amber-900 border border-amber-300">
                {pedidoCreado.estado}
              </span>
            </div>

            {pedidoCreado.envio && (
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-600 uppercase">Costo de envío:</span>
                <span className="font-bold text-slate-950">
                  {mostrarPrecio(pedidoCreado.envio.costo)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
              <span className="text-slate-950 font-bold uppercase">Total abonado / pactado:</span>
              <span className="text-2xl font-display font-black text-slate-950">
                {mostrarPrecio(pedidoCreado.total)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/pedidos/${pedidoCreado.id}`}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs transition"
            >
              Ver comprobante y detalle →
            </Link>

            <Link
              to="/mis-pedidos"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold uppercase tracking-wider text-xs rounded-none transition shadow-xs"
            >
              Ir a mis pedidos
            </Link>

            <Link
              to="/"
              className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-xs rounded-none transition"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-none p-10 border border-slate-200 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-none bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center">
            <IconPackage className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-black text-slate-950 mb-2 uppercase tracking-tight">
            Tu carrito está vacío
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 font-sans">
            Agregá productos desde el catálogo para proceder con la confirmación de tu orden.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-black uppercase tracking-wider transition shadow-xs"
          >
            Ir a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-blue-600 block mb-0.5">
            Paso final
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950 tracking-tight uppercase">
            Confirmar pedido
          </h1>
        </div>

        <Link
          to="/carrito"
          className="text-xs font-sans font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition"
        >
          ← Volver al carrito
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Formulario de Pago y Envío */}
        <div className="lg:col-span-7 bg-white rounded-none border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          {cargando ? (
            <div className="p-8 text-center text-slate-500 space-y-3 font-sans text-xs">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent" />
              <p role="status">Cargando medios de pago disponibles...</p>
            </div>
          ) : errorCarga ? (
            <div role="alert" className="p-4 bg-rose-50 border border-rose-300 rounded-none text-rose-950 text-xs font-sans">
              <p className="font-bold uppercase tracking-wider">{errorCarga}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 px-3.5 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-rose-700 shadow-xs"
              >
                Reintentar carga
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmarCompra} className="space-y-6">
              <fieldset disabled={enviando} className="space-y-6">
                {/* Selección de Medio de Pago */}
                <div>
                  <label htmlFor="medioPago" className="block text-xs font-bold uppercase tracking-wider text-slate-950 mb-2 font-sans">
                    Medio de pago
                  </label>
                  <select
                    id="medioPago"
                    required
                    value={medioPagoId}
                    onChange={(event) => setMedioPagoId(event.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition shadow-xs"
                  >
                    <option value="">Seleccioná una opción de pago</option>
                    {mediosPago.map((medio) => (
                      <option key={medio.id} value={medio.id}>
                        {medio.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Forma de Entrega */}
                <div>
                  <label htmlFor="entrega" className="block text-xs font-bold uppercase tracking-wider text-slate-950 mb-2 font-sans">
                    Forma de entrega
                  </label>
                  <select
                    id="entrega"
                    value={requiereEnvio ? 'envio' : 'retiro'}
                    onChange={(event) => setRequiereEnvio(event.target.value === 'envio')}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition shadow-xs"
                  >
                    <option value="retiro">Retiro en el local — Gratis</option>
                    <option value="envio">Envío a domicilio</option>
                  </select>
                </div>

                {/* Opciones de Envío si aplica */}
                {requiereEnvio && (
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-none space-y-4">
                    <div>
                      <label htmlFor="tipoEnvio" className="block text-xs font-bold uppercase tracking-wider text-slate-950 mb-1.5 font-sans">
                        Zona de entrega
                      </label>
                      <select
                        id="tipoEnvio"
                        required
                        value={tipoEnvio}
                        onChange={(event) => setTipoEnvio(event.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition shadow-xs"
                      >
                        <option value="">Seleccioná la zona de entrega</option>
                        <option value="LOCAL">Envío local (Las Parejas) — $3.000</option>
                        <option value="NACIONAL">Envío nacional (Resto del país) — $15.000</option>
                      </select>
                    </div>

                    {tipoEnvio && (
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-950 block font-sans">
                          Dirección de destino {tipoEnvio === 'LOCAL' ? '(Las Parejas)' : ''}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label htmlFor="calle" className="block text-xs font-sans font-bold uppercase text-slate-600 mb-1">
                              Calle
                            </label>
                            <input
                              id="calle"
                              type="text"
                              required
                              value={calle}
                              onChange={(e) => setCalle(e.target.value)}
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
                              placeholder="Ej. San Martín"
                            />
                          </div>

                          <div>
                            <label htmlFor="numero" className="block text-xs font-sans font-bold uppercase text-slate-600 mb-1">
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
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
                              placeholder="Ej. 1234"
                            />
                          </div>
                        </div>

                        {tipoEnvio === 'NACIONAL' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label htmlFor="localidadDestino" className="block text-xs font-sans font-bold uppercase text-slate-600 mb-1">
                                Localidad
                              </label>
                              <input
                                id="localidadDestino"
                                type="text"
                                required
                                value={localidadDestino}
                                onChange={(e) => setLocalidadDestino(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
                                placeholder="Ej. Rosario"
                              />
                            </div>

                            <div>
                              <label htmlFor="provinciaDestino" className="block text-xs font-sans font-bold uppercase text-slate-600 mb-1">
                                Provincia
                              </label>
                              <input
                                id="provinciaDestino"
                                type="text"
                                required
                                value={provinciaDestino}
                                onChange={(e) => setProvinciaDestino(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
                                placeholder="Ej. Santa Fe"
                              />
                            </div>

                            <div>
                              <label htmlFor="codigoPostal" className="block text-xs font-sans font-bold uppercase text-slate-600 mb-1">
                                Código Postal
                              </label>
                              <input
                                id="codigoPostal"
                                type="text"
                                required
                                value={codigoPostal}
                                onChange={(e) => setCodigoPostal(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
                                placeholder="Ej. S2505"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {errorCompra && (
                  <div role="alert" className="p-3.5 bg-rose-50 border border-rose-300 text-rose-950 text-xs font-sans font-bold rounded-none shadow-xs">
                    {errorCompra}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs hover:shadow-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {enviando ? 'Creando pedido...' : 'Confirmar pedido'}
                </button>
              </fieldset>
            </form>
          )}
        </div>

        {/* Columna Derecha: Resumen de Orden */}
        <aside className="lg:col-span-5 bg-white rounded-none border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 sticky top-28">
          <h2 className="text-base font-display font-black uppercase text-slate-950 border-b border-slate-200 pb-3">
            Detalle del pedido ({items.length} {items.length === 1 ? 'ítem' : 'ítems'})
          </h2>

          <ul className="divide-y divide-slate-200 max-h-80 overflow-y-auto pr-1 space-y-2">
            {items.map(({ producto, cantidad }) => (
              <li key={producto.id} className="pt-2 flex justify-between gap-3 text-xs font-sans">
                <div>
                  <span className="font-bold text-slate-950 block">{producto.nombre}</span>
                  <span className="text-slate-500">Cantidad: {cantidad}</span>
                </div>
                <span className="font-bold text-slate-950 shrink-0">
                  {mostrarPrecio(Number(producto.precioActual ?? 0) * cantidad)}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs font-sans">
            <div className="flex justify-between text-slate-700">
              <span>Subtotal productos:</span>
              <span className="font-bold text-slate-950">{mostrarPrecio(subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-700">
              <span>Costo de entrega:</span>
              <span className="font-bold text-slate-950">
                {!requiereEnvio
                  ? 'Gratis (Retiro en local)'
                  : !tipoEnvio
                    ? 'Seleccioná zona'
                    : tipoEnvio === 'LOCAL'
                      ? `${mostrarPrecio(3000)} (Local)`
                      : `${mostrarPrecio(15000)} (Nacional)`}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
              <span className="font-bold uppercase tracking-wider text-slate-950">Total a abonar:</span>
              <span className="text-2xl font-display font-black text-slate-950">
                {mostrarPrecio(totalEstimado)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-sans space-y-1.5">
            <div className="flex items-center gap-2">
              <IconShield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Emisión de comprobante legal de compra</span>
            </div>
            <div className="flex items-center gap-2">
              <IconTruck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Preparación inmediata una vez confirmado</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}