// Administra los productos del carrito de compras, sus cantidades y los almacena en el navegador.
import { useEffect, useState } from 'react';
import { CartContext } from './cart-context';

const STORAGE_KEY = 'carrito';

function cargarCarrito() {
  try {
    const guardado = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );

    if (!Array.isArray(guardado)) return [];

    return guardado.filter(
      (item) =>
        item &&
        item.producto &&
        item.producto.id != null &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(cargarCarrito);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.warn('No pudimos guardar el carrito:', error);
    }
  }, [items]);

  // Al cerrar sesión se vacía el carrito para que no lo herede la próxima persona que use el navegador
  useEffect(() => {
    const vaciarAlCerrarSesion = () => setItems([]);

    window.addEventListener('auth:logout', vaciarAlCerrarSesion);
    return () => {
      window.removeEventListener('auth:logout', vaciarAlCerrarSesion);
    };
  }, []);

  function agregarProducto(producto, cantidad = 1) {
    if (
      !producto?.disponible ||
      producto.precioActual == null ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      return false;
    }

    const maxStock = producto.stockDisponible != null ? producto.stockDisponible : Infinity;

    setItems((anteriores) => {
      const existe = anteriores.some(
        (item) => item.producto.id === producto.id
      );

      if (existe) {
        return anteriores.map((item) =>
          item.producto.id === producto.id
            ? {
                producto,
                cantidad: Math.min(maxStock, item.cantidad + cantidad),
              }
            : item
        );
      }

      return [
        ...anteriores,
        { producto, cantidad: Math.min(maxStock, cantidad) },
      ];
    });

    return true;
  }

  function cambiarCantidad(productoId, cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return;
    }

    setItems((anteriores) =>
      anteriores.map((item) => {
        if (item.producto.id !== productoId) return item;
        const maxStock =
          item.producto.stockDisponible != null ? item.producto.stockDisponible : Infinity;
        return { ...item, cantidad: Math.min(maxStock, cantidad) };
      })
    );
  }

  function eliminarProducto(productoId) {
    setItems((anteriores) =>
      anteriores.filter(
        (item) => item.producto.id !== productoId
      )
    );
  }

  function vaciarCarrito() {
    setItems([]);
  }

  const cantidadTotal = items.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.producto.precioActual ?? 0) *
        item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cantidadTotal,
        subtotal,
        agregarProducto,
        cambiarCantidad,
        eliminarProducto,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}