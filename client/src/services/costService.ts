import api from './api';

export interface CostItem {
  id: string;
  name: string;
  description?: string;
  costType: string;
  category?: string;
  baseCost: number;
  currency: string;
  estimatedDuration?: number;
  specialtyId?: string;
  icd10Code?: string;
  cptCode?: string;
  requiresAuthorization: boolean;
  isCoveredByInsurance: boolean;
  insuranceCoveragePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CostItemCreate {
  name: string;
  description?: string;
  costType: string;
  category?: string;
  baseCost: number;
  currency?: string;
  estimatedDuration?: number;
  specialtyId?: string;
  icd10Code?: string;
  cptCode?: string;
  requiresAuthorization?: boolean;
  isCoveredByInsurance?: boolean;
  insuranceCoveragePercentage?: number;
}

export interface CostAnalysisRequest {
  centerId?: string;
  specialtyId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}

export const costService = {
  // Obtener items de costo
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    cost_type?: string;
    category?: string;
    specialty_id?: string;
  }) => {
    const response = await api.get('/api/v1/costs/items', { params });
    return response.data;
  },

  // Obtener item por ID
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/costs/items/${id}`);
    return response.data;
  },

  // Crear item de costo
  create: async (item: CostItemCreate) => {
    const response = await api.post('/api/v1/costs/items', item);
    return response.data;
  },

  // Actualizar item de costo
  update: async (id: string, item: Partial<CostItemCreate>) => {
    const response = await api.put(`/api/v1/costs/items/${id}`, item);
    return response.data;
  },

  // Eliminar item de costo
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/costs/items/${id}`);
    return response.data;
  },

  // Analizar costos
  analyze: async (request: CostAnalysisRequest) => {
    const response = await api.post('/api/v1/costs/analysis', request);
    return response.data;
  },

  // Obtener costos de un recorrido
  getPatientJourneyCosts: async (journeyId: string) => {
    const response = await api.get(`/api/v1/costs/patient-journey/${journeyId}/costs`);
    return response.data;
  },

  // Calcular costo de un flujo
  calculateFlowCost: async (flowId: string) => {
    const response = await api.get(`/api/v1/costs/calculate/flow/${flowId}`);
    return response.data;
  },

  // Calcular costo promedio por especialidad
  calculateSpecialtyAverageCost: async (specialtyId: string, timePeriod?: string) => {
    const response = await api.get(`/api/v1/costs/calculate/specialty/${specialtyId}`, {
      params: { time_period: timePeriod }
    });
    return response.data;
  },

  // Obtener dashboard de costos
  getDashboard: async (params?: {
    center_id?: string;
    specialty_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/api/v1/costs/dashboard', { params });
    return response.data;
  },
};










