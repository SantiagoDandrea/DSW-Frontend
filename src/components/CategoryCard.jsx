// Muestra una tarjeta visual de categoría con fotografía de alta calidad, gradiente y diseño editorial.
import { Link } from 'react-router-dom';

export const CategoryCard = ({ title, imageUrl, to, subtitle, className = '' }) => {
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-none border border-slate-900 bg-slate-950 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-blue-600 px-3 py-1 rounded-none">
            Línea Oficial
          </span>
          <span className="text-white text-xs font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <span>Explorar</span>
            <span>→</span>
          </span>
        </div>

        <div className="space-y-2 pt-12">
          <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            {subtitle || 'Modelos y especificaciones'}
          </span>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-snug">
              {title}
            </h2>
            <div className="w-10 h-10 rounded-none bg-white group-hover:bg-blue-600 text-slate-950 group-hover:text-white flex items-center justify-center transition-colors duration-150 shrink-0 font-bold text-base">
              →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
