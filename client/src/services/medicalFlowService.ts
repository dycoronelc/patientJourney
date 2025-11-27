/**
 * Servicio frontend para flujos médicos normalizados
 * Proporciona acceso a los 20 flujos médicos completos con datos reales
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Specialty {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface StepType {
  id: string;
  code: string;
  name: string;
}

export interface UrgencyLevel {
  id: string;
  code: string;
  name: string;
}

export interface FlowNode {
  id: string;
  flowId: string;
  stepTypeId: string;
  stepTypeName?: string;
  label: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  costMin?: number;
  costMax?: number;
  costAvg?: number;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
}

export interface FlowEdge {
  id: string;
  flowId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: string;
  createdAt: string;
}

export interface Flow {
  id: string;
  name: string;
  specialtyId?: string;
  specialtyName?: string;
  description?: string;
  averageDuration?: number;
  estimatedCost?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface ReferralCriteria {
  id: string;
  diagnosis: string;
  criterion: string;
  targetSpecialtyId: string;
  targetSpecialtyName?: string;
  urgencyId: string;
  urgencyName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface FlowStatistics {
  totalSpecialties: number;
  totalFlows: number;
  totalNodes: number;
  totalEdges: number;
  totalReferralCriteria: number;
  averageFlowDuration: number;
  averageFlowCost: number;
}

export interface FlowFilters {
  specialtyId?: string;
  minDuration?: number;
  maxDuration?: number;
  minCost?: number;
  maxCost?: number;
  search?: string;
}

class MedicalFlowService {
  private baseURL = `${API_URL}/api/v1/medical-flows`;

  /**
   * Obtener todas las especialidades médicas
   */
  async getSpecialties(): Promise<Specialty[]> {
    try {
      const response = await axios.get(`${this.baseURL}/specialties`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo especialidades:', error);
      return [];
    }
  }

  /**
   * Obtener especialidad por ID
   */
  async getSpecialtyById(specialtyId: string): Promise<Specialty | null> {
    try {
      const response = await axios.get(`${this.baseURL}/specialties/${specialtyId}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error obteniendo especialidad ${specialtyId}:`, error);
      return null;
    }
  }

  /**
   * Obtener todos los flujos médicos
   */
  async getFlows(filters?: FlowFilters): Promise<Flow[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.specialtyId) params.append('specialty_id', filters.specialtyId);
      if (filters?.minDuration) params.append('min_duration', filters.minDuration.toString());
      if (filters?.maxDuration) params.append('max_duration', filters.maxDuration.toString());
      if (filters?.minCost) params.append('min_cost', filters.minCost.toString());
      if (filters?.maxCost) params.append('max_cost', filters.maxCost.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/flows?${queryString}` : `${this.baseURL}/flows`;
      
      const response = await axios.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo flujos:', error);
      return [];
    }
  }

  /**
   * Obtener flujos por especialidad
   */
  async getFlowsBySpecialty(specialtyId: string): Promise<Flow[]> {
    return this.getFlows({ specialtyId });
  }

  /**
   * Obtener flujo completo por ID
   */
  async getFlowById(flowId: string): Promise<Flow | null> {
    try {
      const response = await axios.get(`${this.baseURL}/flows/${flowId}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error obteniendo flujo ${flowId}:`, error);
      return null;
    }
  }

  /**
   * Obtener tipos de pasos
   */
  async getStepTypes(): Promise<StepType[]> {
    try {
      const response = await axios.get(`${this.baseURL}/step-types`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo tipos de pasos:', error);
      return [];
    }
  }

  /**
   * Obtener niveles de urgencia
   */
  async getUrgencyLevels(): Promise<UrgencyLevel[]> {
    try {
      const response = await axios.get(`${this.baseURL}/urgency-levels`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo niveles de urgencia:', error);
      return [];
    }
  }

  /**
   * Obtener criterios de referencia
   */
  async getReferralCriteria(specialtyId?: string): Promise<ReferralCriteria[]> {
    try {
      const params = specialtyId ? `?specialty_id=${specialtyId}` : '';
      const response = await axios.get(`${this.baseURL}/referral-criteria${params}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo criterios de referencia:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de flujos
   */
  async getFlowStatistics(): Promise<FlowStatistics | null> {
    try {
      const response = await axios.get(`${this.baseURL}/statistics`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Buscar flujos por texto
   */
  async searchFlows(query: string): Promise<Flow[]> {
    return this.getFlows({ search: query });
  }

  /**
   * Obtener flujos por rango de duración
   */
  async getFlowsByDurationRange(minDuration: number, maxDuration: number): Promise<Flow[]> {
    return this.getFlows({ minDuration, maxDuration });
  }

  /**
   * Obtener flujos por rango de costo
   */
  async getFlowsByCostRange(minCost: number, maxCost: number): Promise<Flow[]> {
    return this.getFlows({ minCost, maxCost });
  }

  /**
   * Formatear duración en minutos a texto legible
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  /**
   * Formatear costo a moneda
   */
  formatCost(cost: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  }

  /**
   * Obtener color para tipo de paso
   */
  getStepTypeColor(stepTypeCode: string): string {
    const colors: { [key: string]: string } = {
      // Códigos del backend
      'st-cons': '#2196F3',      // Azul - Consulta
      'st-lab': '#4CAF50',       // Verde - Laboratorio
      'st-img': '#FF9800',       // Naranja - Imagenología
      'st-dx': '#9C27B0',        // Púrpura - Diagnóstico
      'st-rx': '#F44336',        // Rojo - Tratamiento/Prescripción
      'st-ref': '#607D8B',       // Gris azulado - Referencia
      'st-fu': '#795548',        // Marrón - Seguimiento
      'st-proc': '#3F51B5',      // Índigo - Procedimiento
      'st-emergency': '#E91E63', // Rosa - Emergencia
      'st-discharge': '#009688', // Teal - Alta
      
      // Códigos legacy (mantener compatibilidad)
      'consultation': '#2196F3',
      'laboratory': '#4CAF50',
      'imaging': '#FF9800',
      'diagnosis': '#9C27B0',
      'prescription': '#F44336',
      'referral': '#607D8B',
      'followup': '#795548',
      'emergency': '#E91E63',
      'procedure': '#3F51B5',
      'discharge': '#009688'
    };
    return colors[stepTypeCode] || '#757575';
  }

  /**
   * Obtener icono para tipo de paso
   */
  getStepTypeIcon(stepTypeCode: string): string {
    const icons: { [key: string]: string } = {
      // Códigos del backend
      'st-cons': 'medical_services',    // Consulta
      'st-lab': 'science',              // Laboratorio
      'st-img': 'camera_alt',           // Imagenología
      'st-dx': 'psychology',            // Diagnóstico
      'st-rx': 'medication',            // Tratamiento/Prescripción
      'st-ref': 'arrow_forward',        // Referencia
      'st-fu': 'schedule',              // Seguimiento
      'st-proc': 'medical_information', // Procedimiento
      'st-emergency': 'emergency',      // Emergencia
      'st-discharge': 'exit_to_app',    // Alta
      
      // Códigos legacy (mantener compatibilidad)
      'consultation': 'medical_services',
      'laboratory': 'science',
      'imaging': 'camera_alt',
      'diagnosis': 'psychology',
      'prescription': 'medication',
      'referral': 'arrow_forward',
      'followup': 'schedule',
      'emergency': 'emergency',
      'procedure': 'medical_information',
      'discharge': 'exit_to_app'
    };
    return icons[stepTypeCode] || 'help';
  }
}

export const medicalFlowService = new MedicalFlowService();
export default medicalFlowService;

