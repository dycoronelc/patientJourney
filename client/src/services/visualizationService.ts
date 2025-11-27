import api from './api';

export interface VisualizationData {
  patientFlows: {
    specialtyId: string;
    flows: {
      stepId: string;
      stepName: string;
      patientCount: number;
      averageTime: number;
      bottlenecks: string[];
    }[];
  }[];
  resourceHeatmap: {
    resourceId: string;
    resourceName: string;
    utilization: number;
    timeSlots: {
      start: string;
      end: string;
      utilization: number;
    }[];
  }[];
  realTimeMetrics: {
    activePatients: number;
    availableResources: number;
    queueLength: number;
    averageWaitTime: number;
  };
}

export const visualizationService = {
  // Obtener datos de flujos de pacientes
  getFlows: async (params?: { specialtyId?: string; timeRange?: string }) => {
    const response = await api.get('/api/v1/visualization/flows', { params });
    return response.data;
  },

  // Obtener datos para mapa de calor
  getHeatmap: async (params?: { resourceType?: string; timeRange?: string }) => {
    const response = await api.get('/api/v1/visualization/heatmap', { params });
    return response.data;
  },

  // Obtener datos en tiempo real
  getRealTime: async () => {
    const response = await api.get('/api/v1/visualization/realtime');
    return response.data;
  },

  // Obtener datos completos de visualización
  getVisualizationData: async (params?: any) => {
    const response = await api.get('/api/v1/visualization/data', { params });
    return response.data;
  },
};










