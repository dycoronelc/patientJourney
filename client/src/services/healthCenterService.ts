import api from './api';

export interface HealthCenter {
  id: string;
  name: string;
  type: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: any;
  resources?: any[];
  specialties?: string[];
  operatingHours?: any;
  contactInfo?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCenterCreate {
  name: string;
  type: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: any;
  resources?: any[];
  specialties?: string[];
  operatingHours?: any;
  contactInfo?: any;
}

export interface HealthCenterUpdate {
  name?: string;
  type?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: any;
  resources?: any[];
  specialties?: string[];
  operatingHours?: any;
  contactInfo?: any;
}

export const healthCenterService = {
  // Obtener todos los centros de salud
  getAll: async (params?: { skip?: number; limit?: number; search?: string; center_type?: string }) => {
    const response = await api.get('/api/v1/config/centers', { params });
    return response.data;
  },

  // Obtener centro por ID
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/config/centers/${id}`);
    return response.data;
  },

  // Crear nuevo centro
  create: async (center: HealthCenterCreate) => {
    const response = await api.post('/api/v1/config/centers', center);
    return response.data;
  },

  // Actualizar centro
  update: async (id: string, center: HealthCenterUpdate) => {
    const response = await api.put(`/api/v1/config/centers/${id}`, center);
    return response.data;
  },

  // Eliminar centro
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/config/centers/${id}`);
    return response.data;
  },

  // Obtener especialidades de un centro
  getSpecialties: async (id: string) => {
    const response = await api.get(`/api/v1/config/centers/${id}/specialties`);
    return response.data;
  },

  // Agregar especialidad a un centro
  addSpecialty: async (id: string, specialtyId: string) => {
    const response = await api.post(`/api/v1/config/centers/${id}/specialties`, { specialtyId });
    return response.data;
  },

  // Remover especialidad de un centro
  removeSpecialty: async (id: string, specialtyId: string) => {
    const response = await api.delete(`/api/v1/config/centers/${id}/specialties/${specialtyId}`);
    return response.data;
  },
};










