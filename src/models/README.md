# models/

Clases/tipos que representan las entidades de datos del dominio (ej. `Producto`, `Usuario`, `Pedido`).

En vez de pasar objetos sueltos entre capas, `services/` mapea las respuestas de la API a instancias de estos modelos, que luego consumen `pages/`, `components/` y `context/`.
