import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productoService } from '../services/productoService';

export const ProductDetail = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    productoService.getProductoById(id)
      .then((data) => {
        if (!ignore) {
          setProducto(data);
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
  }, [id]);

  if (cargando) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
          No pudimos cargar el producto: {error}
        </p>
      </main>
    );
  }

  const imagenPrincipal = producto.imagenes[0]?.url;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
      {producto.categoria && (
        <Link
          to={`/categoria/${producto.categoria.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Volver a {producto.categoria.nombre}
        </Link>
      )}

      <div className="mt-4 flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-md p-6">
        <div className="w-full md:w-1/2">
          {imagenPrincipal ? (
            <img
              src={imagenPrincipal}
              alt={producto.nombre}
              className="w-full h-80 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-400 rounded-lg">
              Sin imagen
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
          <p className="text-sm text-gray-500">{producto.marca?.nombre}</p>
          <p className="text-gray-700">{producto.descripcion}</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            ${producto.precioActual?.toLocaleString('es-AR')}
          </p>
          <span
            className={`inline-block w-fit px-3 py-1 rounded-full text-sm font-medium ${
              producto.disponible
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {producto.disponible ? 'Disponible' : 'Sin stock'}
          </span>
        </div>
      </div>
    </main>
  );
};
