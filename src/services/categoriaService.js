import { apiFetch } from './api';

/**
 * Servicio para operaciones sobre el recurso Categorías.
 */
export const categoriaService = {
  /**
   * Obtiene el listado completo de categorías.
   * @returns {Promise<Array>} Lista de categorías.
   */
  async getCategorias() {
    return apiFetch('/categorias');
  },

  /**
   * Obtiene una categoría por su ID.
   * @param {number|string} id
   * @returns {Promise<Object>} Detalle de la categoría.
   */
  async getCategoriaById(id) {
    return apiFetch(`/categorias/${id}`);
  },
};
