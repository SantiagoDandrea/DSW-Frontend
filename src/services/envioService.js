// Servicio para consultar, actualizar direcciones de entrega o cancelar envíos a domicilio en la API.
import { apiFetch } from './api';
import { Envio } from '../models/Envio';

export const envioService = {
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

  async actualizarDomicilio(id, domicilioEntrega) {
    const data = await apiFetch(`/envios/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ domicilioEntrega }),
    });
    return Envio.fromJSON(data);
  },

  async cancelarEnvio(id) {
    const data = await apiFetch(`/envios/${id}/cancelar`, {
      method: 'POST',
    });
    return Envio.fromJSON(data);
  },
};
