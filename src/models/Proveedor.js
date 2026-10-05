// Modelo que representa un proveedor de productos con su información fiscal y de contacto.
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
