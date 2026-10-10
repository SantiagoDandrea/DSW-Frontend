// Componente principal que define la estructura global de la app, proveedores de contexto y barra superior.
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/useCart';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { AppRoutes } from './routes/AppRoutes';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cantidadTotal } = useCart();

  const handleSearch = (query) => {
    const termino = query.trim();
    if (!termino) return;
    navigate(`/buscar?q=${encodeURIComponent(termino)}`, {
      replace: location.pathname.startsWith('/buscar'),
    });
  };

  const hideSearchBarRoutes = [
    '/login',
    '/registro',
    '/register',
    '/checkout',
    '/admin',
    '/carrito',
    '/mis-pedidos',
    '/pedidos',
  ];

  const showSearchBar = !hideSearchBarRoutes.some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col print:bg-white print:min-h-0">
      <Header cartCount={cantidadTotal} />

      {showSearchBar && (
        <div className="print:hidden">
          <SearchBar onSearch={handleSearch} />
        </div>
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