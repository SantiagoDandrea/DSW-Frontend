// Componente principal que define la estructura global de la app, proveedores de contexto y barra superior.
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/useCart';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Footer } from './components/Footer';
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
    '/perfil',
    '/producto',
    '/productos',
  ];

  const showSearchBar = !hideSearchBarRoutes.some(
    (path) => location.pathname.startsWith(path)
  );

  const esAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col print:bg-white print:min-h-0 antialiased selection:bg-blue-600 selection:text-white">
      <Header cartCount={cantidadTotal} />

      {showSearchBar && (
        <div className="print:hidden">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <AppRoutes />
      </div>

      {!esAdmin && <Footer />}
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