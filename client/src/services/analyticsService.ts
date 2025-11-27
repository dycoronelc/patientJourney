/**
 * Servicio para analítica y predicciones
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DemandPrediction {
  specialty_id: number;
  specialty_name: string;
  predicted_demand: number;
  confidence_level: number;
  prediction_date: string;
  time_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  factors: Record<string, any>;
}

export interface TrendAnalysis {
  specialty_id?: string | number;
  specialty_name?: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  trend_strength: number;
  data_points?: number | Array<{ period: string; value: number }>;
  analysis_date?: string;
  analysis_period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface ResourceOptimization {
  specialty_id?: string | number;
  specialty_name?: string;
  resource_type: string;
  current_utilization: number;
  optimal_utilization: number;
  recommendations: string[];
  potential_savings: number;
  implementation_priority: 'high' | 'medium' | 'low';
  flow_count?: number;
  avg_duration?: number;
  avg_cost?: number;
  total_steps?: number;
  analysis_date?: string;
}

export interface AnalyticsReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  summary: Record<string, any>;
  predictions: DemandPrediction[];
  trends: TrendAnalysis[];
  optimizations: ResourceOptimization[];
  insights: string[];
}

export interface AnalyticsRequest {
  specialty_ids?: number[];
  time_period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  prediction_horizon?: number;
  include_trends?: boolean;
  include_optimization?: boolean;
}

export interface DashboardMetrics {
  total_specialties: number;
  average_confidence: number;
  high_priority_optimizations: number;
  increasing_trends: number;
  total_predictions: number;
  total_trends: number;
  total_optimizations: number;
  last_updated: string;
}

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/api/v1/analytics`;
  }

  /**
   * Obtener predicciones de demanda
   */
  async getDemandPredictions(
    specialtyIds?: number[],
    predictionHorizon: number = 30
  ): Promise<DemandPrediction[]> {
    const params = new URLSearchParams();
    if (specialtyIds && specialtyIds.length > 0) {
      specialtyIds.forEach(id => params.append('specialty_ids', id.toString()));
    }
    params.append('prediction_horizon', predictionHorizon.toString());

    const response = await fetch(`${this.baseUrl}/demand-predictions?${params}`);
    if (!response.ok) {
      throw new Error(`Error obteniendo predicciones: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Obtener análisis de tendencias
   */
  async getTrendAnalysis(
    specialtyIds?: number[],
    timePeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<TrendAnalysis[]> {
    const params = new URLSearchParams();
    if (specialtyIds && specialtyIds.length > 0) {
      specialtyIds.forEach(id => params.append('specialty_ids', id.toString()));
    }
    params.append('time_period', timePeriod);

    const response = await fetch(`${this.baseUrl}/trend-analysis?${params}`);
    if (!response.ok) {
      throw new Error(`Error obteniendo tendencias: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Obtener optimizaciones de recursos
   */
  async getResourceOptimization(specialtyIds?: number[]): Promise<ResourceOptimization[]> {
    const params = new URLSearchParams();
    if (specialtyIds && specialtyIds.length > 0) {
      specialtyIds.forEach(id => params.append('specialty_ids', id.toString()));
    }

    const response = await fetch(`${this.baseUrl}/resource-optimization?${params}`);
    if (!response.ok) {
      throw new Error(`Error obteniendo optimizaciones: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Generar reporte completo de analítica
   */
  async generateAnalyticsReport(request: AnalyticsRequest): Promise<AnalyticsReport> {
    const response = await fetch(`${this.baseUrl}/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error generando reporte: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Obtener métricas para el dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${this.baseUrl}/dashboard-metrics`);
    if (!response.ok) {
      throw new Error(`Error obteniendo métricas: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Probar conexión con el servicio
   */
  async testConnection(): Promise<{ message: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/test`);
    if (!response.ok) {
      throw new Error(`Error probando conexión: ${response.statusText}`);
    }
    return response.json();
  }
}

export const analyticsService = new AnalyticsService();