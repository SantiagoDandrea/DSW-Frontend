// Pantalla de resultados de búsqueda que muestra los productos coincidentes y permite filtrarlos.
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { useFiltrosProducto } from '../hooks/useFiltrosProducto';
import { productoService } from '../services/productoService';
import { IconSearch, IconPackage } from '../components/Icons';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [resultado, setResultado] = useState({ query: null, productos: [], error: null });

  useEffect(() => {
    let ignore = false;

    productoService.getProductos({ nombre: query })
      .then((productos) => {
        if (!ignore) {
          setResultado({ query, productos, error: null });
        }
      })
      .catch((err) => {
        if (!ignore) {
          setResultado({ query, productos: [], error: err.message });
        }
      });

    return () => {
      ignore = true;
    };
  }, [query]);

  const cargando = resultado.query !== query;
  const { productos, error } = resultado;

  const {
    productosFiltrados,
    marcas,
    marcaId,
    setMarcaId,
    precioMin,
    setPrecioMin,
    precioMax,
    setPrecioMax,
    orden,
    setOrden,
    limpiarFiltros,
    hayFiltrosActivos,
    rangoPrecioInvalido,
  } = useFiltrosProducto(productos);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-sans font-bold uppercase tracking-wider bg-blue-600 text-white mb-2">
            Catálogo Comercial
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-950 tracking-tight uppercase">
            {query ? `Resultados para «${query}»` : 'Todos los Productos'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-sans">
            Explorá los artículos disponibles con garantía oficial y cuotas sin interés.
          </p>
        </div>

        {!cargando && !error && (
          <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-none self-start sm:self-auto">
            <span className="text-blue-600 font-bold">{productosFiltrados.length}</span>
            <span>{productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}</span>
          </span>
        )}
      </div>

      {cargando ? (
        <div className="space-y-6">
          <div className="h-28 bg-slate-100 rounded-none animate-pulse border border-slate-200" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-none animate-pulse border border-slate-200" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div role="alert" className="p-6 bg-rose-50 border border-rose-200 text-rose-950 text-sm rounded-none flex items-start gap-3">
          <div className="font-bold uppercase tracking-wider">Ocurrió un error al buscar productos:</div>
          <p className="text-xs mt-0.5 font-sans">{error}</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-none p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-center text-slate-700">
            <IconSearch className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-black text-slate-950 mb-2 uppercase tracking-tight">
            No encontramos productos para «{query}»
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 font-sans">
            Intentá con palabras más generales o explorá nuestras categorías principales.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-none transition cursor-pointer"
          >
            Explorar todas las categorías
          </Link>
        </div>
      ) : (
        <>
          <ProductFilters
            marcas={marcas}
            marcaId={marcaId}
            setMarcaId={setMarcaId}
            precioMin={precioMin}
            setPrecioMin={setPrecioMin}
            precioMax={precioMax}
            setPrecioMax={setPrecioMax}
            orden={orden}
            setOrden={setOrden}
            mostrarOrden={true}
            hayFiltrosActivos={hayFiltrosActivos}
            limpiarFiltros={limpiarFiltros}
            rangoPrecioInvalido={rangoPrecioInvalido}
          />
          {productosFiltrados.length === 0 ? (
            rangoPrecioInvalido ? null : (
              <div className="bg-white border border-slate-200 rounded-none p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-center text-slate-400">
                  <IconPackage className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-display font-black text-slate-950 mb-1 uppercase tracking-tight">
                  Sin coincidencias de filtros
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 font-sans">
                  No hay productos que cumplan con la marca o rango de precio elegido.
                </p>
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-wider text-xs rounded-none transition cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
              {productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};
