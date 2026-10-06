import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { Home } from '../pages/Home';
import { CategoryProducts } from '../pages/CategoryProducts';
import { ProductDetail } from '../pages/ProductDetail';
import { SearchResults } from '../pages/SearchResults';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Profile } from '../pages/Profile';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminTablasPage } from '../pages/admin/AdminTablasPage';
import { AdminProductosPage } from '../pages/admin/AdminProductosPage';
import { AdminInventarioPage } from '../pages/admin/AdminInventarioPage';
import { AdminPedidosPage } from '../pages/admin/AdminPedidosPage';
import { AdminEnviosPage } from '../pages/admin/AdminEnviosPage';
import { AdminUsuariosPage } from '../pages/admin/AdminUsuariosPage';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { MyOrders } from '../pages/MyOrders';
import { OrderDetail } from '../pages/OrderDetail';

// Wrapper con key para reiniciar el estado de CategoryProducts al cambiar de categoría
// (Patrón recomendado por React 19 para evitar set-state-in-effect en cascading renders)
const CategoryProductsWrapper = () => {
  const { categoryId } = useParams();
  return <CategoryProducts key={categoryId} />;
};

const OrderDetailWrapper = () => {
  const { id } = useParams();
  return <OrderDetail key={id} />;
};

// Componente 404 Not Found
const NotFoundPage = () => (
  <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-6xl font-extrabold text-indigo-600 mb-2">404</h1>
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Página no encontrada</h2>
    <p className="text-gray-500 mb-6">El recurso al que intentas acceder no existe o fue movido.</p>
    <Link to="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
      Ir a la página principal
    </Link>
  </main>
);

/**
 * Enrutador principal centralizado de la aplicación.
 * Define y organiza rutas públicas, protegidas por autenticación y protegidas por rol administrador,
 * alineadas con la arquitectura del proyecto (docs/arquitectura-frontend.md).
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================================================== */}
      {/* 1. Rutas Públicas                                       */}
      {/* ======================================================== */}
      <Route path="/" element={<Home />} />
      <Route path="/categoria/:categoryId" element={<CategoryProductsWrapper />} />
      <Route path="/producto/:id" element={<ProductDetail />} />
      <Route path="/buscar" element={<SearchResults />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      {/* Alias en inglés para compatibilidad */}
      <Route path="/register" element={<Navigate to="/registro" replace />} />

      {/* ======================================================== */}
      {/* 2. Rutas Protegidas (Clientes Autenticados)              */}
      {/* ======================================================== */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* Alias en inglés para compatibilidad */}
      <Route path="/profile" element={<Navigate to="/perfil" replace />} />

      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos/:id"
        element={
          <ProtectedRoute>
            <OrderDetailWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carrito"
        element={<Cart />} />
      <Route
        path="/checkout"
        element={
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  }
/>
      {/* ======================================================== */}
      {/* 3. Rutas Protegidas de Administración (ADMIN)           */}
      {/* ======================================================== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/productos" replace />} />
        <Route path="tablas" element={<AdminTablasPage />} />
        <Route path="productos" element={<AdminProductosPage />} />
        <Route path="inventario" element={<AdminInventarioPage />} />
        <Route path="pedidos" element={<AdminPedidosPage />} />
        <Route path="envios" element={<AdminEnviosPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
      </Route>

      {/* ======================================================== */}
      {/* 4. Ruta Comodín (404 Not Found)                         */}
      {/* ======================================================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
