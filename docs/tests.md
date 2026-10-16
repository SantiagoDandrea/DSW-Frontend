# Tests del frontend

## Objetivo

Verificar el comportamiento del componente carrito y el recorrido
de compra del cliente mediante el navegador.

## Herramientas

- Vitest: ejecución de tests del componente.
- React Testing Library: renderizado y consultas de la interfaz.
- user-event: simulación de interacciones.
- jsdom: entorno DOM para los tests del componente.
- Playwright: ejecución de pruebas end-to-end en Chromium.

## Tests del componente

Archivo: `src/pages/Cart.test.jsx`.

Se verifican cinco escenarios:

1. Carrito vacío con enlace para volver a la tienda.
2. Producto, unidades, subtotal y enlace al checkout.
3. Solicitud de eliminación del producto seleccionado.
4. Solicitud de aumento y disminución de cantidad.
5. Imposibilidad de disminuir la cantidad por debajo de una unidad.

Estos tests utilizan un contexto controlado con funciones de prueba.
Verifican la interfaz y las llamadas a sus acciones; no verifican
la implementación de CartProvider, localStorage ni la API.

### Ejecución

```bash
pnpm test
```

Para repetir los tests al modificar archivos:

```bash
pnpm test:watch
```

No requieren backend ni base de datos.

## Tests end-to-end

### Navegación

Archivo: `e2e/navegacion.spec.js`.

1. Un navegador sin carrito previo muestra el estado vacío.
2. Acceder al checkout sin sesión redirige al login.

### Compra

Archivo: `e2e/compra.spec.js`.

Verifica el siguiente recorrido:

1. Iniciar sesión con una cuenta CLIENTE.
2. Consultar el producto 3 y agregar una unidad.
3. Abrir el carrito y continuar al checkout.
4. Seleccionar Efectivo y retiro en el local.
5. Confirmar la creación del pedido por $450.000.
6. Abrir el detalle y comprobar el producto, medio de pago y entrega.
7. Recargar el detalle y recuperar el pedido del backend.
8. Comprobar que el carrito quedó vacío.

La prueba utiliza la API real, sin simular sus respuestas.

## Preparación de los E2E

Instalar las dependencias y Chromium:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Para la prueba de compra se necesita:

- MySQL y el backend funcionando.
- VITE_API_URL configurada para ese backend.
- Una cuenta existente con rol CLIENTE.
- Producto con ID 3 y precio vigente de $450.000.
- Al menos una unidad disponible de ese producto.
- Medio de pago cuya descripción sea exactamente Efectivo.

Los datos anteriores corresponden al entorno de prueba utilizado.
Si se utiliza otra base, preparar esos datos o adaptar el test.

Crear `.env.e2e.local` en la raíz del frontend:

```dotenv
E2E_EMAIL="email_de_la_cuenta_cliente"
E2E_PASSWORD="contraseña_de_la_cuenta_cliente"
```

El archivo debe estar excluido de Git.
No utilizar variables con prefijo VITE_ para las credenciales.

Verificar la exclusión:

```bash
git check-ignore .env.e2e.local
```

## Ejecución de los E2E

Cerrar el servidor manual del frontend si utiliza el puerto 5173.
Playwright inicia su propio servidor y lo cierra al finalizar.

Mantener MySQL y el backend funcionando para la prueba de compra.

Ejecutar todas las pruebas:

```bash
pnpm test:e2e
```

Para observar el navegador:

```bash
pnpm test:e2e:headed
```

Para ejecutar solamente la compra:

```bash
pnpm exec playwright test e2e/compra.spec.js --headed
```

## Efectos sobre los datos

Cada ejecución exitosa de la prueba de compra crea un pedido
y descuenta una unidad del producto 3.

La prueba no cancela automáticamente el pedido.
Después de ejecutarla, se puede cancelar el pedido desde Mis pedidos,
si su estado permite la cancelación, para restituir el stock.

Vaciar el carrito no cancela un pedido ni modifica el stock.

Utilizar una base de desarrollo o pruebas preparada para este recorrido.

## Reportes

Abrir el último reporte de Playwright:

```bash
pnpm test:e2e:report
```

Los reportes se generan en `playwright-report`.
Los archivos de ejecución y capturas de fallos se generan en `test-results`.

Ambas carpetas están excluidas de Git.
Para la entrega, guardar evidencia seleccionada sin credenciales
ni información personal.

## Resultados observados

Ejecución local informada por el integrante el 01/10/2026:

| Verificación | Resultado |
|---|---|
| ESLint | Sin errores en la última ejecución informada |
| Tests de Cart | 5 aprobados |
| E2E en Chromium | 3 aprobados |

Estos resultados corresponden a esa ejecución y su entorno.
No representan una ejecución automática en CI.

## Comprobación manual de stock y cancelación

Complementar las pruebas automáticas con este procedimiento:

1. Consultar el stock del producto 3 antes de comprar.
2. Ejecutar la compra de una unidad.
3. Comprobar el descuento de una unidad.
4. Cancelar el pedido desde su detalle.
5. Comprobar el estado CANCELADO.
6. Verificar la restitución de la unidad en el almacén de origen.

Consulta utilizada:

```sql
SELECT productoId, almacenId, cantidad
FROM Stock
WHERE productoId = 3;
```

La restitución del stock no está cubierta por los E2E actuales.


## Validación del 16/10/2026

- Tests de Cart: 5 aprobados.
- Build de producción: completado, con advertencia de tamaño del bundle.
- E2E de compra actualizado al rediseño: 1 aprobado.
- Los 2 E2E de navegación pasaron en la ejecución previa.
- Verificación manual: acceso como cliente y administrador, checkout,
  edición de los campos de dirección y cancelación del pedido con
  restitución del stock.

Se actualizaron los selectores del E2E para los textos y la tabla
del nuevo diseño. El nombre del producto se obtiene con textContent
para evitar diferencias causadas por la transformación visual a mayúsculas.