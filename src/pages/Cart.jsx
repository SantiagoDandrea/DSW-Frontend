// Pantalla del carrito de compras donde el usuario puede ver sus productos, cambiar cantidades o iniciar la compra.
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { IconCart, IconTrash, IconPackage, IconShield, IconTruck } from '../components/Icons';

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
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white p-10 sm:p-14 rounded-none border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-center text-slate-800">
            <IconCart className="w-10 h-10 stroke-1" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950 tracking-tight uppercase">
            Tu carrito está vacío
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed font-sans">
            Explorá nuestro catálogo y sumá artículos para el hogar, tecnología o descanso.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center mt-8 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs transition duration-150 cursor-pointer"
          >
            Ir a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-sans font-bold uppercase tracking-widest bg-blue-600 text-white mb-2">
            Bolsa de Compras
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-950 tracking-tight uppercase">
            Mi carrito
          </h1>
        </div>

        <Link
          to="/"
          className="text-xs font-sans font-bold uppercase tracking-wider text-blue-600 hover:text-slate-950 transition"
        >
          ← Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista de productos */}
        <section
          aria-label="Productos del carrito"
          className="lg:col-span-8 space-y-4"
        >
          {items.map(({ producto, cantidad }) => {
            const imagen = producto.imagenes?.[0]?.url;
            const precio = Number(producto.precioActual ?? 0);

            return (
              <article
                key={producto.id}
                className="bg-white rounded-none border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row gap-5"
              >
                <Link
                  to={`/producto/${producto.id}`}
                  className="w-full sm:w-28 h-28 bg-slate-50 rounded-none p-2 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden"
                >
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1 text-[10px] font-sans">
                      <IconPackage className="w-5 h-5 text-slate-400" />
                      <span>Sin foto</span>
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link
                        to={`/producto/${producto.id}`}
                        className="text-base font-display font-black uppercase text-slate-950 hover:text-blue-600 transition leading-snug"
                      >
                        {producto.nombre}
                      </Link>

                      {producto.stockDisponible === 1 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none bg-amber-50 text-amber-900 border border-amber-300">
                          ¡Última unidad!
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-600 font-sans">
                      Precio unitario: <span className="font-bold text-slate-950">{mostrarPrecio(precio)}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-950">
                        Cantidad:
                      </span>

                      <div className="flex items-center border border-slate-300 bg-white rounded-none shadow-xs">
                        <button
                          type="button"
                          disabled={cantidad <= 1}
                          onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                          aria-label={`Quitar una unidad de ${producto.nombre}`}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-black text-slate-900 transition cursor-pointer"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center px-2 text-xs font-sans font-bold text-slate-950">
                          {cantidad}
                        </span>

                        <button
                          type="button"
                          disabled={
                            producto.stockDisponible != null &&
                            cantidad >= producto.stockDisponible
                          }
                          onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                          aria-label={`Agregar una unidad de ${producto.nombre}`}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-black text-slate-900 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {producto.stockDisponible != null && cantidad >= producto.stockDisponible && (
                        <span className="text-[10px] text-slate-500 font-sans">
                          (Tope disponible)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-sm sm:text-base font-display font-black text-slate-950">
                        Subtotal: {mostrarPrecio(precio * cantidad)}
                      </p>

                      <button
                        type="button"
                        onClick={() => eliminarProducto(producto.id)}
                        aria-label={`Eliminar ${producto.nombre} del carrito`}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition cursor-pointer border border-transparent hover:border-rose-300"
                        title="Eliminar producto"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={vaciarCarrito}
              className="text-xs font-sans font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 cursor-pointer transition"
            >
              Vaciar carrito
            </button>
          </div>
        </section>

        {/* Resumen de compra (aside) */}
        <aside
          role="complementary"
          aria-label="Resumen de compra"
          className="lg:col-span-4 bg-white rounded-none border border-slate-200 p-6 sm:p-8 sticky top-28 space-y-6 shadow-xs"
        >
          <h2 className="text-base font-display font-black uppercase text-slate-950 border-b border-slate-200 pb-3">
            Resumen de compra
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-700 font-sans">
              <span>Unidades</span>
              <span className="font-bold text-slate-950">{cantidadTotal}</span>
            </div>

            <div className="flex justify-between text-slate-700 font-sans">
              <span>Entrega</span>
              <span className="text-[11px] text-slate-500">A definir en checkout</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold uppercase tracking-wider text-slate-950 text-sm">Subtotal</span>
              <span className="text-2xl font-display font-black text-slate-950">
                {mostrarPrecio(subtotal)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-none border border-slate-200 leading-relaxed font-sans">
            El valor final del envío se computará en base al destino seleccionado (Local Las Parejas o Nacional).
          </p>

          <Link
            to="/checkout"
            className="w-full block py-4 px-6 text-center bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs transition duration-150 cursor-pointer"
          >
            Continuar compra
          </Link>

          <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600 font-sans">
            <div className="flex items-center gap-2">
              <IconTruck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Despachos asegurados a todo el país</span>
            </div>
            <div className="flex items-center gap-2">
              <IconShield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Factura oficial A y B con validez fiscal</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}