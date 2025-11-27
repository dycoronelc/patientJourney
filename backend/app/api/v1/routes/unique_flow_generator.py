"""
Rutas para generación de flujos únicos
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.unique_flow_generator_service import UniqueFlowGeneratorService

router = APIRouter()

@router.post("/generate-unique-diagnosis-flows")
def generate_unique_diagnosis_flows(limit: int = Query(10, ge=1, le=50)):
    """Generar flujos únicos basados en diagnósticos reales de CIE-10"""
    try:
        service = UniqueFlowGeneratorService()
        generated_flows = service.generate_unique_diagnosis_flows(limit=limit)
        
        return {
            "message": f"Se generaron {len(generated_flows)} flujos únicos de diagnósticos",
            "flows": generated_flows,
            "total_generated": len(generated_flows)
        }
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar flujos únicos: {str(e)}")

@router.post("/generate-unique-procedure-flows")
def generate_unique_procedure_flows(limit: int = Query(5, ge=1, le=20)):
    """Generar flujos únicos basados en procedimientos reales"""
    try:
        service = UniqueFlowGeneratorService()
        generated_flows = service.generate_unique_procedure_flows(limit=limit)
        
        return {
            "message": f"Se generaron {len(generated_flows)} flujos únicos de procedimientos",
            "flows": generated_flows,
            "total_generated": len(generated_flows)
        }
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar flujos únicos de procedimientos: {str(e)}")

@router.post("/generate-all-unique-flows")
def generate_all_unique_flows(
    diagnosis_limit: int = Query(10, ge=1, le=50),
    procedure_limit: int = Query(5, ge=1, le=20)
):
    """Generar todos los flujos únicos (diagnósticos y procedimientos)"""
    try:
        service = UniqueFlowGeneratorService()
        
        # Generar flujos de diagnósticos
        diagnosis_flows = service.generate_unique_diagnosis_flows(limit=diagnosis_limit)
        
        # Generar flujos de procedimientos
        procedure_flows = service.generate_unique_procedure_flows(limit=procedure_limit)
        
        all_flows = diagnosis_flows + procedure_flows
        
        return {
            "message": f"Se generaron {len(all_flows)} flujos únicos en total",
            "diagnosis_flows": diagnosis_flows,
            "procedure_flows": procedure_flows,
            "total_diagnosis": len(diagnosis_flows),
            "total_procedures": len(procedure_flows),
            "total_generated": len(all_flows)
        }
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar todos los flujos únicos: {str(e)}")

@router.get("/active-diagnoses")
def get_active_diagnoses(limit: int = Query(10, ge=1, le=50)):
    """Obtener diagnósticos activos disponibles para generar flujos"""
    try:
        service = UniqueFlowGeneratorService()
        active_diagnoses = service.catalog_service.get_active_diagnoses(limit=limit)
        
        return {
            "active_diagnoses": active_diagnoses,
            "total": len(active_diagnoses)
        }
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener diagnósticos activos: {str(e)}")
