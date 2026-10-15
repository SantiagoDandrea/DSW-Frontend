// Pantalla que lista y filtra los productos pertenecientes a una categoría específica con diseño moderno y responsivo.
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { useFiltrosProducto } from '../hooks/useFiltrosProducto';
import { productoService } from '../services/productoService';
import { categoriaService } from '../services/categoriaService';
import { idDeLaRuta, rutaCategoria } from '../utils/urls';
import { IconPackage } from '../components/Icons';

export const CategoryProducts = () => {
  const { categoryId: parametroId } = useParams();
  const categoryId = idDeLaRuta(parametroId);
  const location = useLocation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    categoriaService.getCategoriaById(categoryId)
      .then((data) => {
        if (!ignore) setCategoria(data);
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

    productoService.getProductosByCategoria(categoryId)
      .then((data) => {
        if (!ignore) setProductos(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setCargando(false);
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

  const nombreCategoria = categoria?.nombre || productos[0]?.categoria?.nombre || 'Categoría';

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb de Navegación Comercial */}
      <nav aria-label="Ruta de navegación" className="mb-4 font-sans text-xs tracking-normal text-slate-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-blue-600 transition font-medium">Inicio</Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">/</li>
          <li className="text-slate-950 font-bold">{nombreCategoria}</li>
        </ol>
      </nav>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-sans font-bold uppercase tracking-wider bg-blue-600 text-white mb-3">
            Colección Oficial
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-950 tracking-tight uppercase">
            {nombreCategoria}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl font-sans">
            Explorá los modelos disponibles con garantía oficial y hasta 12 cuotas fijas.
          </p>
        </div>

        {!cargando && !error && (
          <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-none self-start sm:self-auto">
            <span className="text-blue-600 font-bold">{productosFiltrados.length}</span>
            <span>{productosFiltrados.length === 1 ? 'artículo disponible' : 'artículos disponibles'}</span>
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
        <div role="alert" className="p-6 bg-rose-50 border border-rose-200 text-rose-950 text-sm rounded-none">
          <p className="font-bold uppercase tracking-wider">No pudimos cargar los productos de esta categoría</p>
          <p className="mt-1 text-xs font-sans">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-none p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-none flex items-center justify-center text-slate-600 border border-slate-200">
            <IconPackage className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-black text-slate-950 mb-1 uppercase tracking-tight">
            No hay productos en esta categoría
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 font-sans">
            Actualmente estamos renovando el inventario de esta sección.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-none transition cursor-pointer"
          >
            Volver a la tienda
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
                <div className="w-16 h-16 mx-auto mb-3 bg-slate-50 rounded-none flex items-center justify-center text-slate-600 border border-slate-200">
                  <IconPackage className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-display font-black text-slate-950 mb-1 uppercase tracking-tight">
                  Sin coincidencias de filtros
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 font-sans">
                  No encontramos productos que cumplan con la marca o rango de precio elegido.
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