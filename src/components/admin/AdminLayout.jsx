// Estructura visual del panel de administración con menú lateral de navegación y área de contenido.
import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  IconPackage,
  IconChart,
  IconCart,
  IconTruck,
  IconUsers,
  IconFolder,
  IconStore,
  IconLogout,
  IconMenu,
  IconClose,
  IconShield,
} from '../Icons';

export const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const menuItems = [
    { to: '/admin/productos', label: 'Productos', icon: IconPackage },
    { to: '/admin/inventario', label: 'Inventario & Precios', icon: IconChart },
    { to: '/admin/pedidos', label: 'Pedidos & Ventas', icon: IconCart },
    { to: '/admin/envios', label: 'Envíos', icon: IconTruck },
    { to: '/admin/usuarios', label: 'Usuarios', icon: IconUsers },
    { to: '/admin/tablas', label: 'Tablas Maestras', icon: IconFolder },
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
    <div className="flex-1 flex min-h-[calc(100dvh-116px)] bg-slate-100/70">
      {/* Backdrop en pantallas móviles: strictly below header */}
      {sidebarAbierto && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarAbierto(false)}
          className="fixed top-[116px] inset-x-0 bottom-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Barra lateral / Sidebar: strictly below header, never superimposes */}
      <aside
        className={`fixed top-[116px] bottom-0 left-0 z-30 md:static md:top-auto md:bottom-auto w-64 bg-slate-950 text-slate-300 flex flex-col md:sticky md:top-[116px] md:h-[calc(100dvh-116px)] transition-transform duration-200 ease-in-out md:translate-x-0 border-r border-slate-800 shrink-0 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <IconShield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight font-display">
                AdminPanel
              </h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-950/70 border border-blue-500/20 px-1.5 py-0.5 rounded-none">
                Rol Administrador
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarAbierto(false)}
            aria-label="Cerrar menú"
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-none transition cursor-pointer"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Menú de administración" className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Módulos del Sistema
          </div>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-none text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/80">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-none transition"
          >
            <IconStore className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Volver a la Tienda</span>
          </Link>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="truncate mr-2">
              <p className="font-semibold text-slate-200 truncate">{usuario?.nombre || 'Administrador'}</p>
              <p className="text-[11px] text-slate-400 truncate">{usuario?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="p-2 hover:text-rose-400 hover:bg-slate-900 rounded-none transition cursor-pointer"
            >
              <IconLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal del Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          role="region"
          aria-label="Sección actual del panel"
          className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarAbierto(true)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-none hover:bg-slate-100 transition cursor-pointer"
              aria-label="Abrir menú"
            >
              <IconMenu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight font-display">
                {obtenerTituloActual()}
              </h1>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Control comercial, catálogo e inventario
              </span>
            </div>
          </div>

          <div />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
