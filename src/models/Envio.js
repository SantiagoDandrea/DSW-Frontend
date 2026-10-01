export class Envio {
  constructor({ id, pedidoId, domicilioEntrega, costo, fechaTentativa, fechaEntregado, estado }) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.domicilioEntrega = domicilioEntrega;
    this.costo = costo != null ? Number(costo) : null;
    this.fechaTentativa = fechaTentativa ? new Date(fechaTentativa) : null;
    this.fechaEntregado = fechaEntregado ? new Date(fechaEntregado) : null;
    this.estado = estado;
  }

  static fromJSON(json) {
    if (!json) return null;
    return new Envio(json);
  }
}
