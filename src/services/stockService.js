import { createCrudService } from './crudServiceFactory';
import { Stock } from '../models/Stock';

export const stockService = createCrudService('/stock', Stock, {
  getAll: 'getStocks',
  getById: 'getStockById',
  create: 'crearStock',
  update: 'actualizarStock',
  delete: 'eliminarStock',
});
