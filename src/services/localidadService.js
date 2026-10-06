// Servicio para consultar, crear, modificar y eliminar localidades en la API.
import { createCrudService } from './crudServiceFactory';
import { Localidad } from '../models/Localidad';

export const localidadService = createCrudService('/localidades', Localidad, {
  getAll: 'getLocalidades',
  getById: 'getLocalidadById',
  create: 'crearLocalidad',
  update: 'actualizarLocalidad',
  delete: 'eliminarLocalidad',
});
