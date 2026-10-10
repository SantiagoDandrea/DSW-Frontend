// Panel de filtros que permite buscar productos por marca, rango de precio y opcionalmente ordenar.
export const ProductFilters = ({
  marcas,
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
    <div className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
      {marcas.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="filtro-marca">
            Marca
          </label>
          <select
            id="filtro-marca"
            value={marcaId}
            onChange={(e) => setMarcaId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="filtro-precio-min">
          Precio mín.
        </label>
        <input
          id="filtro-precio-min"
          type="number"
          min="0"
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
          placeholder="$0"
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="filtro-precio-max">
          Precio máx.
        </label>
        <input
          id="filtro-precio-max"
          type="number"
          min="0"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
          placeholder="Sin límite"
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {mostrarOrden && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="filtro-orden">
            Ordenar por
          </label>
          <select
            id="filtro-orden"
            value={orden}
            onChange={(e) => setOrden?.(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
          </select>
        </div>
      )}

      {rangoPrecioInvalido && (
        <p role="alert" className="w-full text-sm text-rose-700">
          El precio mínimo no puede ser mayor que el máximo. Corregí el rango para ver los productos.
        </p>
      )}

      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={limpiarFiltros}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium pb-2 cursor-pointer"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};
