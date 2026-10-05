// Servicio para consultar, crear, modificar y eliminar medios de pago en la API.
import { createCrudService } from './crudServiceFactory';
import { MedioPago } from '../models/MedioPago';

export const medioPagoService = createCrudService('/medios-pago', MedioPago, {
  getAll: 'getMediosPago',
  getById: 'getMedioPagoById',
  create: 'crearMedioPago',
  update: 'actualizarMedioPago',
  delete: 'eliminarMedioPago',
});
