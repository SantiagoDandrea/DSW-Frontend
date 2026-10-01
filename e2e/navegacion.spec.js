import { test, expect } from '@playwright/test';

test('un carrito nuevo muestra el estado vacío', async ({ page }) => {
  await page.goto('/carrito');

  await expect(
    page.getByRole('heading', {
      name: 'Tu carrito está vacío',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Ir a la tienda' })
  ).toHaveAttribute('href', '/');

  await expect(
    page.getByRole('link', { name: 'Continuar compra' })
  ).toHaveCount(0);
});

test('checkout requiere iniciar sesión', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page).toHaveURL(/\/login\/?$/);

  await expect(
    page.getByRole('heading', { name: 'Iniciar Sesión' })
  ).toBeVisible();

  await expect(
    page.getByLabel('Correo Electrónico')
  ).toBeVisible();

  await expect(
    page.getByLabel('Contraseña', { exact: true })
  ).toBeVisible();
});