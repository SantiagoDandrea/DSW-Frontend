// Servicio para consultar y registrar los valores y fechas de vigencia de precios en la API.
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

  async getHistorialProducto(productoId) {
    const data = await apiFetch(`/productos/${productoId}/precios`);
    return data.map(Precio.fromJSON);
  },
};
