// Modelo que representa una fotografía de un producto con su enlace y posición en la galería.
export class Imagen {
  constructor({ id, url, orden }) {
    this.id = id;
    this.url = url;
    this.orden = orden;
  }

  static fromJSON(json) {
    return new Imagen(json);
  }
}
