import { createCrudService } from './crudServiceFactory';

export const localidadService = createCrudService('/localidades', null, {
  getAll: 'getLocalidades',
  getById: 'getLocalidadById',
  create: 'crearLocalidad',
  update: 'actualizarLocalidad',
  delete: 'eliminarLocalidad',
});
