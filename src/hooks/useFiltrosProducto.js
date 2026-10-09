// Hook personalizado para filtrar una lista de productos en memoria por marca y rango de precios.
import { useMemo, useState } from 'react';

export function useFiltrosProducto(productos) {
  const [marcaId, setMarcaId] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [orden, setOrden] = useState('');

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
    const filtrados = productos.filter((p) => {
      if (marcaId && String(p.marca?.id) !== String(marcaId)) return false;
      if (precioMin && Number(p.precioActual) < Number(precioMin)) return false;
      if (precioMax && Number(p.precioActual) > Number(precioMax)) return false;
      return true;
    });

    if (!orden) return filtrados;

    return [...filtrados].sort((a, b) => {
      if (orden === 'precio-asc') {
        return Number(a.precioActual ?? 0) - Number(b.precioActual ?? 0);
      }
      if (orden === 'precio-desc') {
        return Number(b.precioActual ?? 0) - Number(a.precioActual ?? 0);
      }
      if (orden === 'nombre-asc') {
        return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
      }
      return 0;
    });
  }, [productos, marcaId, precioMin, precioMax, orden]);

  const limpiarFiltros = () => {
    setMarcaId('');
    setPrecioMin('');
    setPrecioMax('');
    setOrden('');
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
    orden,
    setOrden,
    limpiarFiltros,
    hayFiltrosActivos: Boolean(marcaId || precioMin || precioMax || orden),
  };
}
