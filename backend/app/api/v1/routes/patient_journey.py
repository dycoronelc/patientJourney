"""
Rutas para flujos de pacientes (Patient Journey)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import structlog

from app.core.database import get_db
from app.schemas.patient_journey import (
    PatientJourneyCreate,
    PatientJourneyUpdate,
    PatientJourneyResponse,
    PatientJourneyDetailResponse
)
from app.services.patient_journey_service import PatientJourneyService

logger = structlog.get_logger()
router = APIRouter()

# ==================== PATIENT JOURNEY ====================

@router.get("/journeys", response_model=List[PatientJourneyResponse])
async def get_patient_journeys(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[str] = Query(None),
    center_id: Optional[str] = Query(None),
    specialty_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de recorridos de pacientes"""
    try:
        journeys = await PatientJourneyService.get_all(
            db=db,
            skip=skip,
            limit=limit,
            patient_id=patient_id,
            center_id=center_id,
            specialty_id=specialty_id,
            status=status
        )
        return journeys
    except Exception as e:
        logger.error("Error getting patient journeys", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/journeys/{journey_id}", response_model=PatientJourneyDetailResponse)
async def get_patient_journey(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener detalle completo de un recorrido de paciente"""
    try:
        journey = await PatientJourneyService.get_by_id_with_details(db=db, journey_id=journey_id)
        if not journey:
            raise HTTPException(status_code=404, detail="Recorrido de paciente no encontrado")
        return journey
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting patient journey", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/journeys", response_model=PatientJourneyResponse)
async def create_patient_journey(
    journey: PatientJourneyCreate,
    db: Session = Depends(get_db)
):
    """Crear nuevo recorrido de paciente"""
    try:
        new_journey = await PatientJourneyService.create(db=db, journey=journey)
        return new_journey
    except Exception as e:
        logger.error("Error creating patient journey", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.put("/journeys/{journey_id}", response_model=PatientJourneyResponse)
async def update_patient_journey(
    journey_id: str,
    journey: PatientJourneyUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar recorrido de paciente"""
    try:
        updated_journey = await PatientJourneyService.update(
            db=db,
            journey_id=journey_id,
            journey=journey
        )
        if not updated_journey:
            raise HTTPException(status_code=404, detail="Recorrido de paciente no encontrado")
        return updated_journey
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating patient journey", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== ÓRDENES DE LABORATORIO ====================

@router.get("/journeys/{journey_id}/laboratory-orders")
async def get_laboratory_orders(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener órdenes de laboratorio de un recorrido"""
    try:
        orders = await PatientJourneyService.get_laboratory_orders(db=db, journey_id=journey_id)
        return orders
    except Exception as e:
        logger.error("Error getting laboratory orders", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/journeys/{journey_id}/sync-laboratory-orders")
async def sync_laboratory_orders(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Sincronizar órdenes de laboratorio desde sistema externo"""
    try:
        result = await PatientJourneyService.sync_laboratory_orders(db=db, journey_id=journey_id)
        return result
    except Exception as e:
        logger.error("Error syncing laboratory orders", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== ÓRDENES DE IMÁGENES ====================

@router.get("/journeys/{journey_id}/imaging-orders")
async def get_imaging_orders(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener órdenes de imágenes de un recorrido"""
    try:
        orders = await PatientJourneyService.get_imaging_orders(db=db, journey_id=journey_id)
        return orders
    except Exception as e:
        logger.error("Error getting imaging orders", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/journeys/{journey_id}/sync-imaging-orders")
async def sync_imaging_orders(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Sincronizar órdenes de imágenes desde sistema externo"""
    try:
        result = await PatientJourneyService.sync_imaging_orders(db=db, journey_id=journey_id)
        return result
    except Exception as e:
        logger.error("Error syncing imaging orders", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== REFERENCIAS ====================

@router.get("/journeys/{journey_id}/referrals")
async def get_referrals(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener referencias de un recorrido"""
    try:
        referrals = await PatientJourneyService.get_referrals(db=db, journey_id=journey_id)
        return referrals
    except Exception as e:
        logger.error("Error getting referrals", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/journeys/{journey_id}/sync-referrals")
async def sync_referrals(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Sincronizar referencias desde sistema externo"""
    try:
        result = await PatientJourneyService.sync_referrals(db=db, journey_id=journey_id)
        return result
    except Exception as e:
        logger.error("Error syncing referrals", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== FLUJO VISUAL ====================

@router.get("/journeys/{journey_id}/flow-diagram")
async def get_flow_diagram(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener datos para diagrama de flujo del paciente"""
    try:
        diagram = await PatientJourneyService.get_flow_diagram(db=db, journey_id=journey_id)
        return diagram
    except Exception as e:
        logger.error("Error getting flow diagram", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/journeys/{journey_id}/timeline")
async def get_journey_timeline(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener timeline completo del recorrido del paciente"""
    try:
        timeline = await PatientJourneyService.get_timeline(db=db, journey_id=journey_id)
        return timeline
    except Exception as e:
        logger.error("Error getting journey timeline", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== COSTOS DEL JOURNEY ====================

@router.get("/journeys/{journey_id}/cost-summary")
async def get_journey_cost_summary(
    journey_id: str,
    db: Session = Depends(get_db)
):
    """Obtener resumen de costos de un recorrido"""
    try:
        summary = await PatientJourneyService.get_cost_summary(db=db, journey_id=journey_id)
        return summary
    except Exception as e:
        logger.error("Error getting journey cost summary", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")










