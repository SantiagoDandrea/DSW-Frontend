import { apiFetch } from './api';
import { Categoria } from '../models/Categoria';

/**
 * Servicio para operaciones sobre el recurso Categorías.
 */
export const categoriaService = {
  /**
   * Obtiene el listado completo de categorías.
   * @returns {Promise<Categoria[]>} Lista de categorías.
   */
  async getCategorias() {
    const data = await apiFetch('/categorias');
    return data.map(Categoria.fromJSON);
  },

  /**
   * Obtiene una categoría por su ID.
   * @param {number|string} id
   * @returns {Promise<Categoria>} Detalle de la categoría.
   */
  async getCategoriaById(id) {
    const data = await apiFetch(`/categorias/${id}`);
    return Categoria.fromJSON(data);
  },
};
