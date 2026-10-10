// Muestra una tarjeta visual de categoría con su imagen y título para navegar a sus productos.
import { Link } from 'react-router-dom';

export const CategoryCard = ({ title, imageUrl, to }) => {
  return (
    <Link
      to={to}
      className="relative block overflow-hidden rounded-xl shadow-lg group h-64 md:h-80 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <img
        src={imageUrl}
        alt=""
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
        <h2 className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
          {title}
        </h2>
      </div>
    </Link>
  );
};
