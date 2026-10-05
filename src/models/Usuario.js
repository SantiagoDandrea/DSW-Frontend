// Modelo que representa un usuario del sistema con sus datos personales, contacto y rol.
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

  get id() {
    return this.dni;
  }

  static fromJSON(json) {
    if (!json) return null;
    return new Usuario(json);
  }
}
