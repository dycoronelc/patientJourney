import api from './api';

export interface PatientJourney {
  id: string;
  patientId: string;
  healthCenterId?: string;
  specialtyId?: string;
  flowId?: string;
  status: string;
  currentStep?: string;
  startDate: string;
  endDate?: string;
  totalCost: number;
  totalDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatientJourneyDetail extends PatientJourney {
  completedSteps?: any[];
  laboratoryOrders?: any[];
  imagingOrders?: any[];
  referrals?: any[];
  costDetails?: any;
  waitTimes?: any;
}

export interface PatientJourneyCreate {
  patientId: string;
  healthCenterId?: string;
  specialtyId?: string;
  flowId?: string;
}

export const patientJourneyService = {
  // Obtener todos los recorridos de pacientes
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    patient_id?: string;
    center_id?: string;
    specialty_id?: string;
    status?: string;
  }) => {
    const response = await api.get('/api/v1/patient-journey/journeys', { params });
    return response.data;
  },

  // Obtener detalle completo de un recorrido
  getById: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}`);
    return response.data;
  },

  // Crear nuevo recorrido
  create: async (journey: PatientJourneyCreate) => {
    const response = await api.post('/api/v1/patient-journey/journeys', journey);
    return response.data;
  },

  // Actualizar recorrido
  update: async (journeyId: string, data: any) => {
    const response = await api.put(`/api/v1/patient-journey/journeys/${journeyId}`, data);
    return response.data;
  },

  // Obtener órdenes de laboratorio
  getLaboratoryOrders: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}/laboratory-orders`);
    return response.data;
  },

  // Sincronizar órdenes de laboratorio desde sistema externo
  syncLaboratoryOrders: async (journeyId: string) => {
    const response = await api.post(`/api/v1/patient-journey/journeys/${journeyId}/sync-laboratory-orders`);
    return response.data;
  },

  // Obtener órdenes de imágenes
  getImagingOrders: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}/imaging-orders`);
    return response.data;
  },

  // Sincronizar órdenes de imágenes desde PACS
  syncImagingOrders: async (journeyId: string) => {
    const response = await api.post(`/api/v1/patient-journey/journeys/${journeyId}/sync-imaging-orders`);
    return response.data;
  },

  // Obtener referencias
  getReferrals: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}/referrals`);
    return response.data;
  },

  // Sincronizar referencias desde sistema externo
  syncReferrals: async (journeyId: string) => {
    const response = await api.post(`/api/v1/patient-journey/journeys/${journeyId}/sync-referrals`);
    return response.data;
  },

  // Obtener diagrama de flujo
  getFlowDiagram: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}/flow-diagram`);
    return response.data;
  },

  // Obtener timeline del recorrido
  getTimeline: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}/timeline`);
    return response.data;
  },

  // Obtener resumen de costos
  getCostSummary: async (journeyId: string) => {
    const response = await api.get(`/api/v1/patient-journey/journeys/${journeyId}/cost-summary`);
    return response.data;
  },
};










