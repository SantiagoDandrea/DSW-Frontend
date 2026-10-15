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
import { idDeLaRuta } from '../utils/urls';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { MyOrders } from '../pages/MyOrders';
import { OrderDetail } from '../pages/OrderDetail';

const CategoryProductsWrapper = () => {
  const { categoryId } = useParams();
  return <CategoryProducts key={idDeLaRuta(categoryId)} />;
};

const OrderDetailWrapper = () => {
  const { id } = useParams();
  return <OrderDetail key={id} />;
};

const NotFoundPage = () => (
  <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto py-16 sm:py-24">
    <div className="w-16 h-16 rounded-none bg-blue-600 border border-blue-400 flex items-center justify-center text-white font-black text-xl font-display shadow-xs mb-4">
      404
    </div>
    <span className="inline-block px-3 py-1 rounded-none text-[10px] font-sans font-bold uppercase tracking-widest bg-slate-950 text-white mb-2">
      Error de Localización
    </span>
    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display uppercase mb-2">
      Página no encontrada
    </h1>
    <p className="text-xs text-slate-500 mb-6 leading-relaxed font-sans">
      El recurso solicitado no existe o fue reubicado en otra sección del catálogo.
    </p>
    <Link
      to="/"
      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-black uppercase tracking-wider shadow-xs transition"
    >
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
