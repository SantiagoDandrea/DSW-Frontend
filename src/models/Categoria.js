export class Categoria {
  constructor({ id, nombre }) {
    this.id = id;
    this.nombre = nombre;
  }

  static fromJSON(json) {
    return new Categoria(json);
  }
}
