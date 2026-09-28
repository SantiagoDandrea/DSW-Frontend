export class MedioPago {
  constructor({ id, descripcion }) {
    this.id = id;
    this.descripcion = descripcion;
  }

  static fromJSON(json) {
    return new MedioPago(json);
  }
}
