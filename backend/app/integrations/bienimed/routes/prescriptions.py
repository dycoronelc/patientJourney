"""
Rutas para consultar recetas de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_bienimed_db
from ..services.prescription_service import PrescriptionService
from ..schemas.prescription import PrescriptionResponse, PrescriptionListResponse

router = APIRouter()

@router.get("/", response_model=PrescriptionListResponse)
def get_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    diagnostico_id: Optional[int] = Query(None, description="Filtrar por diagnóstico"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de recetas de Bienimed"""
    try:
        service = PrescriptionService(db)
        prescriptions = service.get_prescriptions(skip=skip, limit=limit, diagnostico_id=diagnostico_id)
        total = service.count_prescriptions(diagnostico_id=diagnostico_id)
        
        return PrescriptionListResponse(
            prescriptions=[prescription.to_dict() for prescription in prescriptions],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar recetas: {str(e)}")
    finally:
        service.close()

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(prescription_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener una receta específica por ID"""
    try:
        service = PrescriptionService(db)
        prescription = service.get_prescription_by_id(prescription_id)
        
        if not prescription:
            raise HTTPException(status_code=404, detail="Receta no encontrada")
        
        return prescription.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar receta: {str(e)}")
    finally:
        service.close()

@router.get("/uuid/{uuid}", response_model=PrescriptionResponse)
def get_prescription_by_uuid(uuid: str, db: Session = Depends(get_bienimed_db)):
    """Obtener una receta por UUID"""
    try:
        service = PrescriptionService(db)
        prescription = service.get_prescription_by_uuid(uuid)
        
        if not prescription:
            raise HTTPException(status_code=404, detail="Receta no encontrada")
        
        return prescription.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar receta: {str(e)}")
    finally:
        service.close()



