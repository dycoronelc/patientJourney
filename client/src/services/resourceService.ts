import api from './api';

export interface Resource {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  availability: string;
  capacity: number;
  currentUtilization: number;
  costPerHour: number;
  location?: string;
  specifications?: any;
  healthCenterId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreate {
  name: string;
  type: string;
  category?: string;
  description?: string;
  availability?: string;
  capacity?: number;
  currentUtilization?: number;
  costPerHour?: number;
  location?: string;
  specifications?: any;
  healthCenterId?: string;
}

export interface ResourceUpdate {
  name?: string;
  type?: string;
  category?: string;
  description?: string;
  availability?: string;
  capacity?: number;
  currentUtilization?: number;
  costPerHour?: number;
  location?: string;
  specifications?: any;
  healthCenterId?: string;
}

export const resourceService = {
  // Obtener todos los recursos
  getAll: async (params?: { skip?: number; limit?: number; resource_type?: string; center_id?: string }) => {
    const response = await api.get('/api/v1/config/resources', { params });
    return response.data;
  },

  // Obtener recurso por ID
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/config/resources/${id}`);
    return response.data;
  },

  // Crear nuevo recurso
  create: async (resource: ResourceCreate) => {
    const response = await api.post('/api/v1/config/resources', resource);
    return response.data;
  },

  // Actualizar recurso
  update: async (id: string, resource: ResourceUpdate) => {
    const response = await api.put(`/api/v1/config/resources/${id}`, resource);
    return response.data;
  },

  // Eliminar recurso
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/config/resources/${id}`);
    return response.data;
  },

  // Obtener recursos por centro
  getByCenter: async (centerId: string) => {
    const response = await api.get(`/api/v1/config/resources/center/${centerId}`);
    return response.data;
  },

  // Obtener recursos por tipo
  getByType: async (type: string) => {
    const response = await api.get(`/api/v1/config/resources/type/${type}`);
    return response.data;
  },
};










