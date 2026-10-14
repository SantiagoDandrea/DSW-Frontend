// Panel de filtros que permite buscar productos por marca, rango de precio y opcionalmente ordenar.
import { IconClose } from './Icons';

export const ProductFilters = ({
  marcas = [],
  marcaId,
  setMarcaId,
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
  orden = 'nombre-asc',
  setOrden,
  mostrarOrden = true,
  hayFiltrosActivos,
  limpiarFiltros,
  rangoPrecioInvalido = false,
}) => {
  if (marcas.length === 0 && !mostrarOrden) {
    return null;
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-none border border-slate-200 shadow-xs mb-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
            Filtrar y Ordenar Catálogo
          </span>
          {hayFiltrosActivos && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none bg-blue-600 text-white">
              Filtros activos
            </span>
          )}
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 cursor-pointer transition"
          >
            <IconClose className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end font-sans">
        {marcas.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="filtro-marca">
              Marca
            </label>
            <select
              id="filtro-marca"
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="filtro-precio-min">
            Precio Mínimo
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
            <input
              id="filtro-precio-min"
              type="number"
              min="0"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              placeholder="0"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="filtro-precio-max">
            Precio Máximo
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
            <input
              id="filtro-precio-max"
              type="number"
              min="0"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="Sin límite"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>
        </div>

        {mostrarOrden && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="filtro-orden">
              Ordenar Por
            </label>
            <select
              id="filtro-orden"
              value={orden}
              onChange={(e) => setOrden?.(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-none text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="nombre-asc">Nombre (A - Z)</option>
              <option value="precio-asc">Menor precio primero</option>
              <option value="precio-desc">Mayor precio primero</option>
            </select>
          </div>
        )}
      </div>

      {rangoPrecioInvalido && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-300 text-xs text-rose-900 rounded-none font-bold">
          El precio mínimo no puede ser superior al máximo. Por favor verificá los valores.
        </div>
      )}
    </div>
  );
};
