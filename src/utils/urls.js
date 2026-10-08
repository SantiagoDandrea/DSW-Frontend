// Arma y lee direcciones con el nombre a la vista, como /categoria/25-colchones o /producto/29-almohada-piero.

/**
 * Convierte un texto en una versión apta para URL: minúsculas, sin tildes y con guiones.
 * @param {string} texto
 * @returns {string}
 */
export function slugify(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function rutaConNombre(base, entidad) {
  const slug = slugify(entidad.nombre);
  return slug ? `${base}/${entidad.id}-${slug}` : `${base}/${entidad.id}`;
}

/** @param {{ id: number, nombre: string }} categoria */
export const rutaCategoria = (categoria) => rutaConNombre('/categoria', categoria);

/** @param {{ id: number, nombre: string }} producto */
export const rutaProducto = (producto) => rutaConNombre('/producto', producto);

/**
 * Obtiene el id numérico de un parámetro de ruta, sea "25" o "25-colchones".
 * Si no empieza con un número lo devuelve tal cual para que el backend responda "no existe".
 * @param {string} parametro
 * @returns {string}
 */
export function idDeLaRuta(parametro) {
  const numero = Number.parseInt(parametro, 10);
  return Number.isNaN(numero) ? String(parametro) : String(numero);
}
