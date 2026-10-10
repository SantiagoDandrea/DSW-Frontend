// Pantalla de inicio de la tienda que muestra las tarjetas de categorías principales.
import { useState, useEffect } from 'react';
import { CategoryCard } from '../components/CategoryCard';
import colchonImg from '../assets/colchon.jpg';
import electroImg from '../assets/electro.jpg';
import tecnoImg from '../assets/tecno.jpg';

import { categoriaService } from '../services/categoriaService';
import { rutaCategoria } from '../utils/urls';

const imagenPorDefecto = electroImg;
const imagenesPorCategoria = {
  "Colchones": colchonImg,
  "Electro": electroImg,
  "Electrodomesticos": electroImg,
  "Tecnologia": tecnoImg,
};

export const Home = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoriaService.getCategorias()
      .then(setCategorias)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
      <h1 className="sr-only">MiTienda: colchones, tecnología y electrodomésticos</h1>

      {cargando ? (
        <p role="status">Cargando categorías...</p>
      ) : error ? (
        <p role="alert" className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
          No pudimos cargar las categorías: {error}
        </p>
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
          {categorias.map((cat) => (
            <CategoryCard
              key={cat.id}
              title={cat.nombre}
              imageUrl={imagenesPorCategoria[cat.nombre] || imagenPorDefecto}
              to={rutaCategoria(cat)}
            />
          ))}
        </div>
      )}
    </main>
  );
};