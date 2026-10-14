// Barra de búsqueda con retraso para escribir y encontrar productos por nombre o descripción.
import { useEffect, useRef, useState } from 'react';
import { IconSearch, IconClose } from './Icons';

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

  const handleClear = () => {
    setValor('');
    clearTimeout(timeoutRef.current);
    onSearch?.('');
  };

  return (
    <div role="search" className="w-full px-4 py-3 bg-white border-b border-slate-200">
      <div className="relative max-w-2xl mx-auto">
        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={valor}
          onChange={handleChange}
          placeholder="Buscar por producto, marca, categoría o modelo..."
          aria-label="Buscar productos"
          className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-none transition duration-150 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs"
        />
        {valor && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-1 rounded-none transition cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
