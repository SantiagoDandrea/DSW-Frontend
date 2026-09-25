import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { AppRoutes } from './routes/AppRoutes';

function AppLayout() {
  const location = useLocation();

  // Ocultar SearchBar en páginas donde no corresponde navegación de catálogo
  const hideSearchBarRoutes = ['/login', '/registro', '/register', '/checkout', '/admin', '/carrito'];
  const showSearchBar = !hideSearchBarRoutes.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header persistente */}
      <Header />

      {/* SearchBar condicional para catálogo */}
      {showSearchBar && <SearchBar onSearch={(query) => console.log('Búsqueda:', query)} />}

      {/* Rutas centralizadas */}
      <AppRoutes />
    </div>
  );
}

/**
 * Componente raíz de la aplicación.
 * Actúa como contenedor de Providers globales y Layout general persistente.
 */
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;