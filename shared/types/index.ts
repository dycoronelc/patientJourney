// Tipos compartidos entre frontend y backend

export interface HealthCenter {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'policlinic' | 'health_center';
  specialties: string[];
  resources: Resource[];
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: {
    beds?: number;
    doctors: number;
    nurses: number;
    equipment: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  commonTests: MedicalTest[];
  typicalMedications: Medication[];
  icd10Codes: string[];
  cptCodes: string[];
  averageConsultationTime: number; // en minutos
  resourceRequirements: ResourceRequirement[];
  patientFlow: PatientFlowStep[];
}

export interface MedicalTest {
  id: string;
  name: string;
  type: 'laboratory' | 'imaging' | 'diagnostic';
  category: string;
  description: string;
  averageDuration: number; // en minutos
  requiredEquipment: string[];
  cost: number;
  frequency: 'routine' | 'as_needed' | 'emergency';
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  cost: number;
  availability: 'common' | 'specialty' | 'rare';
}

export interface ResourceRequirement {
  resourceType: 'doctor' | 'nurse' | 'equipment' | 'room' | 'time';
  quantity: number;
  duration: number; // en minutos
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PatientFlowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredResources: ResourceRequirement[];
  averageDuration: number;
  nextSteps: string[]; // IDs de los siguientes pasos
  conditions?: {
    // Condiciones para seguir este flujo
    ageRange?: { min: number; max: number };
    conditions?: string[];
    testResults?: { [key: string]: any };
  };
}

export interface Resource {
  id: string;
  name: string;
  type: 'doctor' | 'nurse' | 'equipment' | 'room' | 'vehicle';
  category: string;
  description: string;
  availability: 'available' | 'busy' | 'maintenance' | 'unavailable';
  capacity: number;
  currentUtilization: number;
  costPerHour: number;
  location?: string;
  specifications?: { [key: string]: any };
}

export interface PatientInteraction {
  id: string;
  patientId: string;
  centerId: string;
  specialtyId: string;
  interactionType: 'consultation' | 'test' | 'procedure' | 'medication' | 'referral';
  timestamp: Date;
  duration: number; // en minutos
  resources: string[]; // IDs de recursos utilizados
  data: {
    // Datos específicos de la interacción
    testResults?: { [key: string]: any };
    medications?: string[];
    procedures?: string[];
    referrals?: string[];
    notes?: string;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost: number;
}

export interface PredictionRequest {
  centerId: string;
  specialtyIds: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  parameters: {
    patientVolume?: number;
    seasonalFactors?: { [key: string]: number };
    externalFactors?: { [key: string]: any };
  };
}

export interface ResourcePrediction {
  resourceId: string;
  resourceName: string;
  predictedDemand: number;
  confidence: number; // 0-1
  timeSlots: {
    start: Date;
    end: Date;
    demand: number;
  }[];
  recommendations: string[];
  riskFactors: string[];
}

export interface AnalyticsDashboard {
  centerId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalPatients: number;
    averageWaitTime: number;
    resourceUtilization: { [resourceId: string]: number };
    costPerPatient: number;
    patientSatisfaction: number;
  };
  trends: {
    patientVolume: { date: Date; count: number }[];
    resourceUsage: { date: Date; usage: number }[];
    costs: { date: Date; amount: number }[];
  };
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  resourceId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions?: {
    label: string;
    action: string;
  }[];
}

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
      start: Date;
      end: Date;
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

// Tipos para APIs
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para configuración
export interface SystemConfig {
  specialties: Specialty[];
  defaultResources: Resource[];
  patientFlowTemplates: PatientFlowStep[][];
  integrationSettings: {
    laboratory: IntegrationConfig;
    imaging: IntegrationConfig;
    appointments: IntegrationConfig;
    referrals: IntegrationConfig;
  };
  analyticsSettings: {
    predictionModels: string[];
    updateFrequency: number; // en minutos
    alertThresholds: { [key: string]: number };
  };
}

export interface IntegrationConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey?: string;
  syncFrequency: number; // en minutos
  dataMapping: { [key: string]: string };
  filters?: { [key: string]: any };
}
