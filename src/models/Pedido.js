import { Envio } from './Envio';

export class Pedido {
  constructor({ id, fecha, estado, total, cliente, medioPago, detalles, envio }) {
    this.id = id;
    this.fecha = fecha ? new Date(fecha) : null;
    this.estado = estado;
    this.total = Number(total);
    this.cliente = cliente;
    this.medioPago = medioPago;
    this.detalles = detalles ?? [];
    this.envio = Envio.fromJSON(envio);
  }

  static fromJSON(json) {
    return new Pedido(json);
  }
}
