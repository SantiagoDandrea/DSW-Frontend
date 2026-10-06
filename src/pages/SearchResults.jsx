// Pantalla de resultados de búsqueda que muestra los productos coincidentes y permite filtrarlos.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { useFiltrosProducto } from '../hooks/useFiltrosProducto';
import { productoService } from '../services/productoService';

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
    limpiarFiltros,
    hayFiltrosActivos,
  } = useFiltrosProducto(productos);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        Resultados para "{query}"
      </h1>

      {cargando ? (
        <p>Buscando productos...</p>
      ) : error ? (
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
          No pudimos completar la búsqueda: {error}
        </p>
      ) : productos.length === 0 ? (
        <p>No encontramos productos para "{query}".</p>
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
            hayFiltrosActivos={hayFiltrosActivos}
            limpiarFiltros={limpiarFiltros}
          />
          {productosFiltrados.length === 0 ? (
            <p>No hay productos que coincidan con los filtros.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
