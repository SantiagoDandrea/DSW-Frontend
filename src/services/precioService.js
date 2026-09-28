import { apiFetch } from './api';
import { createCrudService } from './crudServiceFactory';
import { Precio } from '../models/Precio';

const baseCrud = createCrudService('/precios', Precio, {
  getAll: 'getPrecios',
  getById: 'getPrecioById',
  create: 'crearPrecio',
  update: 'actualizarPrecio',
  delete: 'eliminarPrecio',
});

export const precioService = {
  ...baseCrud,

  /**
   * Obtiene el historial cronológico de precios de un producto.
   * @param {number|string} productoId
   * @returns {Promise<Precio[]>}
   */
  async getHistorialProducto(productoId) {
    const data = await apiFetch(`/productos/${productoId}/precios`);
    return data.map(Precio.fromJSON);
  },
};
