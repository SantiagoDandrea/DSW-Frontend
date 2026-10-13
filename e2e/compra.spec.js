// Prueba de extremo a extremo (E2E) que simula el flujo completo de compra de un producto y su posterior consulta.
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
      'Completá E2E_EMAIL y E2E_PASSWORD en .env.e2e.local.'
    );
  }

  await page.goto('/login');

  await page.getByLabel('Correo Electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);

  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL('http://localhost:5173/');

  await page.goto('/producto/3');

  const botonAgregar = page.getByRole('button', {
    name: 'Agregar al carrito',
    exact: true,
  });

  await expect(botonAgregar).toBeEnabled();

  const nombreProducto = (
    await page.getByRole('heading', { level: 1 }).innerText()
  ).trim();

  await botonAgregar.click();

  await expect(
    page.getByRole('status')
  ).toHaveText('Producto agregado al carrito.');

  await page.getByRole('link', { name: /Ir al carrito/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Mi carrito' })
  ).toBeVisible();

  await expect(
    page.getByRole('link', {
      name: nombreProducto,
      exact: true,
    }).first()
  ).toBeVisible();

  await page.getByRole('link', {
    name: 'Continuar compra',
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Confirmar pedido' })
  ).toBeVisible();

  await page.getByLabel('Medio de pago').selectOption({
    label: 'Efectivo',
  });

  await page.getByLabel('Forma de entrega').selectOption('retiro');

  await page.getByRole('button', {
    name: 'Confirmar pedido',
    exact: true,
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Pedido creado correctamente',
    })
  ).toBeVisible();

  await expect(
    page.getByText(/^Total:\s*\$\s*450\.000,00$/)
  ).toBeVisible();

  const enlaceDetalle = page.getByRole('link', {
    name: /Ver detalle del pedido/,
  });

  const rutaPedido = await enlaceDetalle.getAttribute('href');

  expect(rutaPedido).toMatch(/^\/pedidos\/\d+$/);

  const pedidoId = rutaPedido.split('/').pop();

  await enlaceDetalle.click();

  await expect(
    page.getByRole('heading', {
      name: `Pedido #${pedidoId}`,
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByRole('listitem').filter({
      hasText: nombreProducto,
    })
  ).toHaveCount(1);

  await expect(
    page.getByText(/^Medio de pago:\s*Efectivo$/)
  ).toBeVisible();

  await expect(
    page.getByText('Entrega: retiro en el local.', {
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText(/^Total:\s*\$\s*450\.000,00$/)
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole('heading', {
      name: `Pedido #${pedidoId}`,
      exact: true,
    })
  ).toBeVisible();

  await page.goto('/carrito');

  await expect(
    page.getByRole('heading', {
      name: 'Tu carrito está vacío',
    })
  ).toBeVisible();
});