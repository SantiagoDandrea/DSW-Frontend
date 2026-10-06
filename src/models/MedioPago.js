// Modelo que representa un medio o forma de pago disponible para abonar pedidos.
export class MedioPago {
  constructor({ id, descripcion }) {
    this.id = id;
    this.descripcion = descripcion;
  }

  static fromJSON(json) {
    return new MedioPago(json);
  }
}
