// Tarjeta individual para mostrar un producto con fotografía de alta calidad, marca, descripción, precio y disponibilidad.
import { Link } from 'react-router-dom';
import { rutaProducto } from '../utils/urls';
import { IconPackage } from './Icons';

export const ProductCard = ({ producto }) => {
  const tienePrecio = producto.precioActual != null;
  const imagen = producto.imagenes?.[0]?.url;

  return (
    <Link
      to={rutaProducto(producto)}
      className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <article className="h-full bg-white rounded-none border border-slate-200 group-hover:border-slate-900 transition-colors duration-150 flex flex-col justify-between overflow-hidden">
        {/* Contenedor de Imagen con Insignias */}
        <div className="relative w-full h-44 sm:h-60 bg-slate-50 p-4 sm:p-6 flex items-center justify-center overflow-hidden border-b border-slate-200">
          {imagen ? (
            <img
              src={imagen}
              alt={producto.nombre}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 text-xs">
              <IconPackage className="w-8 h-8 stroke-1 text-slate-300" />
              <span>Sin foto</span>
            </div>
          )}

          {/* Badges de marca y stock */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {producto.marca?.nombre ? (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded-none">
                {producto.marca.nombre}
              </span>
            ) : <span />}

            {producto.disponible && producto.stockDisponible === 1 && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white rounded-none">
                Última unidad
              </span>
            )}

            {!producto.disponible && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-700 text-white rounded-none">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Información del Producto */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug font-sans">
              {producto.nombre}
            </h2>

            {producto.descripcion && (
              <p className="hidden sm:block mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {producto.descripcion}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-end justify-between gap-2">
            <div>
              <p className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight font-display">
                {tienePrecio
                  ? Number(producto.precioActual).toLocaleString('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    })
                  : 'A consultar'}
              </p>
              {tienePrecio && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 block mt-0.5">
                  Hasta 12 cuotas fijas
                </span>
              )}
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-none bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center transition-colors duration-150 shrink-0 font-bold text-xs sm:text-sm">
              →
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};