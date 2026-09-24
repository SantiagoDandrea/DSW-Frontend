export class Usuario {
  constructor({ dni, nombre, apellido, email, telefono, rol, localidad }) {
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

  static fromJSON(json) {
    return new Usuario(json);
  }
}
