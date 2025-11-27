"""
Rutas para sincronización de pasos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.services.step_sync_service import StepSyncService

router = APIRouter()

@router.post("/sync-steps-from-flows")
def sync_steps_from_flows():
    """Sincronizar pasos del maestro basándose en los flujos existentes"""
    try:
        service = StepSyncService()
        result = service.sync_steps_from_flows()
        
        return result
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al sincronizar pasos: {str(e)}")

@router.post("/create-diagnosis-steps")
def create_diagnosis_steps():
    """Crear pasos específicos para diagnósticos CIE-10"""
    try:
        service = StepSyncService()
        
        # Obtener diagnósticos activos
        from app.services.unique_flow_generator_service import UniqueFlowGeneratorService
        flow_generator = UniqueFlowGeneratorService()
        active_diagnoses = flow_generator.catalog_service.get_active_diagnoses(limit=20)
        
        result = service.create_diagnosis_specific_steps(active_diagnoses)
        
        return result
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al crear pasos de diagnósticos: {str(e)}")

@router.get("/step-sync-status")
def get_step_sync_status():
    """Obtener estado de sincronización de pasos"""
    try:
        # Obtener todos los pasos
        from app.services.step_service import StepService
        from app.core.database import create_db_session
        
        db = create_db_session()
        step_service = StepService(db)
        steps = step_service.get_steps()
        
        # Obtener todos los flujos
        from app.services.patient_flow_service import PatientFlowService
        flow_service = PatientFlowService(db)
        flows = flow_service.get_flows(is_active=True)
        
        # Analizar pasos por categoría
        steps_by_category = {}
        for step in steps:
            category = step.category or 'Sin categoría'
            if category not in steps_by_category:
                steps_by_category[category] = 0
            steps_by_category[category] += 1
        
        # Analizar tipos de pasos en flujos
        flow_step_types = {}
        for flow in flows:
            if flow.flow_steps:
                for node in flow.flow_steps:
                    step_type = node.get('type', 'unknown')
                    if step_type not in flow_step_types:
                        flow_step_types[step_type] = 0
                    flow_step_types[step_type] += 1
        
        db.close()
        
        return {
            "total_steps": len(steps),
            "total_flows": len(flows),
            "steps_by_category": steps_by_category,
            "flow_step_types": flow_step_types,
            "sync_needed": len(flow_step_types) > len(steps_by_category)
        }
        
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estado de sincronización: {str(e)}")
