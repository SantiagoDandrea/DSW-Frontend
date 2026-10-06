// Hook personalizado para acceder fácilmente a los productos y funciones del carrito de compras.
import { useContext } from 'react';
import { CartContext } from './cart-context';

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de un CartProvider'
    );
  }

  return context;
}