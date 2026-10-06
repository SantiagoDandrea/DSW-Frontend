// Generador genérico de servicios CRUD para conectar cualquier entidad con sus rutas de la API.
import { apiFetch } from './api';

export const createCrudService = (endpoint, Model = null, aliases = {}) => {
  const service = {
    async getAll(params = {}) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      const qs = searchParams.toString();
      const url = qs ? `${endpoint}?${qs}` : endpoint;
      const data = await apiFetch(url);
      return Model ? data.map(Model.fromJSON) : data;
    },

    async getById(id) {
      const data = await apiFetch(`${endpoint}/${id}`);
      return Model ? Model.fromJSON(data) : data;
    },

    async create(data) {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return Model ? Model.fromJSON(res) : res;
    },

    async update(id, data) {
      const res = await apiFetch(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return Model ? Model.fromJSON(res) : res;
    },

    async delete(id) {
      return apiFetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
  };

  if (aliases.getAll) service[aliases.getAll] = (params) => service.getAll(params);
  if (aliases.getById) service[aliases.getById] = (id) => service.getById(id);
  if (aliases.create) service[aliases.create] = (data) => service.create(data);
  if (aliases.update) service[aliases.update] = (id, data) => service.update(id, data);
  if (aliases.delete) service[aliases.delete] = (id) => service.delete(id);

  return service;
};
