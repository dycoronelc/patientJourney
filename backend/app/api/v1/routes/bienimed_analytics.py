"""
Rutas para Analytics de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.services.bienimed_analytics_service import BienimedAnalyticsService

router = APIRouter()

@router.get("/dashboard-stats", response_model=Dict[str, Any])
def get_dashboard_stats():
    """Obtener estadísticas para el dashboard"""
    try:
        service = BienimedAnalyticsService()
        stats = service.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")

@router.get("/patient-flow-analytics", response_model=Dict[str, Any])
def get_patient_flow_analytics():
    """Obtener análisis de flujos de pacientes"""
    try:
        service = BienimedAnalyticsService()
        analytics = service.get_patient_flow_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener análisis de flujos: {str(e)}")

@router.get("/revenue-analytics", response_model=Dict[str, Any])
def get_revenue_analytics():
    """Obtener análisis de facturación"""
    try:
        service = BienimedAnalyticsService()
        analytics = service.get_revenue_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener análisis de facturación: {str(e)}")

@router.get("/doctor-performance", response_model=Dict[str, Any])
def get_doctor_performance():
    """Obtener rendimiento de doctores"""
    try:
        service = BienimedAnalyticsService()
        performance = service.get_doctor_performance()
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener rendimiento de doctores: {str(e)}")

@router.get("/flow-recommendations", response_model=List[Dict[str, Any]])
def get_flow_recommendations():
    """Obtener recomendaciones de flujos basadas en datos reales"""
    try:
        service = BienimedAnalyticsService()
        recommendations = service.generate_flow_recommendations()
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar recomendaciones: {str(e)}")



