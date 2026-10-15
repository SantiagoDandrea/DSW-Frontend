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

Siguiendo la arquitectura por capas implementada en el repositorio:

```text
src/
├── assets/             # Imágenes estáticas, íconos y recursos locales
├── components/         # Componentes reutilizables de UI
│   ├── admin/          # AdminAlert, AdminLayout, AdminModal, ConfirmModal, SimpleCrudTable
│   ├── CategoryCard.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── Icons.jsx
│   ├── ProductCard.jsx
│   ├── ProductFilters.jsx
│   └── SearchBar.jsx
├── constants/          # Constantes globales (ej. PROVINCIAS_ARGENTINA)
├── context/            # Estados globales con React Context API
│   ├── AuthContext.jsx # Usuario autenticado, token JWT, login/logout, rol (esAdmin)
│   └── CartContext.jsx # Productos en carrito, cantidades, totales, sincronización local
├── hooks/              # Custom hooks de la aplicación
├── models/             # Clases que modelan los datos de negocio con normalización fromJSON
│   ├── Categoria.js
│   ├── Envio.js
│   ├── Localidad.js
│   ├── Pedido.js
│   ├── Producto.js
│   └── Usuario.js
├── pages/              # Vistas completas asociadas a una ruta
│   ├── admin/          # AdminProductosPage, AdminInventarioPage, AdminPedidosPage, AdminEnviosPage, AdminUsuariosPage, AdminTablasPage
│   ├── Cart.jsx
│   ├── CategoryProducts.jsx
│   ├── Checkout.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── MyOrders.jsx
│   ├── OrderDetail.jsx
│   ├── ProductDetail.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   └── SearchResults.jsx
├── routes/             # Definición centralizada de rutas y guards de protección
│   ├── AppRoutes.jsx   # Mapa completo de rutas
│   ├── ProtectedRoute.jsx # Guard para usuarios autenticados
│   └── AdminRoute.jsx     # Guard exclusivo para rol ADMIN
├── services/           # Comunicación con la API REST (única capa con peticiones HTTP)
│   ├── api.js          # Cliente HTTP base (Base URL, inyección de JWT, manejo de errores)
│   ├── authService.js
│   ├── categoriaService.js
│   ├── crudServiceFactory.js # Factoría genérica para CRUDs administrativos
│   ├── envioService.js
│   ├── pedidoService.js
│   └── productoService.js
├── utils/              # Funciones auxiliares de formateo y urls
├── App.jsx             # Shell principal con Providers (Auth, Cart) y Router
└── main.jsx            # Punto de entrada de la aplicación
```

---

## 3. Catálogo de Páginas y Navegación

### A. Vistas Públicas

| Ruta                     | Componente         | Descripción                                                                                      |
| :----------------------- | :----------------- | :----------------------------------------------------------------------------------------------- |
| `/`                      | `Home`             | Banner dinámico, categorías principales y productos destacados.                                  |
| `/categoria/:categoryId` | `CategoryProducts` | Grid de productos filtrados por categoría.                                                       |
| `/producto/:id`          | `ProductDetail`    | Galería de imágenes, descripción, precio vigente, stock disponible y botón "Agregar al Carrito". |
| `/buscar`                | `SearchResults`    | Búsqueda por término con filtros dinámicos por marca y precio.                                   |
| `/login`                 | `Login`            | Formulario de email y password, redirección según origen o rol.                                  |
| `/registro`              | `Register`         | Alta de clientes (con selección de provincia e ingreso de localidad y código postal).            |
| `/carrito`               | `Cart`             | Resumen de productos en el carrito, ajuste de cantidades y cálculo de subtotal.                 |

### B. Vistas de Cliente Autenticado (`CLIENTE` o `ADMIN`)

| Ruta           | Componente    | Descripción                                                                                                                             |
| :------------- | :------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `/checkout`    | `Checkout`    | Confirmación de items, selección de medio de pago, opción de entrega a domicilio o retiro, y creación del pedido (`POST /api/pedidos`). |
| `/mis-pedidos` | `MyOrders`    | Listado histórico de pedidos del usuario, estado actual (`PENDIENTE`, `EN_PREPARACION`, etc.) y accesos rápidos.                        |
| `/pedidos/:id` | `OrderDetail` | Detalle exhaustivo del pedido, productos, subtotal, comprobante imprimible, datos de envío y botón de cancelar.                          |
| `/perfil`      | `Profile`     | Datos personales del usuario autenticado (`GET/PUT /api/auth/me`), incluyendo provincia, localidad y CP.                                |

### C. Vistas de Administración (`ADMIN`)

| Ruta                 | Componente            | Descripción                                                                                                   |
| :------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------ |
| `/admin`             | `AdminLayout`         | Layout principal del panel de administración (redirecciona por defecto a `/admin/productos`).                 |
| `/admin/productos`   | `AdminProductosPage`  | Tabla CRUD de productos, edición de precios y fotos.                                                          |
| `/admin/inventario`  | `AdminInventarioPage` | Gestión y consulta de stock de productos por almacén con selector.                                            |
| `/admin/pedidos`     | `AdminPedidosPage`    | Listado global de pedidos de todos los clientes y actualización de estados (`PATCH /api/pedidos/:id/estado`). |
| `/admin/envios`      | `AdminEnviosPage`     | Monitoreo de despachos y cambios de estado de logística.                                                      |
| `/admin/usuarios`    | `AdminUsuariosPage`   | Gestión de usuarios, roles y activación/desactivación de cuentas.                                             |
| `/admin/tablas`      | `AdminTablasPage`     | CRUD unificado para tablas maestras (categorías, marcas, medios de pago, localidades, almacenes, proveedores).|

---

## 4. Decisiones Técnicas Fundamentales (ADR)

### Decisión 1: Cliente HTTP Centralizado con `fetch` Nativo

- **Decisión:** Implementar un envoltorio propio `apiFetch(endpoint, options)` en `src/services/api.js` en lugar de instalar librerías adicionales como `axios`.
- **Motivo:** `fetch` está incorporado nativamente en todos los navegadores modernos y en Node. El proyecto no requiere interceptores complejos de streaming. Con 40 líneas de código limpio se resuelve:
  - Base URL configurable vía `import.meta.env.VITE_API_URL`.
  - Inserción automática de `Authorization: Bearer <token>`.
  - Headers `Content-Type: application/json` por defecto.
  - Transformación automática de respuestas de error del backend en excepciones claras de JavaScript.

### Decisión 2: Manejo de Autenticación con `AuthContext`

- **Decisión:** Mantener el estado de sesión en memoria React y sincronizado con `localStorage`.
- **Estructura del Contexto:**
  - `usuario`: Objeto con `{ dni, nombre, apellido, email, rol }` o `null`.
  - `token`: String JWT.
  - `isAuthenticated`: Booleano helper (`!!token`).
  - `esAdmin`: Booleano helper (`usuario?.rol === 'ADMIN'`).
  - Métodos `login(email, password)` y `logout()`.
- **Flujo de Cierre de Sesión:** Si cualquier petición al backend retorna `401 Unauthorized` por token expirado, el cliente HTTP o el contexto invalidan el almacenamiento local y redirigen a `/login`.

### Decisión 3: Manejo del Carrito con `CartContext`

- **Decisión:** Administrar el carrito de compras en un contexto global persistido en `localStorage`.
- **Motivo:** Permite que un usuario anónimo agregue productos y que el carrito no se pierda al recargar la página o al navegar hacia el login.
- **Validación al Comprar:** Al hacer clic en "Confirmar Compra":
  - Si no está autenticado $\rightarrow$ Redirige a `/login?redirect=/checkout`.
  - Si está autenticado $\rightarrow$ Envía la solicitud al backend (`POST /api/pedidos`).

### Decisión 4: Protección de Rutas (Route Guards)

- **Decisión:** Crear componentes envolventes de React Router:
  - `<ProtectedRoute>`: Comprueba `isAuthenticated`. Si es falso, redirige a `/login`.
  - `<AdminRoute>`: Comprueba `isAuthenticated` y además `esAdmin`. Si no tiene rol `ADMIN`, redirige al inicio (`/`) o a una página de acceso no autorizado (`403`).

### Decisión 5: Separación Estricta entre Vista y Lógica de Negocio

- **Regla:** Ningún componente (`pages/` o `components/`) debe contener llamadas directas a URLs de la API ni a `fetch`.
- **Flujo obligatorio:**
  $$\text{Componente UI} \longrightarrow \text{Service / Context} \longrightarrow \text{apiFetch (api.js)} \longrightarrow \text{Backend API}$$
