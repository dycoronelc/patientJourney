"""
Rutas para consultar diagnósticos de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_bienimed_db
from ..services.diagnosis_service import DiagnosisService
from ..schemas.diagnosis import DiagnosisResponse, DiagnosisListResponse

router = APIRouter()

@router.get("/", response_model=DiagnosisListResponse)
def get_diagnoses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None, description="Filtrar por paciente"),
    consulta_id: Optional[int] = Query(None, description="Filtrar por consulta"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de diagnósticos de Bienimed"""
    try:
        service = DiagnosisService(db)
        diagnoses = service.get_diagnoses(skip=skip, limit=limit, patient_id=patient_id, consulta_id=consulta_id)
        total = service.count_diagnoses(patient_id=patient_id)
        
        return DiagnosisListResponse(
            diagnoses=[diagnosis.to_dict() for diagnosis in diagnoses],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar diagnósticos: {str(e)}")
    finally:
        service.close()

@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
def get_diagnosis(diagnosis_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener un diagnóstico específico por ID"""
    try:
        service = DiagnosisService(db)
        diagnosis = service.get_diagnosis_by_id(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
        
        return diagnosis.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar diagnóstico: {str(e)}")
    finally:
        service.close()

@router.get("/patient/{patient_id}", response_model=DiagnosisListResponse)
def get_patient_diagnoses(patient_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener diagnósticos de un paciente"""
    try:
        service = DiagnosisService(db)
        diagnoses = service.get_patient_diagnoses(patient_id)
        
        return DiagnosisListResponse(
            diagnoses=[diagnosis.to_dict() for diagnosis in diagnoses],
            total=len(diagnoses),
            page=1,
            per_page=len(diagnoses)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar diagnósticos del paciente: {str(e)}")
    finally:
        service.close()



