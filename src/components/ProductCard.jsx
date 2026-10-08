// Tarjeta individual para mostrar un producto con su foto, nombre, marca, descripción y precio.
import { Link } from 'react-router-dom';
import { rutaProducto } from '../utils/urls';

export const ProductCard = ({ producto }) => {
  return (
    <Link to={rutaProducto(producto)} className="block">
      <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {producto.imagenes[0] ? (
          <img
            src={producto.imagenes[0].url}
            alt={producto.nombre}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-600">
            Sin imagen
          </div>
        )}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800">{producto.nombre}</h2>
          <p className="text-sm text-gray-500">{producto.marca.nombre}</p>
          {producto.descripcion && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{producto.descripcion}</p>
          )}
          <p className="text-xl font-bold text-indigo-600 mt-2">
            ${producto.precioActual.toLocaleString("es-AR")}
          </p>
        </div>
      </article>
    </Link>
  );
};