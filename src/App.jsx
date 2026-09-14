import { useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Home } from './pages/Home';
import { CategoryProducts } from './pages/CategoryProducts';
import { ProductDetail } from './pages/ProductDetail';

import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';

const CategoryProductsWrapper = () => {
  const { categoryId } = useParams();
  return <CategoryProducts key={categoryId} />;
};

export function App() {
  const [cart] = useState([]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Componentes persistentes en todas las páginas */}
          <Header cartCount={cart.length} />
          <SearchBar onSearch={(query) => console.log(query)} />
          
          {/* Renderizado dinámico según la URL */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:categoryId" element={<CategoryProductsWrapper />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;