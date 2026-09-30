import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/useCart';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { AppRoutes } from './routes/AppRoutes';

function AppLayout() {
  const location = useLocation();
  const { cantidadTotal } = useCart();

  const hideSearchBarRoutes = [
    '/login',
    '/registro',
    '/register',
    '/checkout',
    '/admin',
    '/carrito',
  ];

  const showSearchBar = !hideSearchBarRoutes.some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header cartCount={cantidadTotal} />

      {showSearchBar && (
        <SearchBar
          onSearch={(query) => console.log('Búsqueda:', query)}
        />
      )}

      <AppRoutes />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;