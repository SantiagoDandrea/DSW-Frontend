import { apiFetch } from './api';
import { Localidad } from '../models/Localidad';

/**
 * Servicio para operaciones sobre el recurso Localidades.
 */
export const localidadService = {
  /**
   * Obtiene el listado completo de localidades.
   * @returns {Promise<Localidad[]>} Lista de localidades.
   */
  async getLocalidades() {
    const data = await apiFetch('/localidades');
    return data.map(Localidad.fromJSON);
  },
};
