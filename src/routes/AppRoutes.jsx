import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { Home } from '../pages/Home';
import { CategoryProducts } from '../pages/CategoryProducts';
import { ProductDetail } from '../pages/ProductDetail';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Profile } from '../pages/Profile';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Wrapper con key para reiniciar el estado de CategoryProducts al cambiar de categoría
// (Patrón recomendado por React 19 para evitar set-state-in-effect en cascading renders)
const CategoryProductsWrapper = () => {
  const { categoryId } = useParams();
  return <CategoryProducts key={categoryId} />;
};

// Componente placeholder para rutas en desarrollo
const PlaceholderPage = ({ title, description }) => (
  <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
        Volver al inicio
      </Link>
    </div>
  </main>
);

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
            <PlaceholderPage title="Mis Pedidos" description="Historial de compras y seguimiento de entregas." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos/:id"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Detalle del Pedido" description="Detalle exhaustivo del pedido, productos, datos de envío y estado." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carrito"
        element={
          <PlaceholderPage title="Carrito de Compras" description="Revisión de productos seleccionados previo a la compra." />
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Checkout" description="Finalización de compra y procesamiento de pagos." />
          </ProtectedRoute>
        }
      />

      {/* ======================================================== */}
      {/* 3. Rutas Protegidas de Administración (ADMIN)           */}
      {/* ======================================================== */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <PlaceholderPage title="Panel de Administración" description="Gestión de catálogo, stock y usuarios del sistema." />
          </AdminRoute>
        }
      />

      {/* ======================================================== */}
      {/* 4. Ruta Comodín (404 Not Found)                         */}
      {/* ======================================================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
