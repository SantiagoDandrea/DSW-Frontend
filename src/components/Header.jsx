import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { categoriaService } from '../services/categoriaService';
import { rutaCategoria } from '../utils/urls';
import {
  IconCart,
  IconUser,
  IconPackage,
  IconShield,
  IconLogout,
  IconMenu,
  IconClose,
  IconStore,
} from './Icons';

const CATEGORIAS_DEFAULT = [
  { id: 7, nombre: 'Colchones' },
  { id: 9, nombre: 'Electrodomésticos' },
  { id: 8, nombre: 'Tecnología' },
];

export const Header = ({ cartCount = 0 }) => {
  const { usuario, isAuthenticated, esAdmin, logout } = useAuth();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT);
  const location = useLocation();

  useEffect(() => {
    let ignore = false;
    categoriaService
      .getCategorias()
      .then((data) => {
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setCategorias(data);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const cerrarMenu = () => setMenuMovilAbierto(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
      {/* Ticker continuo superior con beneficios comerciales auténticos */}
      <div className="bg-slate-950 text-white py-2 px-4 overflow-hidden select-none border-b border-slate-800">
        <div className="animate-ticker text-xs font-semibold tracking-wide flex items-center whitespace-nowrap">
          <span className="flex items-center gap-8 pr-8">
            <span className="text-blue-400 font-bold">
              ENVÍOS A TODO EL PAÍS
            </span>
            <span>Seguimiento online de tu compra</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">HASTA 12 CUOTAS FIJAS</span>
            <span>Tarjetas de crédito y transferencias bancarias</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">RETIRO GRATIS</span>
            <span>Sin cargo extra en nuestro local de Las Parejas, Santa Fe</span>
            <span className="text-slate-600">•</span>
            <span>Garantía oficial directa y factura electrónica A y B</span>
          </span>
          <span className="flex items-center gap-8 pr-8" aria-hidden="true">
            <span className="text-blue-400 font-bold">
              ENVÍOS A TODO EL PAÍS
            </span>
            <span>Seguimiento online de tu compra</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">HASTA 12 CUOTAS FIJAS</span>
            <span>Tarjetas de crédito y transferencias bancarias</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">RETIRO GRATIS</span>
            <span>Sin cargo extra en nuestro local de Las Parejas, Santa Fe</span>
            <span className="text-slate-600">•</span>
            <span>Garantía oficial directa y factura electrónica A y B</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo / Marca Comercial */}
          <Link
            to="/"
            onClick={cerrarMenu}
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 text-white rounded-none flex items-center justify-center font-display font-extrabold text-xl shadow-xs transition-colors duration-200">
              <IconStore className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-extrabold tracking-tight text-slate-900 leading-none">
                Mi<span className="text-blue-600">Tienda</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mt-1">
                Comercio Digital
              </span>
            </div>
          </Link>

          {/* Categorías destacadas en desktop */}
          <nav className="hidden lg:flex items-center gap-1 text-xs uppercase tracking-wider font-bold text-slate-700">
            {categorias.map((cat) => {
              const esActivo = location.pathname.includes(cat.nombre.toLowerCase());
              return (
                <Link
                  key={cat.id}
                  to={rutaCategoria(cat)}
                  className={`px-4 py-2.5 rounded-none transition-all duration-150 ${
                    esActivo
                      ? 'bg-blue-600 text-white font-extrabold'
                      : 'hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.nombre}
                </Link>
              );
            })}
          </nav>

          {/* Acciones de usuario y carrito en desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 px-3 py-2 rounded-none text-xs font-semibold text-slate-700 hover:bg-slate-100 transition border border-slate-300"
                >
                  <div className="w-5 h-5 rounded-none bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{usuario?.nombre || 'Perfil'}</span>
                </Link>

                {esAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide bg-slate-900 text-white hover:bg-blue-600 rounded-none transition"
                    title="Panel de Administración"
                  >
                    <IconShield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  to="/mis-pedidos"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 hover:bg-slate-100 rounded-none border border-transparent hover:border-slate-300 transition"
                >
                  <IconPackage className="w-4 h-4 text-slate-500" />
                  <span>Mis Pedidos</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition cursor-pointer"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <IconLogout className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-white hover:bg-slate-900 px-4 py-2.5 border border-slate-900 rounded-none transition duration-150"
              >
                <IconUser className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
            )}

            {/* Separador */}
            <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

            {/* Carrito / Bolsa */}
            <Link
              to="/carrito"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-blue-600 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-none transition duration-150 shadow-xs btn-tactile cursor-pointer"
              aria-label={
                cartCount > 0
                  ? `Ver carrito de compras, ${cartCount} ${cartCount === 1 ? 'unidad' : 'unidades'}`
                  : 'Ver carrito de compras'
              }
            >
              <IconCart className="w-4 h-4" />
              <span>Carrito</span>
              <span className="px-1.5 py-0.5 rounded-none text-[11px] font-extrabold bg-white text-blue-700">
                {cartCount}
              </span>
            </Link>
          </div>

          {/* Acciones visibles en móvil: Carrito y Botón de menú */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/carrito"
              onClick={cerrarMenu}
              className="relative p-2.5 text-slate-900 hover:text-blue-600 transition"
              aria-label={
                cartCount > 0
                  ? `Ver carrito de compras, ${cartCount} ${cartCount === 1 ? 'unidad' : 'unidades'}`
                  : 'Ver carrito de compras'
              }
            >
              <IconCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-blue-600 rounded-none"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="p-2.5 text-slate-900 hover:bg-slate-100 rounded-none transition cursor-pointer"
              aria-expanded={menuMovilAbierto}
              aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuMovilAbierto ? <IconClose className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer desplegable en móvil */}
      {menuMovilAbierto && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-8 space-y-5 shadow-lg">
          {/* Navegación rápida por categorías */}
          <div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Categorías
            </span>
            <div className="grid grid-cols-1 gap-1">
              {categorias.map((cat) => (
                <Link
                  key={cat.id}
                  to={rutaCategoria(cat)}
                  onClick={cerrarMenu}
                  className="px-3.5 py-2.5 text-sm font-bold uppercase text-slate-800 hover:text-white hover:bg-slate-900 rounded-none border border-slate-200 transition flex items-center justify-between"
                >
                  <span>{cat.nombre}</span>
                  <span className="text-xs text-blue-600 font-sans">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Mi Cuenta
            </span>
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-none bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {usuario?.nombre || 'Usuario'}
                      </p>
                      <p className="text-xs font-sans text-slate-500 truncate">{usuario?.email}</p>
                    </div>
                  </div>
                  {esAdmin && (
                    <span className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider bg-slate-950 text-white rounded-none">
                      Admin
                    </span>
                  )}
                </div>

                <Link
                  to="/perfil"
                  onClick={cerrarMenu}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-none transition"
                >
                  <IconUser className="w-4 h-4 text-slate-600" />
                  <span>Mi Perfil</span>
                </Link>

                <Link
                  to="/mis-pedidos"
                  onClick={cerrarMenu}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-none transition"
                >
                  <IconPackage className="w-4 h-4 text-slate-600" />
                  <span>Mis Pedidos</span>
                </Link>

                {esAdmin && (
                  <Link
                    to="/admin"
                    onClick={cerrarMenu}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-blue-600 rounded-none transition"
                  >
                    <IconShield className="w-4 h-4 text-blue-400" />
                    <span>Panel de Administración</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    cerrarMenu();
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-none transition cursor-pointer"
                >
                  <IconLogout className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={cerrarMenu}
                  className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-none shadow-xs transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={cerrarMenu}
                  className="block w-full text-center py-3 px-4 bg-white text-slate-900 hover:bg-slate-100 font-bold uppercase tracking-wider text-xs rounded-none border border-slate-300 shadow-xs transition"
                >
                  Crear Cuenta Nueva
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};