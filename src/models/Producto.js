import { Categoria } from './Categoria';

export class Producto {
  constructor({ id, nombre, descripcion, categoria, marca, proveedor, precioActual, disponible, imagenes }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria ? Categoria.fromJSON(categoria) : null;
    this.marca = marca;
    this.proveedor = proveedor;
    this.precioActual = precioActual;
    this.disponible = disponible;
    this.imagenes = imagenes ?? [];
  }

  static fromJSON(json) {
    return new Producto(json);
  }
}
