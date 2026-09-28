import { createCrudService } from './crudServiceFactory';
import { Marca } from '../models/Marca';

export const marcaService = createCrudService('/marcas', Marca, {
  getAll: 'getMarcas',
  getById: 'getMarcaById',
  create: 'crearMarca',
  update: 'actualizarMarca',
  delete: 'eliminarMarca',
});
