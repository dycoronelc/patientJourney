/**
 * Servicio para consumir analytics de Bienimed
 */
import api from './api';

export interface DashboardStats {
  total_patients: number;
  total_doctors: number;
  total_diagnoses: number;
  total_procedures: number;
  total_referrals: number;
  total_prescriptions: number;
  total_lab_orders: number;
  total_imaging_orders: number;
  total_invoices: number;
  total_revenue: number;
  avg_invoice: number;
  last_updated: string;
}

export interface PatientFlowAnalytics {
  most_common_diagnoses: Record<string, number>;
  most_common_procedures: Record<string, number>;
  most_common_referrals: Record<string, number>;
  lab_orders_count: number;
  imaging_orders_count: number;
  total_consultations: number;
  analysis_date: string;
}

export interface RevenueAnalytics {
  monthly_revenue: Record<string, number>;
  top_patients_by_revenue: Record<string, number>;
  total_invoices_analyzed: number;
  analysis_date: string;
}

export interface DoctorPerformance {
  doctor_performance: Record<string, {
    name: string;
    specialty_id: number;
    total_diagnoses: number;
    total_procedures: number;
    total_prescriptions: number;
    total_consultations: number;
  }>;
  total_doctors_analyzed: number;
  analysis_date: string;
}

export interface FlowStep {
  type: string;
  name: string;
  cost: number;
  duration: number;
}

export interface FlowRecommendation {
  type: string;
  name: string;
  description: string;
  steps: FlowStep[];
  estimated_cost: number;
  estimated_duration: number;
  frequency: number;
}

export const bienimedAnalyticsService = {
  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/api/v1/bienimed-analytics/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Obtener análisis de flujos de pacientes
   */
  getPatientFlowAnalytics: async (): Promise<PatientFlowAnalytics> => {
    try {
      const response = await api.get<PatientFlowAnalytics>('/api/v1/bienimed-analytics/patient-flow-analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching patient flow analytics:', error);
      throw error;
    }
  },

  /**
   * Obtener análisis de facturación
   */
  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    try {
      const response = await api.get<RevenueAnalytics>('/api/v1/bienimed-analytics/revenue-analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  /**
   * Obtener rendimiento de doctores
   */
  getDoctorPerformance: async (): Promise<DoctorPerformance> => {
    try {
      const response = await api.get<DoctorPerformance>('/api/v1/bienimed-analytics/doctor-performance');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor performance:', error);
      throw error;
    }
  },

  /**
   * Obtener recomendaciones de flujos
   */
  getFlowRecommendations: async (): Promise<FlowRecommendation[]> => {
    try {
      const response = await api.get<FlowRecommendation[]>('/api/v1/bienimed-analytics/flow-recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching flow recommendations:', error);
      throw error;
    }
  },

  /**
   * Formatear número para mostrar en UI
   */
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  /**
   * Formatear moneda para mostrar en UI
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  /**
   * Formatear fecha para mostrar en UI
   */
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};



