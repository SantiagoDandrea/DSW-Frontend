export class Proveedor {
  constructor({ id, nombre, cuit, telefono }) {
    this.id = id;
    this.nombre = nombre;
    this.cuit = cuit;
    this.telefono = telefono;
  }

  static fromJSON(json) {
    return new Proveedor(json);
  }
}
