// Verifica la compra de un producto y la persistencia del pedido.
import process from 'node:process';
import { test, expect } from '@playwright/test';

test('el cliente compra una heladera y consulta el pedido', async ({
  page,
}) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (
    !email ||
    !password ||
    email === 'COMPLETAR_CON_TU_EMAIL' ||
    password === 'COMPLETAR_CON_TU_CONTRASEÑA'
  ) {
    throw new Error(
      'Completá E2E_EMAIL y E2E_PASSWORD con una cuenta CLIENTE en .env.e2e.local.'
    );
  }

  const precioEsperado = /^\$\s*450\.000,00$/;
  const main = page.getByRole('main');

  async function comprobarTotal(etiqueta) {
    const filaTotal = main
      .getByText(etiqueta, { exact: true })
      .locator('..');

    await expect(
      filaTotal.getByText(precioEsperado)
    ).toBeVisible();
  }

  await page.goto('/login');

  await page.getByLabel('Correo Electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);

  await page.getByRole('button', {
    name: 'Iniciar Sesión',
    exact: true,
  }).click();

  await expect(page).toHaveURL('http://localhost:5173/');

  await page.goto('/producto/3');

  const botonAgregar = main.getByRole('button', {
    name: 'Agregar al carrito',
    exact: true,
  });

  await expect(botonAgregar).toBeEnabled();

  const nombreProducto = (
    await main.getByRole('heading', { level: 1 }).textContent()
  ).trim();

  await botonAgregar.click();

  await expect(
    main.getByRole('status')
  ).toContainText('Producto agregado al carrito');

  await main.getByRole('link', {
    name: /Ver Carrito/i,
  }).click();

  await expect(
    main.getByRole('heading', {
      name: 'Mi carrito',
      exact: true,
    })
  ).toBeVisible();

  await expect(
    main.getByRole('link', {
      name: nombreProducto,
      exact: true,
    }).first()
  ).toBeVisible();

  await main.getByRole('link', {
    name: 'Continuar compra',
    exact: true,
  }).click();

  await expect(
    main.getByRole('heading', {
      name: 'Confirmar pedido',
      exact: true,
    })
  ).toBeVisible();

  await page.getByLabel('Medio de pago').selectOption({
    label: 'Efectivo',
  });

  await page.getByLabel('Forma de entrega').selectOption('retiro');

  await comprobarTotal('Total a abonar:');

  await page.getByRole('button', {
    name: 'Confirmar pedido',
    exact: true,
  }).click();

  await expect(
    main.getByRole('heading', {
      name: 'Pedido creado correctamente',
      exact: true,
    })
  ).toBeVisible();

  await comprobarTotal('Total abonado / pactado:');

  const enlaceDetalle = main.getByRole('link', {
    name: /Ver comprobante y detalle/i,
  });

  await expect(enlaceDetalle).toBeVisible();

  const rutaPedido = await enlaceDetalle.getAttribute('href');

  expect(rutaPedido).toMatch(/^\/pedidos\/\d+$/);

  const pedidoId = rutaPedido.split('/').pop();

  await enlaceDetalle.click();

  async function comprobarDetalle() {
    await expect(
      main.getByRole('heading', {
        name: `Orden #${pedidoId}`,
        exact: true,
      })
    ).toBeVisible();

    const filaProducto = main.getByRole('row').filter({
      has: page.getByRole('cell', {
        name: nombreProducto,
        exact: true,
      }),
    });

    await expect(filaProducto).toHaveCount(1);

    const celdas = filaProducto.getByRole('cell');

    await expect(celdas.nth(1)).toHaveText('1');
    await expect(celdas.nth(2)).toHaveText(precioEsperado);
    await expect(celdas.nth(3)).toHaveText(precioEsperado);

    await expect(
      main.locator('p').filter({
        hasText: /^Medio de pago:\s*Efectivo$/,
      })
    ).toBeVisible();

    await expect(
      main.getByText(
        'Entrega: retiro sin cargo en nuestro local comercial (Las Parejas, Santa Fe).',
        { exact: true }
      )
    ).toBeVisible();

    await comprobarTotal('Total Liquidado:');
  }

  await comprobarDetalle();

  await page.reload();

  await comprobarDetalle();

  await page.goto('/carrito');

  await expect(
    main.getByRole('heading', {
      name: 'Tu carrito está vacío',
      exact: true,
    })
  ).toBeVisible();
});