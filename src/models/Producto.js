// Modelo principal que representa un producto del catálogo con su precio, marca, categoría e imágenes.
import { Categoria } from './Categoria';
import { Imagen } from './Imagen';

export class Producto {
  constructor({ id, nombre, descripcion, categoria, marca, proveedor, precioActual, disponible, stockDisponible, imagenes }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria ? Categoria.fromJSON(categoria) : null;
    this.marca = marca;
    this.proveedor = proveedor;
    this.precioActual = precioActual;
    this.disponible = disponible;
    this.stockDisponible = Number(stockDisponible ?? (disponible ? 1 : 0));
    this.imagenes = (imagenes ?? []).map(Imagen.fromJSON);
  }

  static fromJSON(json) {
    return new Producto(json);
  }
}
