"""
Rutas API para flujos médicos normalizados
Proporciona endpoints para acceder a los 20 flujos médicos completos
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.medical_flow_service import MedicalFlowService
import structlog

logger = structlog.get_logger()
router = APIRouter()

@router.get("/specialties", summary="Obtener todas las especialidades médicas")
async def get_specialties(db: Session = Depends(get_db)):
    """Obtener todas las especialidades médicas disponibles"""
    try:
        service = MedicalFlowService(db)
        specialties = service.get_specialties()
        
        return {
            "success": True,
            "data": specialties,
            "count": len(specialties)
        }
    except Exception as e:
        logger.error(f"Error obteniendo especialidades: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/specialties/{specialty_id}", summary="Obtener especialidad por ID")
async def get_specialty(specialty_id: str, db: Session = Depends(get_db)):
    """Obtener una especialidad médica específica"""
    try:
        service = MedicalFlowService(db)
        specialty = service.get_specialty_by_id(specialty_id)
        
        if not specialty:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        
        return {
            "success": True,
            "data": specialty
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo especialidad {specialty_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/flows", summary="Obtener todos los flujos médicos")
async def get_flows(
    specialty_id: Optional[str] = Query(None, description="Filtrar por especialidad"),
    min_duration: Optional[int] = Query(None, description="Duración mínima en minutos"),
    max_duration: Optional[int] = Query(None, description="Duración máxima en minutos"),
    min_cost: Optional[float] = Query(None, description="Costo mínimo"),
    max_cost: Optional[float] = Query(None, description="Costo máximo"),
    search: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    db: Session = Depends(get_db)
):
    """Obtener flujos médicos con filtros opcionales"""
    try:
        service = MedicalFlowService(db)
        
        if search:
            flows = service.search_flows(search)
        elif specialty_id:
            flows = service.get_flows_by_specialty(specialty_id)
        elif min_duration is not None and max_duration is not None:
            flows = service.get_flows_by_duration_range(min_duration, max_duration)
        elif min_cost is not None and max_cost is not None:
            flows = service.get_flows_by_cost_range(min_cost, max_cost)
        else:
            flows = service.get_all_flows()
        
        return {
            "success": True,
            "data": flows,
            "count": len(flows),
            "filters": {
                "specialty_id": specialty_id,
                "min_duration": min_duration,
                "max_duration": max_duration,
                "min_cost": min_cost,
                "max_cost": max_cost,
                "search": search
            }
        }
    except Exception as e:
        logger.error(f"Error obteniendo flujos: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/flows/{flow_id}", summary="Obtener flujo médico completo")
async def get_flow(flow_id: str, db: Session = Depends(get_db)):
    """Obtener un flujo médico completo con nodos y conexiones"""
    try:
        service = MedicalFlowService(db)
        flow = service.get_flow_by_id(flow_id)
        
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return {
            "success": True,
            "data": flow
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo flujo {flow_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/step-types", summary="Obtener tipos de pasos")
async def get_step_types(db: Session = Depends(get_db)):
    """Obtener todos los tipos de pasos médicos"""
    try:
        service = MedicalFlowService(db)
        step_types = service.get_step_types()
        
        return {
            "success": True,
            "data": step_types,
            "count": len(step_types)
        }
    except Exception as e:
        logger.error(f"Error obteniendo tipos de pasos: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/urgency-levels", summary="Obtener niveles de urgencia")
async def get_urgency_levels(db: Session = Depends(get_db)):
    """Obtener todos los niveles de urgencia"""
    try:
        service = MedicalFlowService(db)
        urgency_levels = service.get_urgency_levels()
        
        return {
            "success": True,
            "data": urgency_levels,
            "count": len(urgency_levels)
        }
    except Exception as e:
        logger.error(f"Error obteniendo niveles de urgencia: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/referral-criteria", summary="Obtener criterios de referencia")
async def get_referral_criteria(
    specialty_id: Optional[str] = Query(None, description="Filtrar por especialidad"),
    db: Session = Depends(get_db)
):
    """Obtener criterios de referencia entre especialidades"""
    try:
        service = MedicalFlowService(db)
        
        if specialty_id:
            criteria = service.get_referral_criteria_by_specialty(specialty_id)
        else:
            criteria = service.get_referral_criteria()
        
        return {
            "success": True,
            "data": criteria,
            "count": len(criteria),
            "filters": {
                "specialty_id": specialty_id
            }
        }
    except Exception as e:
        logger.error(f"Error obteniendo criterios de referencia: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/statistics", summary="Obtener estadísticas de flujos")
async def get_flow_statistics(db: Session = Depends(get_db)):
    """Obtener estadísticas generales de los flujos médicos"""
    try:
        service = MedicalFlowService(db)
        stats = service.get_flow_statistics()
        
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/flows/{flow_id}/nodes", summary="Obtener nodos de un flujo")
async def get_flow_nodes(flow_id: str, db: Session = Depends(get_db)):
    """Obtener todos los nodos de un flujo específico"""
    try:
        service = MedicalFlowService(db)
        flow = service.get_flow_by_id(flow_id)
        
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return {
            "success": True,
            "data": flow.get('nodes', []),
            "count": len(flow.get('nodes', [])),
            "flow_id": flow_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo nodos del flujo {flow_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/flows/{flow_id}/edges", summary="Obtener conexiones de un flujo")
async def get_flow_edges(flow_id: str, db: Session = Depends(get_db)):
    """Obtener todas las conexiones de un flujo específico"""
    try:
        service = MedicalFlowService(db)
        flow = service.get_flow_by_id(flow_id)
        
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return {
            "success": True,
            "data": flow.get('edges', []),
            "count": len(flow.get('edges', [])),
            "flow_id": flow_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo conexiones del flujo {flow_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

