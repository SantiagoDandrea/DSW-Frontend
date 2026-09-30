import { apiFetch } from './api';

export const checkoutService = {
  getMediosPago() {
    return apiFetch('/medios-pago');
  },

  crearPedido(datos) {
    return apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  getPedidos() {
    return apiFetch('/pedidos');
  },

  getPedidoById(id) {
    return apiFetch(`/pedidos/${id}`);
  },

  cancelarPedido(id) {
    return apiFetch(`/pedidos/${id}/cancelar`, {
      method: 'POST',
    });
  },
};