// Pruebas unitarias para verificar el funcionamiento y renderizado de la pantalla del carrito.
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../context/cart-context';
import { Cart } from './Cart';

const heladera = {
  id: 7,
  nombre: 'Heladera de prueba',
  precioActual: 100000,
  disponible: true,
  imagenes: [],
};

function renderizarCarrito(items = []) {
  const acciones = {
    cambiarCantidad: vi.fn(),
    eliminarProducto: vi.fn(),
    vaciarCarrito: vi.fn(),
  };

  const contexto = {
    items,
    cantidadTotal: items.reduce(
      (total, item) => total + item.cantidad,
      0
    ),
    subtotal: items.reduce(
      (total, item) =>
        total + item.producto.precioActual * item.cantidad,
      0
    ),
    ...acciones,
  };

  render(
    <MemoryRouter>
      <CartContext.Provider value={contexto}>
        <Cart />
      </CartContext.Provider>
    </MemoryRouter>
  );

  return acciones;
}

describe('Cart', () => {
  it('muestra el estado vacío y un enlace para volver a la tienda', () => {
    renderizarCarrito();

    expect(
      screen.getByRole('heading', {
        name: 'Tu carrito está vacío',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Ir a la tienda' })
    ).toHaveAttribute('href', '/');

    expect(
      screen.queryByRole('link', { name: 'Continuar compra' })
    ).not.toBeInTheDocument();
  });

  it('muestra el producto, las unidades y el subtotal de compra', () => {
    renderizarCarrito([
      { producto: heladera, cantidad: 2 },
    ]);

    expect(
      screen.getByRole('link', { name: heladera.nombre })
    ).toHaveAttribute('href', '/producto/7');

    const resumen = screen.getByRole('complementary');

    expect(
      within(resumen).getByText('2', { exact: true })
    ).toBeInTheDocument();

    expect(
      within(resumen).getByText(/^\$\s*200\.000,00$/)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Continuar compra' })
    ).toHaveAttribute('href', '/checkout');
  });

  it('solicita eliminar el producto seleccionado', async () => {
    const usuario = userEvent.setup();

    const { eliminarProducto } = renderizarCarrito([
      { producto: heladera, cantidad: 2 },
    ]);

    await usuario.click(
      screen.getByRole('button', {
        name: `Eliminar ${heladera.nombre} del carrito`,
      })
    );

    expect(eliminarProducto).toHaveBeenCalledExactlyOnceWith(
      heladera.id
    );
  });

  it('solicita aumentar y disminuir la cantidad del producto', async () => {
    const usuario = userEvent.setup();

    const { cambiarCantidad } = renderizarCarrito([
      { producto: heladera, cantidad: 2 },
    ]);

    await usuario.click(
      screen.getByRole('button', {
        name: `Agregar una unidad de ${heladera.nombre}`,
      })
    );

    expect(cambiarCantidad).toHaveBeenNthCalledWith(
      1,
      heladera.id,
      3
    );

    await usuario.click(
      screen.getByRole('button', {
        name: `Quitar una unidad de ${heladera.nombre}`,
      })
    );

    expect(cambiarCantidad).toHaveBeenNthCalledWith(
      2,
      heladera.id,
      1
    );

    expect(cambiarCantidad).toHaveBeenCalledTimes(2);
  });

  it('impide disminuir la cantidad cuando queda una unidad', async () => {
    const usuario = userEvent.setup();

    const { cambiarCantidad } = renderizarCarrito([
      { producto: heladera, cantidad: 1 },
    ]);

    const botonQuitar = screen.getByRole('button', {
      name: `Quitar una unidad de ${heladera.nombre}`,
    });

    expect(botonQuitar).toBeDisabled();

    await usuario.click(botonQuitar);

    expect(cambiarCantidad).not.toHaveBeenCalled();
  });
});