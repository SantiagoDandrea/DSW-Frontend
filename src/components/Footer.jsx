// Pie de página general con información institucional, beneficios de compra y enlaces rápidos.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriaService } from '../services/categoriaService';
import { rutaCategoria } from '../utils/urls';
import { IconStore, IconTruck, IconCreditCard, IconShield } from './Icons';

const CATEGORIAS_DEFAULT = [
  { id: 7, nombre: 'Colchones' },
  { id: 9, nombre: 'Electrodomésticos' },
  { id: 8, nombre: 'Tecnología' },
];

export const Footer = () => {
  const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT);

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
  return (
    <footer className="bg-slate-950 text-slate-300 mt-auto border-t border-slate-800 print:hidden relative overflow-hidden">
      {/* Barra de beneficios comerciales */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:pr-6">
              <div className="w-10 h-10 rounded-none bg-blue-600 border border-blue-400 text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2563eb]">
                <IconTruck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight font-display uppercase">
                  Envíos a Todo el País
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Logística directa desde nuestro depósito central en Las Parejas hasta tu puerta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6">
              <div className="w-10 h-10 rounded-none bg-blue-600 border border-blue-400 text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2563eb]">
                <IconCreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight font-display uppercase">
                  Múltiples Medios de Pago
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Transferencias bancarias, efectivo y financiación con tarjetas de débito y crédito.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-none bg-blue-600 border border-blue-400 text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2563eb]">
                <IconShield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight font-display uppercase">
                  Garantía y Confianza
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  100% productos originales con soporte postventa y factura electrónica A y B.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal del footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-800/80">
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-none bg-blue-600 border border-white flex items-center justify-center text-white shadow-[2px_2px_0px_#ffffff]">
                <IconStore className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight font-display uppercase">
                  MiTienda
                </span>
                <span className="block text-[10px] text-blue-400 font-sans font-bold tracking-wider uppercase">
                  Hogar, Tecnología & Descanso
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Plataforma de comercio digital para equipamiento integral del hogar: tecnología moderna, sistemas ortopédicos de descanso y electrodomésticos con garantía oficial.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>CUIT: 30-71492044-8 • Responsable Inscripto</p>
              <p>Showroom & Depósito: Las Parejas (SF), Argentina</p>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-display">
              Categorías
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={rutaCategoria(cat)}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-slate-600">›</span>
                    <span>{cat.nombre}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/buscar"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 font-semibold text-slate-300"
                >
                  <span className="text-slate-600">›</span>
                  <span>Todos los productos</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-display">
              Mi Cuenta
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/mis-pedidos" className="hover:text-blue-400 transition-colors">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link to="/perfil" className="hover:text-blue-400 transition-colors">
                  Datos de Perfil
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-blue-400 transition-colors">
                  Carrito de Compras
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">
                  Acceso Cliente
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-display">
              Atención al Cliente
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <p>Lunes a Sábados</p>
              <p className="text-white font-bold">08:00 a 20:00 hs</p>
              <p className="text-blue-400 pt-1 font-medium">soporte@mitienda.com</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MiTienda Comercio Digital. Todos los derechos reservados.</p>
          <p className="text-[11px] text-slate-400">
            Pagos seguros con cifrado SSL • Envíos asegurados a todo el país
          </p>
        </div>
      </div>
    </footer>
  );
};
