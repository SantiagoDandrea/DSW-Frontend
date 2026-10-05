// Tarjeta individual para mostrar un producto con su foto, nombre, marca y precio.
import { Link } from 'react-router-dom';

export const ProductCard = ({ producto }) => {
  return (
    <Link to={`/producto/${producto.id}`} className="block">
      <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {producto.imagenes[0] ? (
          <img
            src={producto.imagenes[0].url}
            alt={producto.nombre}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{producto.nombre}</h3>
          <p className="text-sm text-gray-500">{producto.marca.nombre}</p>
          <p className="text-xl font-bold text-indigo-600 mt-2">
            ${producto.precioActual.toLocaleString("es-AR")}
          </p>
        </div>
      </article>
    </Link>
  );
};