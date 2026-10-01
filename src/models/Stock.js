export class Stock {
  constructor({ id, productoId, almacenId, cantidad }) {
    this.id = id;
    this.productoId = productoId;
    this.almacenId = almacenId;
    this.cantidad = cantidad;
  }

  static fromJSON(json) {
    return new Stock(json);
  }
}
