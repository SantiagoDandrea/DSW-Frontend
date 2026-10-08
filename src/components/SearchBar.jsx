// Barra de búsqueda con retraso para escribir y encontrar productos por nombre o descripción.
import { useEffect, useRef, useState } from 'react';

export const SearchBar = ({ onSearch }) => {
  const [valor, setValor] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleChange = (e) => {
    const nuevoValor = e.target.value;
    setValor(nuevoValor);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSearch?.(nuevoValor);
    }, 300);
  };

  return (
    <div role="search" className="w-full px-4 py-3 bg-gray-50">
      <div className="relative max-w-md mx-auto">
        <input
          type="search"
          value={valor}
          onChange={handleChange}
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg aria-hidden="true" className="absolute w-5 h-5 text-gray-500 left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
  );
};
