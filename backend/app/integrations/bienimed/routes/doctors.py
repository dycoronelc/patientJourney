"""
Rutas para consultar doctores de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_bienimed_db
from ..services.doctor_service import DoctorService
from ..schemas.doctor import DoctorResponse, DoctorListResponse

router = APIRouter()

@router.get("/", response_model=DoctorListResponse)
def get_doctors(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    search: Optional[str] = Query(None, description="Buscar por nombre, apellido o email"),
    specialty_id: Optional[int] = Query(None, description="Filtrar por especialidad"),
    active_only: bool = Query(True, description="Solo doctores activos"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de doctores de Bienimed con filtros opcionales"""
    try:
        service = DoctorService(db)
        doctors = service.get_doctors(
            skip=skip, 
            limit=limit, 
            search=search, 
            specialty_id=specialty_id,
            active_only=active_only
        )
        total = service.count_doctors(search=search, specialty_id=specialty_id)
        
        return DoctorListResponse(
            doctors=[doctor.to_dict() for doctor in doctors],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar doctores: {str(e)}")
    finally:
        service.close()

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener un doctor específico por ID"""
    try:
        service = DoctorService(db)
        doctor = service.get_doctor_by_id(doctor_id)
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor no encontrado")
        
        return doctor.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar doctor: {str(e)}")
    finally:
        service.close()

@router.get("/specialty/{specialty_id}", response_model=DoctorListResponse)
def get_doctors_by_specialty(specialty_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener doctores por especialidad"""
    try:
        service = DoctorService(db)
        doctors = service.get_doctors_by_specialty(specialty_id)
        
        return DoctorListResponse(
            doctors=[doctor.to_dict() for doctor in doctors],
            total=len(doctors),
            page=1,
            per_page=len(doctors)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar doctores por especialidad: {str(e)}")
    finally:
        service.close()



