"""
Rutas para consultar procedimientos de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_bienimed_db
from ..services.procedure_service import ProcedureService
from ..schemas.procedure import ProcedureResponse, ProcedureListResponse

router = APIRouter()

@router.get("/", response_model=ProcedureListResponse)
def get_procedures(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None, description="Filtrar por paciente"),
    consulta_id: Optional[int] = Query(None, description="Filtrar por consulta"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de procedimientos de Bienimed"""
    try:
        service = ProcedureService(db)
        procedures = service.get_procedures(skip=skip, limit=limit, patient_id=patient_id, consulta_id=consulta_id)
        total = service.count_procedures(patient_id=patient_id)
        
        return ProcedureListResponse(
            procedures=[procedure.to_dict() for procedure in procedures],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar procedimientos: {str(e)}")
    finally:
        service.close()

@router.get("/{procedure_id}", response_model=ProcedureResponse)
def get_procedure(procedure_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener un procedimiento específico por ID"""
    try:
        service = ProcedureService(db)
        procedure = service.get_procedure_by_id(procedure_id)
        
        if not procedure:
            raise HTTPException(status_code=404, detail="Procedimiento no encontrado")
        
        return procedure.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar procedimiento: {str(e)}")
    finally:
        service.close()

@router.get("/patient/{patient_id}", response_model=ProcedureListResponse)
def get_patient_procedures(patient_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener procedimientos de un paciente"""
    try:
        service = ProcedureService(db)
        procedures = service.get_patient_procedures(patient_id)
        
        return ProcedureListResponse(
            procedures=[procedure.to_dict() for procedure in procedures],
            total=len(procedures),
            page=1,
            per_page=len(procedures)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar procedimientos del paciente: {str(e)}")
    finally:
        service.close()



