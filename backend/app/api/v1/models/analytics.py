"""
Modelos de datos para analítica
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

class TimePeriod(str, Enum):
    """Períodos de tiempo para análisis"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class PredictionType(str, Enum):
    """Tipos de predicciones"""
    DEMAND = "demand"
    RESOURCE_UTILIZATION = "resource_utilization"
    PATIENT_FLOW = "patient_flow"
    COST_OPTIMIZATION = "cost_optimization"

class TrendDirection(str, Enum):
    """Dirección de tendencias"""
    INCREASING = "increasing"
    DECREASING = "decreasing"
    STABLE = "stable"
    VOLATILE = "volatile"

class DemandPrediction(BaseModel):
    """Predicción de demanda"""
    specialty_id: int
    specialty_name: str
    predicted_demand: int
    confidence_level: float  # 0-1
    prediction_date: date
    time_period: TimePeriod
    factors: Dict[str, Any]  # Factores que influyen en la predicción

class TrendAnalysis(BaseModel):
    """Análisis de tendencias"""
    metric_name: str
    current_value: float
    previous_value: float
    change_percentage: float
    trend_direction: TrendDirection
    trend_strength: float  # 0-1
    analysis_period: TimePeriod
    data_points: List[Dict[str, Any]]

class ResourceOptimization(BaseModel):
    """Optimización de recursos"""
    resource_type: str
    current_utilization: float
    optimal_utilization: float
    recommendations: List[str]
    potential_savings: float
    implementation_priority: str  # high, medium, low

class AnalyticsReport(BaseModel):
    """Reporte de analítica"""
    report_id: str
    report_type: str
    generated_at: datetime
    period_start: date
    period_end: date
    summary: Dict[str, Any]
    predictions: List[DemandPrediction]
    trends: List[TrendAnalysis]
    optimizations: List[ResourceOptimization]
    insights: List[str]

class AnalyticsRequest(BaseModel):
    """Request para análisis"""
    specialty_ids: Optional[List[int]] = None
    time_period: TimePeriod = TimePeriod.MONTHLY
    prediction_horizon: int = 30  # días
    include_trends: bool = True
    include_optimization: bool = True

