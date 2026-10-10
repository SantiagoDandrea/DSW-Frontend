# DSW-Frontend

Frontend de un e-commerce de colchonería, tecnología y electrodomésticos — TP de Desarrollo de Software (UTN FRRo).

Es una aplicación de una sola página (SPA) que consume la API REST del backend: [DSW-Backend](https://github.com/SantiagoDandrea/DSW-Backend).

## Qué incluye

**Tienda (clientes)**
- Catálogo por categorías, buscador y filtros por marca y rango de precio.
- Detalle de producto, carrito y checkout (retiro en el local o envío a domicilio).
- Registro, inicio de sesión y perfil.
- Mis pedidos: búsqueda y filtros, detalle, edición del domicilio y cancelación del envío o del pedido.

**Panel de administración (rol `ADMIN`, en `/admin`)**
- Productos (con sus imágenes), inventario y precios, pedidos (filtros y cambio de estado), envíos y usuarios.
- Tablas maestras: categorías, marcas, medios de pago, localidades, almacenes y proveedores.

## Stack
React 19 + Vite 8 + React Router 7 + Tailwind CSS 4. Pruebas con Vitest, Testing Library y Playwright.

## Requisitos previos
- Node 20.19+ (o 22.12+)
- pnpm
- El backend corriendo en `http://localhost:3000`. Para levantarlo, seguir el README de [DSW-Backend](https://github.com/SantiagoDandrea/DSW-Backend) (MySQL, `.env`, migraciones y `pnpm dev`).

## Instalación

1. Instalá las dependencias:
   ```
   pnpm install
   ```
2. Copiá `.env.example` a `.env`:
   ```
   cp .env.example .env
   ```
   En Windows (CMD o PowerShell): `copy .env.example .env`. El archivo solo contiene la dirección de la API:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
   Si el backend corre en otra dirección, se cambia ahí. Si no existe el `.env`, la aplicación usa ese mismo valor por defecto.
3. Levantá la aplicación:
   ```
   pnpm dev
   ```
   Queda disponible en `http://localhost:5173`.

## Usuarios
- Cualquier persona puede registrarse desde `/registro`: la cuenta se crea con rol `CLIENTE`.
- Para usar el panel de administración se necesita un usuario con rol `ADMIN`, que debe existir en la base de datos. Una vez dentro, desde **Admin → Usuarios** se pueden crear y editar otros usuarios.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga automática |
| `pnpm build` | Genera la versión de producción en `dist/` |
| `pnpm preview` | Sirve localmente la versión de producción |
| `pnpm lint` | Revisa el código con ESLint |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm test:e2e` | Tests de extremo a extremo (Playwright); requieren preparación, ver [docs/tests.md](docs/tests.md) |

## Estructura

```
src/
├── components/   piezas de interfaz reutilizables (header, tarjetas, filtros, componentes del panel admin)
├── context/      estado global: sesión (AuthContext) y carrito (CartContext)
├── hooks/        lógica reutilizable (filtros de productos)
├── models/       clases que representan los datos (Producto, Pedido, Usuario, etc.)
├── pages/        pantallas completas, y pages/admin para el panel de administración
├── routes/       mapa de rutas y protección por sesión y por rol
├── services/     llamadas a la API (único lugar que usa fetch)
└── utils/        funciones auxiliares (formatos y direcciones con nombre)
```

## Documentación
El detalle de la arquitectura, las pruebas y las minutas está en [docs/README.md](docs/README.md).
