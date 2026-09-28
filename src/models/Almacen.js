export class Almacen {
  constructor({ id, descripcion, direccion }) {
    this.id = id;
    this.descripcion = descripcion;
    this.direccion = direccion;
  }

  static fromJSON(json) {
    return new Almacen(json);
  }
}
