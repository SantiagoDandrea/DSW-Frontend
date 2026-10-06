export class Envio {
  constructor({ id, pedidoId, domicilioEntrega, costo, fechaTentativa, fechaEntregado, estado, pedido }) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.domicilioEntrega = domicilioEntrega;
    this.costo = costo != null ? Number(costo) : null;
    this.fechaTentativa = fechaTentativa ? new Date(fechaTentativa) : null;
    this.fechaEntregado = fechaEntregado ? new Date(fechaEntregado) : null;
    this.estado = estado;
    // Resumen del pedido (con su cliente); solo viene en los listados de /envios
    this.pedido = pedido ?? null;
  }

  static fromJSON(json) {
    if (!json) return null;
    return new Envio(json);
  }
}
