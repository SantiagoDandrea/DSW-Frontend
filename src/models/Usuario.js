export class Usuario {
  constructor({ dni, nombre, apellido, email, telefono, rol, localidad } = {}) {
    this.dni = dni;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.telefono = telefono;
    this.rol = rol;
    this.localidad = localidad;
  }

  get esAdmin() {
    return this.rol === 'ADMIN';
  }

  /**
   * En el backend la clave primaria del Usuario es el DNI (no existe campo autoincremental id).
   * Este getter funciona como alias de conveniencia para componentes o listas que requieran un identificador único.
   */
  get id() {
    return this.dni;
  }

  static fromJSON(json) {
    if (!json) return null;
    return new Usuario(json);
  }
}
