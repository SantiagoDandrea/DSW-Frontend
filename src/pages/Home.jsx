// Pantalla de inicio con arquitectura visual editorial de alto impacto para comercio digital: líneas geométricas nítidas, tipografía asimétrica y paleta azul cobalto.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import colchonImg from '../assets/colchon.jpg';
import electroImg from '../assets/electro.jpg';
import tecnoImg from '../assets/tecno.jpg';

import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { rutaCategoria } from '../utils/urls';
import {
  IconSearch,
  IconArrowRight,
} from '../components/Icons';

const imagenesPorCategoria = {
  Colchones: colchonImg,
  Electro: electroImg,
  Electrodomesticos: electroImg,
  'Electrodomésticos': electroImg,
  Tecnologia: tecnoImg,
  'Tecnología': tecnoImg,
};

export const Home = () => {
  const [categorias, setCategorias] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(null);

  useEffect(() => {
    let ignore = false;

    categoriaService
      .getCategorias()
      .then((data) => {
        if (!ignore && Array.isArray(data)) setCategorias(data);
      })
      .catch((err) => {
        if (!ignore) setErrorCategorias(err.message);
      })
      .finally(() => {
        if (!ignore) setCargandoCategorias(false);
      });

    productoService
      .getProductos()
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setProductosDestacados(data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setCargandoProductos(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="flex-1 w-full bg-white text-slate-900 overflow-hidden">
      <h1 className="sr-only">MiTienda: E-commerce de Colchones, Tecnología y Electrodomésticos</h1>

      {/* HERO EDITORIAL ARQUITECTÓNICO (Lineal, Asimétrico, Cero Bordes Redondeados) */}
      <section className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Bloque Principal del Hero */}
          <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-none" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                  Edición Comercial Oficial
                </span>
              </div>

              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[0.98] uppercase">
                Tecnología, <br />
                Descanso & <br />
                <span className="text-blue-500">Hogar.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-sans max-w-xl leading-relaxed">
                Catálogo especializado de colchones de alta densidad, telefonía, informática y electrodomésticos con garantía de fábrica y facturación oficial A y B.
              </p>
            </div>

            <div className="pt-4 space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-slate-700">
                <a
                  href="#categorias"
                  className="px-8 py-4 bg-blue-600 hover:bg-white hover:text-slate-950 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ver Categorías</span>
                  <IconArrowRight className="w-4 h-4" />
                </a>

                <Link
                  to="/buscar"
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-colors border-t sm:border-t-0 sm:border-l border-slate-700 flex items-center justify-center gap-2"
                >
                  <IconSearch className="w-4 h-4 text-slate-400" />
                  <span>Todos los Productos</span>
                </Link>
              </div>

              {/* Parámetros Verídicos de Operación */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400">
                <div>
                  <span className="text-white font-bold block text-sm font-display">12 Cuotas</span>
                  <span>Tarjetas y Débito</span>
                </div>
                <div>
                  <span className="text-white font-bold block text-sm font-display">Envíos</span>
                  <span>A Todo el País</span>
                </div>
                <div>
                  <span className="text-white font-bold block text-sm font-display">Sucursal</span>
                  <span>Las Parejas, SF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bloque Visual Lateral: Fotografía con Enfoque Directo */}
          <div className="lg:col-span-5 relative bg-slate-900 flex flex-col justify-between">
            <div className="relative aspect-square lg:aspect-auto lg:h-full w-full overflow-hidden">
              <img
                src={colchonImg}
                alt="Sistemas de descanso ortopédico"
                className="w-full h-full object-cover grayscale-20 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded-none">
                  Línea Descanso
                </span>
                <p className="text-xl font-bold font-display uppercase tracking-tight">
                  Sommiers y Colchones Ortopédicos
                </p>
                <p className="text-xs text-slate-300">
                  Espuma de alta densidad y resortes pocket con soporte certificado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MATRIZ DE CATEGORÍAS (3 Categorías Exclusivas, Cero Repetición, Cero Redondeos) */}
      <section id="categorias" className="border-b border-slate-900 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 sm:p-10 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-1">
                01. Estructura del Catálogo
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-slate-950">
                Nuestras Categorías
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm uppercase tracking-wide">
              Seleccione la división correspondiente para ver unidades disponibles y precios.
            </p>
          </div>

          {cargandoCategorias ? (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : errorCategorias ? (
            <div role="alert" className="p-8 text-rose-700 text-sm">
              <p className="font-bold">Error de catálogo: {errorCategorias}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {categorias.map((cat, idx) => {
                const img = imagenesPorCategoria[cat.nombre] || electroImg;
                return (
                  <Link
                    key={cat.id}
                    to={rutaCategoria(cat)}
                    className="group relative h-96 sm:h-[440px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 bg-slate-950 text-white transition-all"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={img}
                        alt={cat.nombre}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-xs font-sans font-bold text-blue-400 tracking-widest">
                        0{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 group-hover:bg-blue-600 text-white transition-colors">
                        Catálogo
                      </span>
                    </div>

                    <div className="relative z-10 space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                        {cat.nombre}
                      </h3>
                      <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs font-bold uppercase tracking-wider">
                        <span>Ingresar</span>
                        <span className="transform group-hover:translate-x-1.5 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* VITRINA DE PRODUCTOS (4 Productos Seleccionados con bordes nítidos) */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 sm:p-10 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-1">
                02. Colección Destacada
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-slate-950">
                Productos Seleccionados
              </h2>
            </div>
            <Link
              to="/buscar"
              className="px-5 py-2.5 bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Ver Todo</span>
              <span>→</span>
            </Link>
          </div>

          {cargandoProductos ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-slate-200 bg-white">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-white">
              {productosDestacados.map((prod) => (
                <ProductCard key={prod.id} producto={prod} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};