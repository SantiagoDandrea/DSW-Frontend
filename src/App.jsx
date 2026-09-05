import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Home } from './pages/Home';
//import { CategoryProducts } from './pages/CategoryProducts';

export function App() {
  const [cart, setCart] = useState([]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Componentes persistentes en todas las páginas */}
        <Header cartCount={cart.length} userName="Juan Pérez" />
        <SearchBar onSearch={(query) => console.log(query)} />
        
        {/* Renderizado dinámico según la URL */}
        <Routes>
          <Route path="/" element={<Home/>} />
          {/*<Route path="/categoria/:categoryId" element={<CategoryProducts />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;