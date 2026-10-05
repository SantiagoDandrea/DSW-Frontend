// Servicio para consultar, crear, modificar y eliminar almacenes comunicándose con la API.
import { createCrudService } from './crudServiceFactory';
import { Almacen } from '../models/Almacen';

export const almacenService = createCrudService('/almacenes', Almacen, {
  getAll: 'getAlmacenes',
  getById: 'getAlmacenById',
  create: 'crearAlmacen',
  update: 'actualizarAlmacen',
  delete: 'eliminarAlmacen',
});
