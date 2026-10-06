// Define todas las rutas de navegación de la aplicación (públicas, de clientes y del panel de administración).
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

const CategoryProductsWrapper = () => {
  const { categoryId } = useParams();
  return <CategoryProducts key={categoryId} />;
};

const OrderDetailWrapper = () => {
  const { id } = useParams();
  return <OrderDetail key={id} />;
};

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

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categoria/:categoryId" element={<CategoryProductsWrapper />} />
      <Route path="/producto/:id" element={<ProductDetail />} />
      <Route path="/buscar" element={<SearchResults />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/register" element={<Navigate to="/registro" replace />} />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
