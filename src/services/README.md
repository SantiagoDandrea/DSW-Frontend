# services/

Funciones que centralizan las llamadas a la API del backend (ej. `productosService.js`).

Son el único lugar del frontend que debería hacer fetch/HTTP directo. Reciben y devuelven instancias de `models/`, y son consumidos desde `pages/` o `context/`.
