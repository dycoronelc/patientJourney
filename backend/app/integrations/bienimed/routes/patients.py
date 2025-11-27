"""
Rutas para consultar pacientes de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_bienimed_db
from ..services.patient_service import PatientService
from ..schemas.patient import PatientResponse, PatientListResponse

router = APIRouter()

@router.get("/", response_model=PatientListResponse)
def get_patients(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    search: Optional[str] = Query(None, description="Buscar por nombre, apellido o email"),
    document: Optional[str] = Query(None, description="Buscar por número de documento"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de pacientes de Bienimed con filtros opcionales"""
    try:
        service = PatientService(db)
        patients = service.get_patients(skip=skip, limit=limit, search=search, document=document)
        total = service.count_patients(search=search)
        
        return PatientListResponse(
            patients=[patient.to_dict() for patient in patients],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar pacientes: {str(e)}")
    finally:
        service.close()

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener un paciente específico por ID"""
    try:
        service = PatientService(db)
        patient = service.get_patient_by_id(patient_id)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        return patient.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar paciente: {str(e)}")
    finally:
        service.close()

@router.get("/document/{document}", response_model=PatientResponse)
def get_patient_by_document(document: str, db: Session = Depends(get_bienimed_db)):
    """Obtener un paciente por número de documento"""
    try:
        service = PatientService(db)
        patient = service.get_patient_by_document(document)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        return patient.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar paciente: {str(e)}")
    finally:
        service.close()



