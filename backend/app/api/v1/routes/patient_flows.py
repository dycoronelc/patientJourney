"""
Rutas para gestión de flujos de pacientes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.patient_flow_service import PatientFlowService
from app.schemas.patient_flow import (
    PatientFlowCreate,
    PatientFlowUpdate,
    PatientFlowResponse
)

router = APIRouter()


@router.get("/", response_model=List[PatientFlowResponse])
def get_flows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    specialty_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de flujos con filtros"""
    try:
        flow_service = PatientFlowService(db)
        flows = flow_service.get_flows(
            skip=skip,
            limit=limit,
            specialty_id=specialty_id,
            is_active=is_active
        )
        
        # Convertir a diccionario
        result = []
        for flow in flows:
            result.append(flow.to_dict())
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener flujos: {str(e)}")


@router.get("/{flow_id}", response_model=PatientFlowResponse)
def get_flow(flow_id: str, db: Session = Depends(get_db)):
    """Obtener un flujo específico por ID"""
    try:
        flow_service = PatientFlowService(db)
        flow = flow_service.get_flow(flow_id)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return flow.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener flujo: {str(e)}")


@router.post("/", response_model=PatientFlowResponse, status_code=201)
def create_flow(flow_data: PatientFlowCreate, db: Session = Depends(get_db)):
    """Crear un nuevo flujo"""
    try:
        flow_service = PatientFlowService(db)
        flow = flow_service.create_flow(flow_data)
        
        return flow.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear flujo: {str(e)}")


@router.put("/{flow_id}", response_model=PatientFlowResponse)
def update_flow(
    flow_id: str,
    flow_data: PatientFlowUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un flujo existente"""
    try:
        flow_service = PatientFlowService(db)
        flow = flow_service.update_flow(flow_id, flow_data)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return flow.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar flujo: {str(e)}")


@router.delete("/{flow_id}", status_code=204)
def delete_flow(flow_id: str, db: Session = Depends(get_db)):
    """Eliminar un flujo"""
    try:
        flow_service = PatientFlowService(db)
        if not flow_service.delete_flow(flow_id):
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar flujo: {str(e)}")


@router.post("/{flow_id}/duplicate", response_model=PatientFlowResponse)
def duplicate_flow(
    flow_id: str,
    new_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Duplicar un flujo existente"""
    try:
        flow_service = PatientFlowService(db)
        flow = flow_service.duplicate_flow(flow_id, new_name)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        return flow.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al duplicar flujo: {str(e)}")









