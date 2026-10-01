import { apiFetch } from './api';
import { Pedido } from '../models/Pedido';

/**
 * Servicio para operaciones sobre el recurso Pedidos.
 */
export const pedidoService = {
  /**
   * Obtiene la lista de pedidos con filtros opcionales.
   * @param {{ estado?: string, fechaDesde?: string, fechaHasta?: string, usuario?: string }} [filtros={}]
   * @returns {Promise<Pedido[]>}
   */
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

  /**
   * Obtiene el detalle completo de un pedido por ID.
   * @param {number|string} id
   * @returns {Promise<Pedido>}
   */
  async getPedidoById(id) {
    const data = await apiFetch(`/pedidos/${id}`);
    return Pedido.fromJSON(data);
  },

  /**
   * Crea un nuevo pedido con sus items y datos de envío.
   * @param {{ productos: Array<{ productoId: number, cantidad: number }>, medioPagoId: number, envio?: { requiereEnvio: boolean, domicilioEntrega?: string }, usuarioDni?: string }} data
   * @returns {Promise<Pedido>}
   */
  async crearPedido(data) {
    const res = await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return Pedido.fromJSON(res);
  },

  /**
   * Cambia el estado del pedido siguiendo la máquina de estados.
   * @param {number|string} id
   * @param {string} nuevoEstado
   * @returns {Promise<Pedido>}
   */
  async cambiarEstado(id, nuevoEstado) {
    const res = await apiFetch(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    return Pedido.fromJSON(res);
  },

  /**
   * Cancela el pedido y revierte el stock en los almacenes de origen.
   * @param {number|string} id
   * @returns {Promise<Pedido>}
   */
  async cancelarPedido(id) {
    const res = await apiFetch(`/pedidos/${id}/cancelar`, {
      method: 'POST',
    });
    return Pedido.fromJSON(res);
  },

  /**
   * Actualiza datos básicos del pedido (medio de pago o domicilio).
   * @param {number|string} id
   * @param {{ medioPagoId?: number, domicilioEntrega?: string }} data
   * @returns {Promise<Pedido>}
   */
  async actualizarPedido(id, data) {
    const res = await apiFetch(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return Pedido.fromJSON(res);
  },

  /**
   * Elimina un pedido por ID (solo ADMIN).
   * @param {number|string} id
   * @returns {Promise<null>}
   */
  async eliminarPedido(id) {
    return apiFetch(`/pedidos/${id}`, {
      method: 'DELETE',
    });
  },
};
