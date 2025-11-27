import api from './api';

export interface Specialty {
  id: string;
  name: string;
  description: string;
  commonTests: string[];
  typicalMedications: string[];
  icd10Codes: string[];
  cptCodes: string[];
  averageConsultationTime: number;
  resourceRequirements: any[];
  patientFlow: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialtyCreate {
  name: string;
  description?: string;
  commonTests?: string[];
  typicalMedications?: string[];
  icd10Codes?: string[];
  cptCodes?: string[];
  averageConsultationTime?: number;
  resourceRequirements?: any[];
  patientFlow?: any[];
}

export interface SpecialtyUpdate {
  name?: string;
  description?: string;
  commonTests?: string[];
  typicalMedications?: string[];
  icd10Codes?: string[];
  cptCodes?: string[];
  averageConsultationTime?: number;
  resourceRequirements?: any[];
  patientFlow?: any[];
}

export const specialtyService = {
  // Obtener todas las especialidades
  getAll: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const response = await api.get('/api/v1/config/specialties', { params });
    return response.data;
  },

  // Obtener especialidad por ID
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/config/specialties/${id}`);
    return response.data;
  },

  // Crear nueva especialidad
  create: async (specialty: SpecialtyCreate) => {
    const response = await api.post('/api/v1/config/specialties', specialty);
    return response.data;
  },

  // Actualizar especialidad
  update: async (id: string, specialty: SpecialtyUpdate) => {
    const response = await api.put(`/api/v1/config/specialties/${id}`, specialty);
    return response.data;
  },

  // Eliminar especialidad
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/config/specialties/${id}`);
    return response.data;
  },
};










