// Pantalla de detalle de un producto con fotografía en alta resolución, disponibilidad, selector y ficha de compra.
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { productoService } from '../services/productoService';
import { useCart } from '../context/useCart';
import { idDeLaRuta, rutaCategoria, rutaProducto } from '../utils/urls';
import {
  IconCart,
  IconPackage,
  IconTruck,
  IconShield,
  IconCreditCard,
  IconCheck,
} from '../components/Icons';

export function ProductDetail() {
  const { id: parametroId } = useParams();
  const id = idDeLaRuta(parametroId);
  const location = useLocation();
  const navigate = useNavigate();
  const { agregarProducto } = useCart();
  const [cantidad, setCantidad] = useState(1);

  const [resultado, setResultado] = useState({
    id: null,
    producto: null,
    error: null,
  });

  const [avisoCarrito, setAvisoCarrito] = useState({
    id: null,
    mensaje: '',
  });

  useEffect(() => {
    let ignore = false;

    productoService.getProductoById(id)
      .then((producto) => {
        if (!ignore) {
          setCantidad(1);
          setResultado({
            id,
            producto,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setResultado({
            id,
            producto: null,
            error: error.message || 'Ocurrió un error inesperado al cargar el producto.',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const cargando = resultado.id !== id;
  const { producto, error } = resultado;

  useEffect(() => {
    if (!producto || resultado.id !== id) return;

    const rutaCompleta = rutaProducto(producto);
    if (location.pathname !== rutaCompleta) {
      navigate(rutaCompleta, { replace: true });
    }
  }, [producto, resultado.id, id, location.pathname, navigate]);

  const mensajeCarrito =
    avisoCarrito.id === id ? avisoCarrito.mensaje : '';

  function handleAgregarAlCarrito() {
    const agregado = agregarProducto(producto, cantidad);
    if (agregado) {
      setCantidad(1);
    }

    setAvisoCarrito({
      id,
      mensaje: agregado
        ? `${cantidad > 1 ? `${cantidad} unidades agregadas` : 'Producto agregado'} al carrito con éxito.`
        : 'No pudimos agregar este producto al carrito.',
    });
  }

  if (cargando) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-slate-200 p-8">
          <div className="h-96 md:h-[500px] bg-slate-100 animate-pulse rounded-none" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-100 animate-pulse rounded-none" />
            <div className="h-10 w-3/4 bg-slate-100 animate-pulse rounded-none" />
            <div className="h-8 w-1/3 bg-slate-100 animate-pulse rounded-none" />
            <div className="h-24 w-full bg-slate-100 animate-pulse rounded-none" />
            <div className="h-12 w-full bg-slate-100 animate-pulse rounded-none" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
        <div className="bg-white p-10 border border-slate-200 rounded-none shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 text-rose-600 border border-rose-300 rounded-none flex items-center justify-center">
            <IconPackage className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-display font-black text-slate-950 uppercase tracking-tight mb-2">
            {error || 'No encontramos este producto'}
          </h1>
          <p className="text-xs text-slate-600 mb-6 font-sans">
            Es posible que el artículo haya sido modificado o no esté disponible actualmente.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-none transition"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  const imagenPrincipal = producto.imagenes?.[0]?.url;
  const tienePrecio = producto.precioActual != null;
  const puedeAgregar = producto.disponible && tienePrecio;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb de navegación Comercial */}
      <nav aria-label="Ruta de navegación" className="mb-6 font-sans text-xs uppercase tracking-wider text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="hover:text-blue-600 transition font-bold">Inicio</Link>
          </li>
          {producto.categoria && (
            <>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li>
                <Link
                  to={rutaCategoria(producto.categoria)}
                  className="hover:text-blue-600 transition font-bold"
                >
                  {producto.categoria.nombre}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="text-slate-300">/</li>
          <li className="text-slate-950 font-black truncate max-w-[200px] sm:max-w-xs">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      {/* Tarjeta de Detalle Principal: Architectural Split */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm grid grid-cols-1 lg:grid-cols-12">
        {/* Lado Izquierdo: Fotografía de exhibición */}
        <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-12 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 relative">
          {imagenPrincipal ? (
            <div className="w-full h-80 sm:h-96 lg:h-[480px] flex items-center justify-center overflow-hidden">
              <img
                src={imagenPrincipal}
                alt={producto.nombre}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-full h-80 sm:h-96 flex flex-col items-center justify-center text-slate-400 gap-2 text-xs font-sans">
              <IconPackage className="w-12 h-12 text-slate-300 stroke-1" />
              <span>Sin imagen disponible</span>
            </div>
          )}

          {/* Insignia de marca flotante */}
          {producto.marca?.nombre && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-none bg-slate-900 text-white">
                {producto.marca.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Lado Derecho: Especificaciones, Precio y Compra */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none border ${
                  producto.disponible
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {producto.disponible ? 'Disponible' : 'Sin stock'}
              </span>

              {producto.disponible && producto.stockDisponible === 1 && (
                <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-none bg-amber-50 text-amber-900 border border-amber-300">
                  ¡Última unidad!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950 tracking-tight leading-tight uppercase">
              {producto.nombre}
            </h1>

            {producto.descripcion && (
              <p className="text-sm text-slate-700 leading-relaxed font-sans border-l-2 border-blue-600 pl-3">
                {producto.descripcion}
              </p>
            )}

            <div className="pt-4 border-t border-slate-200">
              <span className="text-[11px] font-sans font-bold text-slate-500 block uppercase tracking-widest">
                Precio al contado
              </span>
              <p className="text-3xl sm:text-4xl font-display font-black text-slate-950 mt-1 tracking-tight">
                {tienePrecio
                  ? Number(producto.precioActual).toLocaleString('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    })
                  : 'Precio no disponible'}
              </p>
              {tienePrecio && (
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">
                  Hasta 12 cuotas fijas con todas las tarjetas
                </p>
              )}
            </div>
          </div>

          {/* Bloque de Compra */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            {puedeAgregar && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Cantidad:
                </span>
                <div className="flex items-center border border-slate-300 bg-white rounded-none shadow-xs">
                  <button
                    type="button"
                    disabled={cantidad <= 1}
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-black text-slate-900 transition cursor-pointer"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="min-w-10 text-center px-3 font-sans font-bold text-slate-950 text-sm" aria-live="polite">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    disabled={cantidad >= Math.max(1, producto.stockDisponible || 1)}
                    onClick={() =>
                      setCantidad((prev) =>
                        Math.min(Math.max(1, producto.stockDisponible || 1), prev + 1)
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-black text-slate-900 transition cursor-pointer"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              id="main-add-to-cart"
              type="button"
              disabled={!puedeAgregar}
              onClick={handleAgregarAlCarrito}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <IconCart className="w-5 h-5" />
              <span>{puedeAgregar ? 'Agregar al carrito' : 'Producto no disponible'}</span>
            </button>

            {/* Aviso de confirmación */}
            {mensajeCarrito && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-none flex items-center justify-between gap-2 text-xs text-emerald-950 shadow-xs">
                <div className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span role="status" aria-live="polite" className="font-semibold">{mensajeCarrito}</span>
                </div>
                <Link
                  to="/carrito"
                  className="font-bold underline uppercase tracking-wider hover:text-emerald-700 shrink-0"
                >
                  Ver Carrito →
                </Link>
              </div>
            )}

            {/* Beneficios comerciales de confianza */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600 font-sans">
              <div className="flex items-center gap-2.5">
                <IconTruck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Envíos a todo el país o retiro en sucursal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconShield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Garantía oficial y facturación electrónica A y B</span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconCreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Pagos protegidos: tarjetas, débito y transferencias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BUY BAR EN MÓVIL (storefront-ui responsive-storefront pattern) */}
      {puedeAgregar && (
        <aside
          aria-label="Barra de compra rápida"
          className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg p-3 px-4 flex items-center justify-between gap-3 md:hidden print:hidden"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-950 truncate uppercase">{producto.nombre}</p>
            <p className="text-sm font-display font-black text-blue-600">
              {Number(producto.precioActual).toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAgregarAlCarrito}
            className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <IconCart className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </aside>
      )}
    </main>
  );
}
