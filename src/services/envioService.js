// Servicio para actualizar direcciones de entrega o cancelar envíos a domicilio en la API.
import { apiFetch } from './api';
import { Envio } from '../models/Envio';

export const envioService = {
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
