import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from './components/CategoryCard';

export const Home = () => {
  const navigate = useNavigate();
  
  // Clases o categorías de productos
  const categories = [
    {
      id: 'colchones',
      title: 'Colchones',
      image: './src/assets/colchon.jpg'
    },
    {
      id: 'electro',
      title: 'Electro',
      image: './src/assets/electro.jpg'
    },
    {
      id: 'tecnologia',
      title: 'Tecnologia',
      image: './src/assets/tecno.jpg'
    }
  ];

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
      {/* Disposición Mobile-First */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            title={cat.title}
            imageUrl={cat.image}
            onClick={() => navigate(`/categoria/${cat.id}`)}
          />
        ))}
      </div>
    </main>
  );
};