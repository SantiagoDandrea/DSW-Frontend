// Hook personalizado para filtrar una lista de productos en memoria por marca y rango de precios.
import { useMemo, useState } from 'react';

export function useFiltrosProducto(productos) {
  const [marcaId, setMarcaId] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [orden, setOrden] = useState('nombre-asc');

  const marcas = useMemo(() => {
    const vistos = new Map();
    productos.forEach((p) => {
      if (p.marca?.id != null && !vistos.has(p.marca.id)) {
        vistos.set(p.marca.id, p.marca.nombre);
      }
    });
    return Array.from(vistos, ([id, nombre]) => ({ id, nombre }));
  }, [productos]);

  const rangoPrecioInvalido = Boolean(
    precioMin && precioMax && Number(precioMin) > Number(precioMax)
  );

  const productosFiltrados = useMemo(() => {
    if (rangoPrecioInvalido) return [];

    const filtrados = productos.filter((p) => {
      if (marcaId && String(p.marca?.id) !== String(marcaId)) return false;
      if (precioMin && Number(p.precioActual) < Number(precioMin)) return false;
      if (precioMax && Number(p.precioActual) > Number(precioMax)) return false;
      return true;
    });

    return [...filtrados].sort((a, b) => {
      if (orden === 'precio-asc') {
        return Number(a.precioActual ?? 0) - Number(b.precioActual ?? 0);
      }
      if (orden === 'precio-desc') {
        return Number(b.precioActual ?? 0) - Number(a.precioActual ?? 0);
      }
      return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
    });
  }, [productos, marcaId, precioMin, precioMax, rangoPrecioInvalido, orden]);

  const limpiarFiltros = () => {
    setMarcaId('');
    setPrecioMin('');
    setPrecioMax('');
    setOrden('nombre-asc');
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
    rangoPrecioInvalido,
    hayFiltrosActivos: Boolean(marcaId || precioMin || precioMax || (orden && orden !== 'nombre-asc')),
  };
}
