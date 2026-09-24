import { apiFetch } from './api';
import { Producto } from '../models/Producto';

/**
 * Servicio para operaciones sobre el recurso Productos.
 */
export const productoService = {
  /**
   * Obtiene la lista de productos con filtros opcionales.
   * @param {Object} [filtros={}] - Filtros opcionales (categoriaId, marcaId, nombre, etc.).
   * @returns {Promise<Producto[]>} Lista de productos.
   */
  async getProductos(filtros = {}) {
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/productos?${queryString}` : '/productos';

    const data = await apiFetch(endpoint);
    return data.map(Producto.fromJSON);
  },

  /**
   * Obtiene los productos correspondientes a una categoría específica.
   * @param {number|string} categoriaId - Identificador de la categoría.
   * @returns {Promise<Producto[]>} Lista de productos de la categoría.
   */
  async getProductosByCategoria(categoriaId) {
    return this.getProductos({ categoriaId });
  },

  /**
   * Obtiene el detalle de un producto por su ID.
   * @param {number|string} id - Identificador del producto.
   * @returns {Promise<Producto>} Detalle del producto.
   */
  async getProductoById(id) {
    const data = await apiFetch(`/productos/${id}`);
    return Producto.fromJSON(data);
  },
};
