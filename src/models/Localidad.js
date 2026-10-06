// Modelo que representa una ciudad o localidad para registrar direcciones y calcular envíos.
export class Localidad {
  constructor({ id, nombre, provincia, codigoPostal }) {
    this.id = id;
    this.nombre = nombre;
    this.provincia = provincia;
    this.codigoPostal = codigoPostal;
  }

  static fromJSON(json) {
    return new Localidad(json);
  }
}
