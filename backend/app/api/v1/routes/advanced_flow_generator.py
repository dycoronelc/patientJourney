"""
Rutas para generación avanzada de flujos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.advanced_flow_generator_service import AdvancedFlowGeneratorService

router = APIRouter()

@router.post("/generate-comprehensive-flows")
def generate_comprehensive_flows():
    """Generar un conjunto completo de flujos basados en datos reales de Bienimed"""
    try:
        service = AdvancedFlowGeneratorService()
        generated_flows = service.generate_comprehensive_flows()
        return {
            "message": f"Se generaron {len(generated_flows)} flujos exitosamente",
            "flows": generated_flows,
            "total_generated": len(generated_flows)
        }
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar flujos completos: {str(e)}")

@router.get("/flow-types")
def get_flow_types():
    """Obtener tipos de flujos disponibles para generación"""
    return {
        "available_types": [
            "diagnosis_based",
            "procedure_based", 
            "referral_based",
            "laboratory_based",
            "imaging_based",
            "emergency_based"
        ],
        "description": "Tipos de flujos que se pueden generar basados en datos de Bienimed"
    }
