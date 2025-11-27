"""
Rutas para generación automática de flujos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.flow_generator_service import FlowGeneratorService

router = APIRouter()

@router.post("/generate-from-bienimed", response_model=List[Dict[str, Any]])
def generate_flows_from_bienimed():
    """Generar flujos automáticamente basados en datos de Bienimed"""
    try:
        service = FlowGeneratorService()
        generated_flows = service.generate_flows_from_bienimed_data()
        return generated_flows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar flujos: {str(e)}")

@router.post("/generate-specialty-flows", response_model=List[Dict[str, Any]])
def generate_specialty_flows():
    """Generar flujos específicos por especialidad"""
    try:
        service = FlowGeneratorService()
        generated_flows = service.generate_specialty_flows()
        return generated_flows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar flujos por especialidad: {str(e)}")



