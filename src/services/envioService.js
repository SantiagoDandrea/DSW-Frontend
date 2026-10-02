import { apiFetch } from './api';
import { Envio } from '../models/Envio';

/**
 * Servicio para operaciones sobre el recurso Envíos.
 */
export const envioService = {
  /**
   * Actualiza el domicilio de entrega de un envío (solo si envío y pedido siguen PENDIENTE).
   * @param {number|string} id
   * @param {string} domicilioEntrega
   * @returns {Promise<Envio>}
   */
  async actualizarDomicilio(id, domicilioEntrega) {
    const data = await apiFetch(`/envios/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ domicilioEntrega }),
    });
    return Envio.fromJSON(data);
  },

  /**
   * Cancela la entrega a domicilio sin cancelar el pedido (ej. cambio a retiro en sucursal).
   * @param {number|string} id
   * @returns {Promise<Envio>}
   */
  async cancelarEnvio(id) {
    const data = await apiFetch(`/envios/${id}/cancelar`, {
      method: 'POST',
    });
    return Envio.fromJSON(data);
  },
};
