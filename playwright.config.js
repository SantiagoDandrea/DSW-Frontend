// Configuración general del entorno de pruebas de extremo a extremo (E2E) con Playwright.
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env.e2e.local',
  quiet: true,
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev --host localhost --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 60000,
  },
});