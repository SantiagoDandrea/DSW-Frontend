// Hook personalizado para filtrar una lista de productos en memoria por marca y rango de precios.
import { useMemo, useState } from 'react';

export function useFiltrosProducto(productos) {
  const [marcaId, setMarcaId] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  const marcas = useMemo(() => {
    const vistos = new Map();
    productos.forEach((p) => {
      if (p.marca?.id != null && !vistos.has(p.marca.id)) {
        vistos.set(p.marca.id, p.marca.nombre);
      }
    });
    return Array.from(vistos, ([id, nombre]) => ({ id, nombre }));
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (marcaId && String(p.marca?.id) !== String(marcaId)) return false;
      if (precioMin && Number(p.precioActual) < Number(precioMin)) return false;
      if (precioMax && Number(p.precioActual) > Number(precioMax)) return false;
      return true;
    });
  }, [productos, marcaId, precioMin, precioMax]);

  const limpiarFiltros = () => {
    setMarcaId('');
    setPrecioMin('');
    setPrecioMax('');
  };

  return {
    productosFiltrados,
    marcas,
    marcaId,
    setMarcaId,
    precioMin,
    setPrecioMin,
    precioMax,
    setPrecioMax,
    limpiarFiltros,
    hayFiltrosActivos: Boolean(marcaId || precioMin || precioMax),
  };
}
