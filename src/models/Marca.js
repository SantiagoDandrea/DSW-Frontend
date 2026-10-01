export class Marca {
  constructor({ id, nombre }) {
    this.id = id;
    this.nombre = nombre;
  }

  static fromJSON(json) {
    return new Marca(json);
  }
}
