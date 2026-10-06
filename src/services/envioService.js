import { apiFetch } from './api';
import { Envio } from '../models/Envio';

/**
 * Servicio para operaciones sobre el recurso Envíos.
 */
export const envioService = {
  /**
   * Lista envíos. El ADMIN ve todos; el CLIENTE solo los de sus pedidos.
   * @param {{ estado?: string, pedidoId?: number|string }} [filtros={}]
   * @returns {Promise<Envio[]>}
   */
  async getEnvios(filtros = {}) {
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const data = await apiFetch(queryString ? `/envios?${queryString}` : '/envios');
    return data.map(Envio.fromJSON);
  },

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
