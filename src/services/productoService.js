// Servicio para consultar, crear, modificar y eliminar productos y sus fotos en la API.
import { apiFetch } from './api';
import { Producto } from '../models/Producto';
import { Imagen } from '../models/Imagen';

export const productoService = {
  async getProductos(filtros = {}) {
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/productos?${queryString}` : '/productos';

    const data = await apiFetch(endpoint);
    return data.map(Producto.fromJSON);
  },

  async getProductosByCategoria(categoriaId) {
    return this.getProductos({ categoriaId });
  },

  async getProductoById(id) {
    const data = await apiFetch(`/productos/${id}`);
    return Producto.fromJSON(data);
  },

  async crearProducto(data) {
    const res = await apiFetch('/productos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return Producto.fromJSON(res);
  },

  async actualizarProducto(id, data) {
    const res = await apiFetch(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return Producto.fromJSON(res);
  },

  async eliminarProducto(id) {
    return apiFetch(`/productos/${id}`, {
      method: 'DELETE',
    });
  },

  async agregarImagen(productoId, data) {
    const res = await apiFetch(`/productos/${productoId}/imagenes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return Imagen.fromJSON(res);
  },

  async eliminarImagen(imagenId) {
    return apiFetch(`/productos/imagenes/${imagenId}`, {
      method: 'DELETE',
    });
  },
};

