import api from './api';

export interface FlowNode {
  id: string;
  type?: string;
  label?: string;
  cost?: number;
  duration?: number;
  position?: { x: number; y: number };
  data?: any;
}

export interface FlowEdge {
  id?: string;
  source: string;
  target: string;
  type?: string;
}

export interface PatientFlow {
  id: string;
  name: string;
  description?: string;
  specialty?: string;
  specialtyId?: string;
  specialtyName?: string; // Agregado para coincidir con el endpoint
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  flowSteps?: FlowNode[];
  flowEdges?: FlowEdge[];
  steps?: number;
  averageDuration?: number; // Agregado para coincidir con el endpoint
  estimatedDuration?: number;
  estimatedCost?: number;
  resourceRequirements?: any;
  costBreakdown?: any;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientFlowCreate {
  name: string;
  description?: string;
  specialtyId?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  estimatedDuration?: number;
  estimatedCost?: number;
  resourceRequirements?: any;
  costBreakdown?: any;
  isActive?: boolean;
}

export interface PatientFlowUpdate {
  name?: string;
  description?: string;
  specialtyId?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  estimatedDuration?: number;
  estimatedCost?: number;
  resourceRequirements?: any;
  costBreakdown?: any;
  isActive?: boolean;
}

export const patientFlowService = {
  // Obtener todos los flujos de pacientes
  getAll: async (params?: { skip?: number; limit?: number; specialty_id?: string; is_active?: boolean }): Promise<PatientFlow[]> => {
    try {
      const response = await api.get<{success: boolean, data: PatientFlow[]}>('/api/v1/medical-flows/flows', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  },

  // Obtener flujo por ID
  getById: async (id: string): Promise<PatientFlow> => {
    try {
      const response = await api.get<{success: boolean, data: PatientFlow}>(`/api/v1/medical-flows/flows/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching flow ${id}:`, error);
      throw error;
    }
  },

  // Crear nuevo flujo
  create: async (flow: PatientFlowCreate): Promise<PatientFlow> => {
    try {
      const response = await api.post<PatientFlow>('/api/v1/flows/', flow);
      return response.data;
    } catch (error) {
      console.error('Error creating flow:', error);
      throw error;
    }
  },

  // Actualizar flujo
  update: async (id: string, flow: PatientFlowUpdate): Promise<PatientFlow> => {
    try {
      const response = await api.put<PatientFlow>(`/api/v1/flows/${id}`, flow);
      return response.data;
    } catch (error) {
      console.error(`Error updating flow ${id}:`, error);
      throw error;
    }
  },

  // Eliminar flujo
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/flows/${id}`);
    } catch (error) {
      console.error(`Error deleting flow ${id}:`, error);
      throw error;
    }
  },

  // Duplicar flujo
  duplicate: async (id: string, newName?: string): Promise<PatientFlow> => {
    try {
      const response = await api.post<PatientFlow>(`/api/v1/flows/${id}/duplicate`, null, {
        params: { new_name: newName }
      });
      return response.data;
    } catch (error) {
      console.error(`Error duplicating flow ${id}:`, error);
      throw error;
    }
  },

  // Obtener flujos por especialidad
  getBySpecialty: async (specialtyId: string): Promise<PatientFlow[]> => {
    try {
      const response = await api.get<PatientFlow[]>('/api/v1/flows/', {
        params: { specialty_id: specialtyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching flows for specialty ${specialtyId}:`, error);
      throw error;
    }
  },
};




