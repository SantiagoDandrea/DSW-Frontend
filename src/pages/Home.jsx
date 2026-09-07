import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from '../components/CategoryCard';
import colchonImg from '../assets/colchon.jpg';
import electroImg from '../assets/electro.jpg';
import tecnoImg from '../assets/tecno.jpg';

const imagenPorDefecto = electroImg;
const imagenesPorCategoria = {
  "Colchones": colchonImg,
  "Electro": electroImg,
  "Electrodomesticos": electroImg,
  "Tecnologia": tecnoImg,
};

export const Home = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/categorias")
      .then(res => res.json())
      .then(setCategorias)
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
      {cargando ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
          {categorias.map((cat) => (
            <CategoryCard
              key={cat.id}
              title={cat.nombre}
              imageUrl={imagenesPorCategoria[cat.nombre] || imagenPorDefecto}
              onClick={() => navigate(`/categoria/${cat.id}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
};