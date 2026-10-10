// Pantalla de detalle de un producto que muestra sus fotos, precio, descripción y botón para agregarlo al carrito.
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { productoService } from '../services/productoService';
import { useCart } from '../context/useCart';
import { idDeLaRuta, rutaCategoria, rutaProducto } from '../utils/urls';

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

    productoService
      .getProductoById(id)
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
            error: error.message || 'Ocurrió un error inesperado.',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const cargando = resultado.id !== id;
  const { producto, error } = resultado;

  // Si se entró con /producto/29 (sin nombre), la dirección se completa con el nombre sin recargar
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
        ? `${cantidad > 1 ? `${cantidad} unidades agregadas` : 'Producto agregado'} al carrito.`
        : 'No pudimos agregar este producto.',
    });
  }

  if (cargando) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p role="status">Cargando producto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p
          role="alert"
          className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          No pudimos cargar el producto: {error}
        </p>

        <Link
          to="/"
          className="inline-block mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Volver a la tienda
        </Link>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p>No encontramos este producto.</p>

        <Link
          to="/"
          className="inline-block mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Volver a la tienda
        </Link>
      </main>
    );
  }

  const imagenPrincipal = producto.imagenes?.[0]?.url;
  const tienePrecio = producto.precioActual != null;
  const puedeAgregar = producto.disponible && tienePrecio;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
      {producto.categoria && (
        <Link
          to={rutaCategoria(producto.categoria)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Volver a {producto.categoria.nombre}
        </Link>
      )}

      <div className="mt-4 flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-md p-6">
        <div className="w-full md:w-1/2">
          {imagenPrincipal ? (
            <img
              src={imagenPrincipal}
              alt={producto.nombre}
              className="w-full h-80 object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
              Sin imagen
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {producto.nombre}
          </h1>

          {producto.marca && (
            <p className="text-sm text-gray-500">
              {producto.marca.nombre}
            </p>
          )}

          <p className="text-gray-700">
            {producto.descripcion}
          </p>

          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {tienePrecio
              ? Number(producto.precioActual).toLocaleString(
                  'es-AR',
                  {
                    style: 'currency',
                    currency: 'ARS',
                  }
                )
              : 'Precio no disponible'}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block w-fit px-3 py-1 rounded-full text-sm font-medium ${
                producto.disponible
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {producto.disponible ? 'Disponible' : 'Sin stock'}
            </span>

            {producto.disponible && producto.stockDisponible === 1 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                ¡Última Unidad!
              </span>
            )}
          </div>

          {puedeAgregar && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  disabled={cantidad <= 1}
                  onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-gray-600 transition"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="min-w-10 text-center px-2 font-semibold text-gray-800" aria-live="polite">
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
                  className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-gray-600 transition"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!puedeAgregar}
            onClick={handleAgregarAlCarrito}
            className="mt-3 px-5 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
          >
            Agregar al carrito
          </button>

          <p
            role="status"
            aria-live="polite"
            className="text-sm text-gray-700 min-h-5"
          >
            {mensajeCarrito}
          </p>

          {mensajeCarrito && (
            <Link
              to="/carrito"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Ir al carrito →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}