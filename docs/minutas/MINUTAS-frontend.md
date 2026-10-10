# Minutas — Frontend (DSW Ecommerce)

Grupo: Santiago D'Andrea, Martín De Benedetti, Santino Ravarotto, Guillermo Giannuzzi.
Metodología: Kanban informal, coordinación diaria por Discord, revisión de pull requests entre integrantes antes de mergear.

## 2026-08-14/25 — Base del frontend
Se inicializa el proyecto con Vite, React 19 y Tailwind CSS 4 (PR #1) y se define la estructura de carpetas de `src/`: `pages`, `components`, `services`, `models`, `context` y `routes`, cada una con un README que explica su única responsabilidad (PR #2). Ambas se integran el 25/8.

## 2026-09-05/09 — Enrutado y primeras pantallas con datos reales
Se incorpora React Router y una prueba de Home (PR #3, integrada el 7/9). Se abren por separado dos pull requests que conectan la Home y la página de categoría con productos reales del backend (PR #4, integrada el 7/9, y PR #6, el 9/9).

## 2026-09-09 — Cliente HTTP, servicios y autenticación
Se integra el cliente HTTP centralizado `apiFetch`, con la URL de la API tomada de la variable `VITE_API_URL` (se versiona `.env.example` y se deja `.env` fuera de git) y los primeros servicios (PR #7). El mismo día se suman la autenticación con JWT, el `AuthContext` que mantiene la sesión en `localStorage` y la pantalla de login (PR #8). El catálogo consume el campo `disponible` del backend y no muestra cantidades de stock.

## 2026-09-14/24 — Modelos como clases, detalle de producto, registro y perfil
Se incorporan los modelos de datos como clases con `fromJSON` (Categoria, Producto, Usuario y Localidad), que cubren el requisito de representar los datos con clases y no con objetos sueltos, y la página de detalle de producto (PR #9). Además se agregan el registro de cuentas y la página de perfil (PR #10). Ambas se abrieron el 14/9 y se integraron el 24/9.

## 2026-09-25/28 — Infraestructura de navegación y sesión
Se integra el enrutador centralizado con `ProtectedRoute` (requiere sesión) y `AdminRoute` (requiere rol ADMIN), la persistencia de la sesión y el layout (PR #11, integrada el 28/9). El 25/9 se reenvían los cambios de registro y perfil, porque la PR #10 había quedado apuntando a una rama intermedia y no a `main` (PR #12).

## 2026-09-29 → 10-01 — Panel de administración
Se incorpora el panel de administración (PR #13, unas 3000 líneas en 30 archivos): una factoría de servicios CRUD (`crudServiceFactory`), componentes reutilizables (`SimpleCrudTable`, modales) y las pantallas de productos, inventario y precios, pedidos, usuarios y tablas maestras (categorías, marcas, medios de pago, localidades, almacenes y proveedores). Antes de integrar se hace una revisión cruzada: se relevan observaciones (validaciones, zona horaria en los filtros de fecha y una regresión en un servicio) y se corrigen. Se integra el 1/10.

## 2026-09-30 → 10-01 — Carrito, checkout y pruebas automáticas
Se incorpora el carrito (guardado en `localStorage`, con contador en el encabezado), el checkout con medio de pago y retiro o envío a domicilio, y el listado y detalle de pedidos con cancelación según el estado (PR #14, integrada el 30/9). El 1/10 se agregan las pruebas automáticas: 5 tests unitarios del carrito con Vitest y Testing Library, y 3 tests de extremo a extremo con Playwright, más la documentación de cómo ejecutarlos (PR #15, `docs/tests.md`).

## 2026-10-01/06 — Envíos, búsqueda y filtros
Se suma la gestión de envíos desde el detalle del pedido (editar el domicilio y cancelar el envío sin cancelar el pedido), la carga de varias imágenes por producto en el admin, el buscador real y los filtros por marca y precio del catálogo, y correcciones (la redirección del login ignoraba la ruta de origen para los ADMIN, la columna Localidad mostraba "(undefined)" y no existía el acceso a "Mis pedidos") (PR #16, integrada el 2/10). Se agregan búsqueda y filtros en "Mis pedidos" y se corrige un problema de privacidad: un ADMIN veía en esa pantalla los pedidos de otros clientes (PR #17, 2/10). Se agregan la pantalla Admin → Envíos y el autoformato del CUIT en Proveedores (PR #18, integrada el 6/10) y se simplifican los comentarios del código (PR #19, 6/10).

## 2026-10-05 — Consulta con la cátedra
Se muestra lo desarrollado en la clase de consulta y se indica que con lo existente se puede presentar. Se marcan dos observaciones: evitar funcionalidades que no se puedan justificar (por ejemplo el historial de precios) y corregir los errores de uso que aparezcan al probar la aplicación. La fecha de presentación queda a coordinar con los docentes.

## 2026-10-08/09 — Pruebas manuales y accesibilidad
Se prueba la aplicación como cliente y como administrador y se audita la accesibilidad de todas las pantallas y modales con axe-core. Se corrigen los problemas encontrados (PR #20): el carrito se vacía al cerrar sesión y el error de stock no muestra cantidades, para no exponer información interna del negocio; se validan los rangos de fechas y de precios; un envío cancelado deja de mostrar costo y domicilio; el filtro de pedidos del admin busca por nombre o DNI; se agregan direcciones con nombre (`/categoria/25-colchones`), título de categoría, descripción en la tarjeta de producto y selector de cantidad; y se mejora la accesibilidad (tarjetas operables con teclado, etiquetas asociadas a sus campos, modales anunciados como diálogos, contrastes y avisos de error para lectores de pantalla). También se agrega un aviso cuando la sesión vence, en lugar de cerrarla sin explicación.
