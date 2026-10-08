// Estructura visual del panel de administración con menú lateral de navegación y área de contenido.
import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const menuItems = [
    { to: '/admin/productos', label: 'Productos', icon: '📦' },
    { to: '/admin/inventario', label: 'Inventario & Precios', icon: '📊' },
    { to: '/admin/pedidos', label: 'Pedidos & Ventas', icon: '🛍️' },
    { to: '/admin/envios', label: 'Envíos', icon: '🚚' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
    { to: '/admin/tablas', label: 'Tablas Maestras', icon: '🗂️' },
  ];

  const obtenerTituloActual = () => {
    if (location.pathname.startsWith('/admin/productos')) return 'Catálogo de Productos';
    if (location.pathname.startsWith('/admin/inventario')) return 'Gestión de Inventario y Precios';
    if (location.pathname.startsWith('/admin/pedidos')) return 'Ventas y Pedidos';
    if (location.pathname.startsWith('/admin/envios')) return 'Gestión de Envíos';
    if (location.pathname.startsWith('/admin/usuarios')) return 'Administración de Usuarios';
    if (location.pathname.startsWith('/admin/tablas')) return 'Tablas Maestras y Configuración';
    return 'Panel de Administración';
  };

  return (
    <div className="flex-1 flex min-h-[calc(100vh-65px)] bg-gray-100">
      {sidebarAbierto && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight">AdminPanel</h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                Rol Admin
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarAbierto(false)}
            aria-label="Cerrar menú"
            className="md:hidden text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav aria-label="Menú de administración" className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Módulos del Sistema
          </div>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span aria-hidden="true" className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <span aria-hidden="true">🏪</span>
            <span>Volver a la Tienda</span>
          </Link>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="truncate">
              <p className="font-semibold text-slate-200 truncate">{usuario?.nombre || 'Administrador'}</p>
              <p className="text-[11px] text-slate-400 truncate">{usuario?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <span aria-hidden="true">🚪</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div role="region" aria-label="Sección actual del panel" className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarAbierto(true)}
              className="p-2 text-gray-600 hover:text-gray-900 md:hidden rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                {obtenerTituloActual()}
              </h1>
              <span className="text-xs text-gray-500 hidden sm:inline">
                Panel de control y gestión comercial
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Conectado
            </span>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
