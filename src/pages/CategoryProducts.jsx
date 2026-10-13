// Pantalla que lista y filtra los productos pertenecientes a una categoría específica.
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { useFiltrosProducto } from '../hooks/useFiltrosProducto';
import { productoService } from '../services/productoService';
import { categoriaService } from '../services/categoriaService';
import { idDeLaRuta, rutaCategoria } from '../utils/urls';

export const CategoryProducts = () => {
  const { categoryId: parametroId } = useParams();
  const categoryId = idDeLaRuta(parametroId);
  const location = useLocation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // El nombre solo se usa para el título; si falla la consulta la pantalla funciona igual sin él
  useEffect(() => {
    let ignore = false;

    categoriaService.getCategoriaById(categoryId)
      .then((data) => {
        if (!ignore) {
          setCategoria(data);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [categoryId]);

  // Si se entró con /categoria/25 (sin nombre), la dirección se completa con el nombre sin recargar
  useEffect(() => {
    if (!categoria) return;

    const rutaCompleta = rutaCategoria(categoria);
    if (location.pathname !== rutaCompleta) {
      navigate(rutaCompleta, { replace: true });
    }
  }, [categoria, location.pathname, navigate]);

  useEffect(() => {
    let ignore = false;

    categoriaService.getCategoriaById(categoryId)
      .then((cat) => {
        if (!ignore) setCategoria(cat);
      })
      .catch(() => {});

    productoService.getProductosByCategoria(categoryId)
      .then((data) => {
        if (!ignore) {
          setProductos(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setCargando(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [categoryId]);

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

  const nombreCategoria = categoria?.nombre || productos[0]?.categoria?.nombre || '';

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
      {nombreCategoria && (
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {nombreCategoria}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Explorá los productos disponibles en esta categoría.
          </p>
        </div>
      )}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : error ? (
        <p role="alert" className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
          No pudimos cargar los productos: {error}
        </p>
      ) : productos.length === 0 ? (
        <p>No hay productos en esta categoría.</p>
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
            rangoPrecioInvalido ? null : <p>No hay productos que coincidan con los filtros.</p>
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