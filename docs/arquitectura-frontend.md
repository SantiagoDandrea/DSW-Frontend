# Documento de Arquitectura y Decisiones de Diseño Frontend (ADR)
**Proyecto:** E-Commerce DSW (Frontend)  
**Cátedra:** Desarrollo de Software (UTN)  
**Stack Principal:** React 19, Vite, React Router v7, Tailwind CSS v4, Fetch API nativo.

---

## 1. Contexto y Objetivos del Proyecto

El frontend tiene como finalidad conectarse con la API REST ya desarrollada en `DSW-Backend` (Express, Prisma, MySQL, JWT), cubriendo los requerimientos de la cátedra para aprobación directa:

1. **Autenticación y Autorización por Roles:**
   - Rol `CLIENTE`: Navegación de catálogo, búsqueda y filtrado, gestión del carrito, checkout/creación de pedidos, consulta del estado de sus pedidos/envíos, cancelación cuando aplique y edición de su perfil.
   - Rol `ADMIN`: Acceso a un panel de administración para gestión (CRUD) de productos, categorías, marcas, stock por almacén, actualización de precios, y gestión/cambio de estados de pedidos y envíos.
2. **Navegación Fluida (SPA):** Rutas públicas, rutas de cliente y rutas protegidas de administrador.
3. **Consistencia y Robustez:**
   - Cero URLs de backend hardcodeadas (uso estricto de variables de entorno `VITE_API_URL`).
   - Envío transparente y automático del token JWT en peticiones protegidas.
   - Tratamiento unificado de errores y estados de carga (UX amigable con feedback claro).

---

## 2. Estructura de Directorios del Proyecto

Siguiendo la arquitectura por capas ya iniciada en el repositorio:

```text
src/
├── assets/             # Imágenes estáticas, íconos y recursos locales
├── components/         # Componentes reutilizables de UI (atómicos / presentacionales)
│   ├── common/         # Botones, Modales, Spinners, Inputs, Alertas, Badges
│   ├── layout/         # Header, Footer, Navbar, AdminSidebar
│   ├── products/       # ProductCard, ProductGrid, ProductFilters
│   └── cart/           # CartDrawer / CartItem / CheckoutResume
├── context/            # Estados globales con React Context API
│   ├── AuthContext.jsx # Usuario autenticado, token JWT, login/logout, rol (esAdmin)
│   └── CartContext.jsx # Productos en carrito, cantidades, totales, sincronización local
├── models/             # Clases o tipos que modelan los datos de negocio (normalización)
│   ├── Usuario.js
│   ├── Producto.js
│   ├── Pedido.js
│   └── Envio.js
├── pages/              # Vistas completas asociadas a una ruta
│   ├── public/         # Home, CategoryProducts, ProductDetail, Login, Register, NotFound
│   ├── customer/       # MisPedidos, DetallePedido, MiPerfil, Checkout
│   └── admin/          # AdminDashboard, AdminProductos, AdminStock, AdminPedidos, etc.
├── routes/             # Definición centralizada de rutas y guards de protección
│   ├── AppRoutes.jsx   # Mapa completo de rutas
│   ├── ProtectedRoute.jsx # Guard para usuarios autenticados
│   └── AdminRoute.jsx     # Guard exclusivo para rol ADMIN
├── services/           # Comunicación con la API REST (única capa con peticiones HTTP)
│   ├── api.js          # Cliente HTTP base (Base URL, inyección de JWT, manejo de errores)
│   ├── authService.js
│   ├── categoriaService.js
│   ├── productoService.js
│   ├── pedidoService.js
│   └── envioService.js
├── App.jsx             # Shell principal con Providers (Auth, Cart) y Router
└── main.jsx            # Punto de entrada de la aplicación
```

---

## 3. Catálogo de Páginas y Navegación

### A. Vistas Públicas
| Ruta | Componente | Descripción |
| :--- | :--- | :--- |
| `/` | `Home` | Banner, categorías principales y productos destacados. |
| `/categoria/:categoryId` | `CategoryProducts` | Grid de productos filtrados por categoría. |
| `/producto/:id` | `ProductDetail` | Galería de imágenes, descripción, precio vigente, stock disponible y botón "Agregar al Carrito". |
| `/login` | `Login` | Formulario de email y password, redirección según origen o rol. |
| `/registro` | `Register` | Alta de clientes (asociando localidad). |

### B. Vistas de Cliente Autenticado (`CLIENTE` o `ADMIN`)
| Ruta | Componente | Descripción |
| :--- | :--- | :--- |
| `/carrito` o `/checkout` | `CheckoutPage` | Confirmación de items, selección de medio de pago, opción de entrega a domicilio o retiro, y creación del pedido (`POST /api/pedidos`). |
| `/mis-pedidos` | `MyOrdersPage` | Listado histórico de pedidos del usuario, estado actual (`PENDIENTE`, `EN_PREPARACION`, etc.) y accesos rápidos. |
| `/pedidos/:id` | `OrderDetailPage` | Detalle exhaustivo del pedido, productos, subtotal, datos de envío y botón de cancelar (si el estado lo permite). |
| `/perfil` | `ProfilePage` | Datos personales del usuario autenticado (`GET /api/auth/me`). |

### C. Vistas de Administración (`ADMIN`)
| Ruta | Componente | Descripción |
| :--- | :--- | :--- |
| `/admin` | `AdminDashboard` | Resumen general, métricas y accesos rápidos a gestión. |
| `/admin/productos` | `AdminProductsPage` | Tabla CRUD de productos, edición de precios y fotos. |
| `/admin/stock` | `AdminStockPage` | Gestión de stock de productos por almacén. |
| `/admin/pedidos` | `AdminOrdersPage` | Listado global de pedidos de todos los clientes y actualización de estados (`PATCH /api/pedidos/:id/estado`). |
| `/admin/envios` | `AdminShipmentsPage` | Monitoreo de despachos y cambios de estado de logística. |

---

## 4. Decisiones Técnicas Fundamentales (ADR)

### Decisión 1: Cliente HTTP Centralizado con `fetch` Nativo
* **Decisión:** Implementar un envoltorio propio `apiFetch(endpoint, options)` en `src/services/api.js` en lugar de instalar librerías adicionales como `axios`.
* **Motivo:** `fetch` está incorporado nativamente en todos los navegadores modernos y en Node. El proyecto no requiere interceptores complejos de streaming. Con 40 líneas de código limpio se resuelve:
  - Base URL configurable vía `import.meta.env.VITE_API_URL`.
  - Inserción automática de `Authorization: Bearer <token>`.
  - Headers `Content-Type: application/json` por defecto.
  - Transformación automática de respuestas de error del backend en excepciones claras de JavaScript.

### Decisión 2: Manejo de Autenticación con `AuthContext`
* **Decisión:** Mantener el estado de sesión en memoria React y sincronizado con `localStorage`.
* **Estructura del Contexto:**
  - `usuario`: Objeto con `{ dni, nombre, apellido, email, rol }` o `null`.
  - `token`: String JWT.
  - `isAuthenticated`: Booleano helper (`!!token`).
  - `esAdmin`: Booleano helper (`usuario?.rol === 'ADMIN'`).
  - Métodos `login(email, password)` y `logout()`.
* **Flujo de Cierre de Sesión:** Si cualquier petición al backend retorna `401 Unauthorized` por token expirado, el cliente HTTP o el contexto invalidan el almacenamiento local y redirigen a `/login`.

### Decisión 3: Manejo del Carrito con `CartContext`
* **Decisión:** Administrar el carrito de compras en un contexto global persistido en `localStorage`.
* **Motivo:** Permite que un usuario anónimo agregue productos y que el carrito no se pierda al recargar la página o al navegar hacia el login.
* **Validación al Comprar:** Al hacer clic en "Confirmar Compra":
  - Si no está autenticado $\rightarrow$ Redirige a `/login?redirect=/checkout`.
  - Si está autenticado $\rightarrow$ Envía la solicitud al backend (`POST /api/pedidos`).

### Decisión 4: Protección de Rutas (Route Guards)
* **Decisión:** Crear componentes envolventes de React Router:
  - `<ProtectedRoute>`: Comprueba `isAuthenticated`. Si es falso, redirige a `/login`.
  - `<AdminRoute>`: Comprueba `isAuthenticated` y además `esAdmin`. Si no tiene rol `ADMIN`, redirige al inicio (`/`) o a una página de acceso no autorizado (`403`).

### Decisión 5: Separación Estricta entre Vista y Lógica de Negocio
* **Regla:** Ningún componente (`pages/` o `components/`) debe contener llamadas directas a URLs de la API ni a `fetch`.
* **Flujo obligatorio:**
  $$\text{Componente UI} \longrightarrow \text{Service / Context} \longrightarrow \text{apiFetch (api.js)} \longrightarrow \text{Backend API}$$

---

## 5. Hoja de Ruta de Implementación por Fases

1. **Fase 1: Infraestructura Base y Cliente API**
   - Configuración de variables de entorno (`.env`, `.env.example`, ajuste de `.gitignore`).
   - Implementación de `src/services/api.js`.
   - Servicios iniciales: `categoriaService.js` y `productoService.js`.
   - Refactorización de [Home.jsx](file:///home/santiago/Documents/UTN/DSW/DSW-Frontend/src/pages/Home.jsx) y [CategoryProducts.jsx](file:///home/santiago/Documents/UTN/DSW/DSW-Frontend/src/pages/CategoryProducts.jsx).
2. **Fase 2: Autenticación, Sesión y Navegación Dinámica**
   - Implementación de `authService.js`.
   - Creación de `AuthContext.jsx` y hook `useAuth`.
   - Pantalla de Login (`/login`) y Registro (`/registro`).
   - Actualización del Header (mostrar usuario logueado, botón de login/logout y badge de Admin).
3. **Fase 3: Detalle de Producto, Carrito y Flujo de Compra (Cliente)**
   - Creación de `CartContext.jsx`.
   - Página de detalle del producto (`/producto/:id`).
   - Pantalla de Checkout / Finalización de Pedido con elección de envío o retiro.
   - Pantalla de "Mis Pedidos" y detalle/cancelación de pedidos y envíos propios.
4. **Fase 4: Panel de Administración y Rutas Protegidas**
   - Implementación de `AdminRoute`.
   - Pantallas de gestión de productos, stock, pedidos y envíos para administradores.
