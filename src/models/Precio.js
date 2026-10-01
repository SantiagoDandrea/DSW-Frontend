export class Precio {
  constructor({ id, productoId, valor, fechaDesde }) {
    this.id = id;
    this.productoId = productoId;
    this.valor = Number(valor);
    this.fechaDesde = fechaDesde ? new Date(fechaDesde) : null;
  }

  static fromJSON(json) {
    return new Precio(json);
  }
}
