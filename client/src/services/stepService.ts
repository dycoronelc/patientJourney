import { api } from './api';

export interface Step {
  id: string;
  name: string;
  description?: string;
  step_type: string;
  base_cost: number;
  cost_unit: string;
  duration_minutes?: number;
  icon?: string;
  color: string;
  is_active: boolean;
  category?: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface StepCreate {
  name: string;
  description?: string;
  step_type: string;
  base_cost: number;
  cost_unit?: string;
  duration_minutes?: number;
  icon?: string;
  color?: string;
  is_active?: boolean;
  category?: string;
  tags?: string[];
}

export interface StepUpdate {
  name?: string;
  description?: string;
  step_type?: string;
  base_cost?: number;
  cost_unit?: string;
  duration_minutes?: number;
  icon?: string;
  color?: string;
  is_active?: boolean;
  category?: string;
  tags?: string[];
}

export interface FlowStep {
  id: string;
  flow_id: string;
  step_id: string;
  order_index: number;
  custom_name?: string;
  custom_cost?: number;
  custom_description?: string;
  next_step_ids: string[];
  previous_step_ids: string[];
  position_x: number;
  position_y: number;
  step?: Step;
  created_at?: string;
  updated_at?: string;
}

class StepServiceClass {
  private baseUrl = '/api/v1/steps';

  // Métodos para Steps
  async getSteps(params?: {
    skip?: number;
    limit?: number;
    step_type?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<Step[]> {
    try {
      const response = await api.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching steps:', error);
      throw error;
    }
  }

  async getStep(stepId: string): Promise<Step> {
    try {
      const response = await api.get(`${this.baseUrl}/${stepId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching step:', error);
      throw error;
    }
  }

  async createStep(stepData: StepCreate): Promise<Step> {
    try {
      const response = await api.post(this.baseUrl, stepData);
      return response.data;
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  }

  async updateStep(stepId: string, stepData: StepUpdate): Promise<Step> {
    try {
      const response = await api.put(`${this.baseUrl}/${stepId}`, stepData);
      return response.data;
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  }

  async deleteStep(stepId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${stepId}`);
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  }

  async getStepsByType(stepType: string): Promise<Step[]> {
    try {
      const response = await api.get(`${this.baseUrl}/type/${stepType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching steps by type:', error);
      throw error;
    }
  }

  async getStepCategories(): Promise<{ categories: string[] }> {
    try {
      const response = await api.get(`${this.baseUrl}/categories/list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching step categories:', error);
      throw error;
    }
  }

  async initializeDefaults(): Promise<{ message: string; steps: Step[] }> {
    try {
      const response = await api.post(`${this.baseUrl}/initialize-defaults`);
      return response.data;
    } catch (error) {
      console.error('Error initializing default steps:', error);
      throw error;
    }
  }

  // Métodos para FlowSteps
  async getFlowSteps(flowId: string): Promise<FlowStep[]> {
    try {
      const response = await api.get(`${this.baseUrl}/flows/${flowId}/steps`);
      return response.data;
    } catch (error) {
      console.error('Error fetching flow steps:', error);
      throw error;
    }
  }

  async addStepToFlow(flowId: string, flowStepData: {
    step_id: string;
    order_index: number;
    custom_name?: string;
    custom_cost?: number;
    custom_description?: string;
    next_step_ids?: string[];
    previous_step_ids?: string[];
    position_x?: number;
    position_y?: number;
  }): Promise<FlowStep> {
    try {
      const response = await api.post(`${this.baseUrl}/flows/${flowId}/steps`, flowStepData);
      return response.data;
    } catch (error) {
      console.error('Error adding step to flow:', error);
      throw error;
    }
  }

  async updateFlowStep(flowStepId: string, flowStepData: {
    order_index?: number;
    custom_name?: string;
    custom_cost?: number;
    custom_description?: string;
    next_step_ids?: string[];
    previous_step_ids?: string[];
    position_x?: number;
    position_y?: number;
  }): Promise<FlowStep> {
    try {
      const response = await api.put(`${this.baseUrl}/flows/steps/${flowStepId}`, flowStepData);
      return response.data;
    } catch (error) {
      console.error('Error updating flow step:', error);
      throw error;
    }
  }

  async removeStepFromFlow(flowStepId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/flows/steps/${flowStepId}`);
    } catch (error) {
      console.error('Error removing step from flow:', error);
      throw error;
    }
  }

  async reorderFlowSteps(flowId: string, stepOrders: Array<{
    flow_step_id: string;
    order_index: number;
  }>): Promise<{ message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/flows/${flowId}/reorder`, stepOrders);
      return response.data;
    } catch (error) {
      console.error('Error reordering flow steps:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  getStepTypeIcon(stepType: string): string {
    const iconMap: Record<string, string> = {
      consultation: 'Person',
      laboratory: 'Science',
      imaging: 'Assignment',
      referral: 'LocalHospital',
      discharge: 'CheckCircle',
      procedure: 'Build',
      medication: 'Medication',
    };
    return iconMap[stepType] || 'Person';
  }

  getStepTypeColor(stepType: string): string {
    const colorMap: Record<string, string> = {
      consultation: '#1976d2',
      laboratory: '#dc004e',
      imaging: '#2e7d32',
      referral: '#ed6c02',
      discharge: '#2e7d32',
      procedure: '#9c27b0',
      medication: '#f57c00',
    };
    return colorMap[stepType] || '#1976d2';
  }

  getStepTypeLabel(stepType: string): string {
    const labelMap: Record<string, string> = {
      consultation: 'Consulta',
      laboratory: 'Laboratorio',
      imaging: 'Imágenes',
      referral: 'Referencia',
      discharge: 'Alta',
      procedure: 'Procedimiento',
      medication: 'Medicación',
    };
    return labelMap[stepType] || stepType;
  }

  formatStepCost(step: Step): string {
    return `${step.cost_unit} $${step.base_cost.toFixed(2)}`;
  }

  formatStepDuration(step: Step): string {
    if (!step.duration_minutes) return 'N/A';
    return `${step.duration_minutes} min`;
  }
}

export const stepService = new StepServiceClass();










