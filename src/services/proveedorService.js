// Servicio para consultar, crear, modificar y eliminar proveedores en la API.
import { createCrudService } from './crudServiceFactory';
import { Proveedor } from '../models/Proveedor';

export const proveedorService = createCrudService('/proveedores', Proveedor, {
  getAll: 'getProveedores',
  getById: 'getProveedorById',
  create: 'crearProveedor',
  update: 'actualizarProveedor',
  delete: 'eliminarProveedor',
});
