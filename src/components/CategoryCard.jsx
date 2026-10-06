// Muestra una tarjeta visual de categoría con su imagen y título para navegar a sus productos.
export const CategoryCard = ({ title, imageUrl, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer group h-64 md:h-80 transition-transform duration-300 hover:-translate-y-1"
    >
      <img 
        src={imageUrl} 
        alt={title} 
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
        <h2 className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
          {title}
        </h2>
      </div>
    </div>
  );
};