// Pantalla del carrito de compras donde el usuario puede ver sus productos, cambiar cantidades o iniciar la compra.
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

export function Cart() {
  const {
    items,
    cantidadTotal,
    subtotal,
    cambiarCantidad,
    eliminarProducto,
    vaciarCarrito,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h1>

          <p className="mt-3 text-gray-600">
            Explorá la tienda y agregá productos para comenzar.
          </p>

          <Link
            to="/"
            className="inline-block mt-6 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Ir a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Mi carrito
        </h1>

        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800"
        >
          Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section
          aria-label="Productos del carrito"
          className="lg:col-span-2 space-y-4"
        >
          {items.map(({ producto, cantidad }) => {
            const imagen = producto.imagenes?.[0]?.url;
            const precio = Number(producto.precioActual ?? 0);

            return (
              <article
                key={producto.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to={`/producto/${producto.id}`}
                  className="shrink-0"
                >
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={producto.nombre}
                      className="w-full sm:w-28 h-28 object-contain"
                    />
                  ) : (
                    <div className="w-full sm:w-28 h-28 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                      Sin imagen
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/producto/${producto.id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {producto.nombre}
                    </Link>

                    {producto.stockDisponible === 1 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ¡Última Unidad!
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    Precio por unidad: {mostrarPrecio(precio)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-700">
                      Cantidad:
                    </span>

                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        disabled={cantidad <= 1}
                        onClick={() =>
                          cambiarCantidad(producto.id, cantidad - 1)
                        }
                        aria-label={`Quitar una unidad de ${producto.nombre}`}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        −
                      </button>

                      <span className="min-w-10 text-center px-2">
                        {cantidad}
                      </span>

                      <button
                        type="button"
                        disabled={
                          producto.stockDisponible != null &&
                          cantidad >= producto.stockDisponible
                        }
                        onClick={() =>
                          cambiarCantidad(producto.id, cantidad + 1)
                        }
                        aria-label={`Agregar una unidad de ${producto.nombre}`}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {producto.stockDisponible != null && cantidad >= producto.stockDisponible && (
                      <span className="text-xs text-gray-500">
                        (Máximo disponible)
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.id)}
                      aria-label={`Eliminar ${producto.nombre} del carrito`}
                      className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>

                  <p className="mt-4 font-semibold text-gray-900">
                    Subtotal: {mostrarPrecio(precio * cantidad)}
                  </p>
                </div>
              </article>
            );
          })}

          <button
            type="button"
            onClick={vaciarCarrito}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Vaciar carrito
          </button>
        </section>

        <aside className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900">
            Resumen de compra
          </h2>

          <div className="mt-4 flex justify-between text-gray-600">
            <span>Unidades</span>
            <span>{cantidadTotal}</span>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between gap-4 font-bold text-gray-900">
            <span>Subtotal</span>
            <span>{mostrarPrecio(subtotal)}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Los precios y el stock se verificarán al confirmar
            el pedido. El envío se calculará según la entrega.
          </p>

          <Link
            to="/checkout"
            className="block mt-6 px-5 py-3 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Continuar compra
          </Link>
        </aside>
      </div>
    </main>
  );
}