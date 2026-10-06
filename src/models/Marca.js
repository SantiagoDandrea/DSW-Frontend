// Modelo que representa una marca de fabricante asociada a los productos.
export class Marca {
  constructor({ id, nombre }) {
    this.id = id;
    this.nombre = nombre;
  }

  static fromJSON(json) {
    return new Marca(json);
  }
}
