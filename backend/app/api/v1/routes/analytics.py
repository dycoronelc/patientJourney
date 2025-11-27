"""
Rutas de analítica y predicciones
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..models.analytics import (
    DemandPrediction, TrendAnalysis, ResourceOptimization,
    AnalyticsReport, AnalyticsRequest, TimePeriod
)
from ..services.analytics_service import AnalyticsService
from app.core.database import get_db

router = APIRouter()

@router.get("/demand-predictions")
async def get_demand_predictions(
    specialty_ids: Optional[List[str]] = Query(None, description="IDs de especialidades a analizar"),
    prediction_horizon: int = Query(30, description="Días hacia adelante para predicción"),
    db: Session = Depends(get_db)
):
    """Obtener predicciones de demanda por especialidad usando datos reales"""
    try:
        service = AnalyticsService(db)
        predictions = await service.get_demand_predictions(specialty_ids, prediction_horizon)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando predicciones: {str(e)}")

@router.get("/trend-analysis")
async def get_trend_analysis(
    specialty_ids: Optional[List[str]] = Query(None, description="IDs de especialidades a analizar"),
    time_period: TimePeriod = Query(TimePeriod.MONTHLY, description="Período de análisis"),
    db: Session = Depends(get_db)
):
    """Obtener análisis de tendencias usando datos reales"""
    try:
        service = AnalyticsService(db)
        trends = await service.get_trend_analysis(specialty_ids, time_period)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando tendencias: {str(e)}")

@router.get("/resource-optimization")
async def get_resource_optimization(
    specialty_ids: Optional[List[int]] = Query(None, description="IDs de especialidades a analizar"),
    db: Session = Depends(get_db)
):
    """Obtener recomendaciones de optimización de recursos"""
    try:
        # Datos simulados para desarrollo
        optimizations = [
            {
                "specialty_id": 1,
                "specialty_name": "Medicina General",
                "resource_type": "Personal Médico",
                "current_utilization": 0.85,
                "optimal_utilization": 0.90,
                "recommendations": [
                    "Aumentar personal médico en horarios pico",
                    "Implementar turnos rotativos para cubrir demanda",
                    "Capacitar personal en atención eficiente"
                ],
                "potential_savings": 5000.0,
                "implementation_priority": "high"
            },
            {
                "specialty_id": 2,
                "specialty_name": "Cardiología",
                "resource_type": "Equipos de Diagnóstico",
                "current_utilization": 0.75,
                "optimal_utilization": 0.85,
                "recommendations": [
                    "Optimizar uso de equipos de diagnóstico",
                    "Programar mantenimiento preventivo",
                    "Mejorar flujo de pacientes"
                ],
                "potential_savings": 3000.0,
                "implementation_priority": "medium"
            },
            {
                "specialty_id": 3,
                "specialty_name": "Ginecología",
                "resource_type": "Consultorios",
                "current_utilization": 0.60,
                "optimal_utilization": 0.80,
                "recommendations": [
                    "Reorganizar horarios de consulta",
                    "Implementar consultas grupales",
                    "Optimizar espacio físico"
                ],
                "potential_savings": 2000.0,
                "implementation_priority": "low"
            }
        ]
        return optimizations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando optimizaciones: {str(e)}")

@router.post("/generate-report", response_model=AnalyticsReport)
async def generate_analytics_report(
    request: AnalyticsRequest,
    db: Session = Depends(get_db)
):
    """Generar reporte completo de analítica"""
    try:
        service = AnalyticsService(db)
        report = await service.generate_analytics_report(request)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

@router.get("/dashboard-metrics")
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Obtener métricas del dashboard de analítica usando datos reales"""
    try:
        service = AnalyticsService(db)
        metrics = await service.get_dashboard_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo métricas: {str(e)}")

@router.get("/test")
async def test_analytics():
    """Endpoint de prueba para analítica"""
    return {"message": "Analytics module working", "timestamp": datetime.now().isoformat()}



