import { createCrudService } from './crudServiceFactory';
import { Categoria } from '../models/Categoria';

export const categoriaService = createCrudService('/categorias', Categoria, {
  getAll: 'getCategorias',
  getById: 'getCategoriaById',
  create: 'crearCategoria',
  update: 'actualizarCategoria',
  delete: 'eliminarCategoria',
});
