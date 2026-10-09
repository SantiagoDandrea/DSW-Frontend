// Servicio para listar, consultar, crear, cambiar estado o cancelar pedidos en la API.
import { apiFetch } from './api';
import { Pedido } from '../models/Pedido';

export const pedidoService = {
  async getMediosPago() {
    return apiFetch('/medios-pago');
  },

  async getPedidos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.usuario) params.append('usuario', filtros.usuario);

    const qs = params.toString();
    const endpoint = qs ? `/pedidos?${qs}` : '/pedidos';
    const data = await apiFetch(endpoint);
    return data.map(Pedido.fromJSON);
  },

  async getPedidoById(id) {
    const data = await apiFetch(`/pedidos/${id}`);
    return Pedido.fromJSON(data);
  },

  async crearPedido(data) {
    const res = await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return Pedido.fromJSON(res);
  },

  async cambiarEstado(id, nuevoEstado) {
    const res = await apiFetch(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    return Pedido.fromJSON(res);
  },

  async cancelarPedido(id) {
    const res = await apiFetch(`/pedidos/${id}/cancelar`, {
      method: 'POST',
    });
    return Pedido.fromJSON(res);
  },

  async actualizarPedido(id, data) {
    const res = await apiFetch(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return Pedido.fromJSON(res);
  },

  async eliminarPedido(id) {
    return apiFetch(`/pedidos/${id}`, {
      method: 'DELETE',
    });
  },
};

