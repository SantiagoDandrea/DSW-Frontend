// Servicio para consultar, crear, modificar y eliminar existencias de stock en la API.
import { createCrudService } from './crudServiceFactory';
import { Stock } from '../models/Stock';

export const stockService = createCrudService('/stock', Stock, {
  getAll: 'getStocks',
  getById: 'getStockById',
  create: 'crearStock',
  update: 'actualizarStock',
  delete: 'eliminarStock',
});
