import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

export const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    fetch(`http://localhost:3000/api/productos?categoriaId=${categoryId}`)
      .then(res => res.json())
      .then(setProductos)
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, [categoryId]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </main>
  );
};