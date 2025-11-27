"""
Rutas de configuración
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import structlog

from app.core.database import get_db
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate, SpecialtyResponse
from app.schemas.health_center import HealthCenterCreate, HealthCenterUpdate, HealthCenterResponse
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from app.schemas.patient_flow import PatientFlowCreate, PatientFlowUpdate, PatientFlowResponse
from app.services.specialty_service import SpecialtyService
from app.services.health_center_service import HealthCenterService
from app.services.resource_service import ResourceService
from app.services.patient_flow_service import PatientFlowService

logger = structlog.get_logger()
router = APIRouter()

# ==================== ESPECIALIDADES ====================

@router.get("/specialties", response_model=List[SpecialtyResponse])
async def get_specialties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de especialidades"""
    try:
        specialties = await SpecialtyService.get_all(
            db=db,
            skip=skip,
            limit=limit,
            search=search
        )
        return specialties
    except Exception as e:
        logger.error("Error getting specialties", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/specialties/{specialty_id}", response_model=SpecialtyResponse)
async def get_specialty(
    specialty_id: str,
    db: Session = Depends(get_db)
):
    """Obtener especialidad por ID"""
    try:
        specialty = await SpecialtyService.get_by_id(db=db, specialty_id=specialty_id)
        if not specialty:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return specialty
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting specialty", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/specialties", response_model=SpecialtyResponse)
async def create_specialty(
    specialty: SpecialtyCreate,
    db: Session = Depends(get_db)
):
    """Crear nueva especialidad"""
    try:
        new_specialty = await SpecialtyService.create(db=db, specialty=specialty)
        return new_specialty
    except Exception as e:
        logger.error("Error creating specialty", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.put("/specialties/{specialty_id}", response_model=SpecialtyResponse)
async def update_specialty(
    specialty_id: str,
    specialty: SpecialtyUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar especialidad"""
    try:
        updated_specialty = await SpecialtyService.update(
            db=db,
            specialty_id=specialty_id,
            specialty=specialty
        )
        if not updated_specialty:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return updated_specialty
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating specialty", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.delete("/specialties/{specialty_id}")
async def delete_specialty(
    specialty_id: str,
    db: Session = Depends(get_db)
):
    """Eliminar especialidad"""
    try:
        success = await SpecialtyService.delete(db=db, specialty_id=specialty_id)
        if not success:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return {"message": "Especialidad eliminada exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error deleting specialty", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== CENTROS DE SALUD ====================

@router.get("/centers", response_model=List[HealthCenterResponse])
async def get_health_centers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    center_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de centros de salud"""
    try:
        centers = await HealthCenterService.get_all(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            center_type=center_type
        )
        return centers
    except Exception as e:
        logger.error("Error getting health centers", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/centers/{center_id}", response_model=HealthCenterResponse)
async def get_health_center(
    center_id: str,
    db: Session = Depends(get_db)
):
    """Obtener centro de salud por ID"""
    try:
        center = await HealthCenterService.get_by_id(db=db, center_id=center_id)
        if not center:
            raise HTTPException(status_code=404, detail="Centro de salud no encontrado")
        return center
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting health center", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/centers", response_model=HealthCenterResponse)
async def create_health_center(
    center: HealthCenterCreate,
    db: Session = Depends(get_db)
):
    """Crear nuevo centro de salud"""
    try:
        new_center = await HealthCenterService.create(db=db, center=center)
        return new_center
    except Exception as e:
        logger.error("Error creating health center", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.put("/centers/{center_id}", response_model=HealthCenterResponse)
async def update_health_center(
    center_id: str,
    center: HealthCenterUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar centro de salud"""
    try:
        updated_center = await HealthCenterService.update(
            db=db,
            center_id=center_id,
            center=center
        )
        if not updated_center:
            raise HTTPException(status_code=404, detail="Centro de salud no encontrado")
        return updated_center
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating health center", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.delete("/centers/{center_id}")
async def delete_health_center(
    center_id: str,
    db: Session = Depends(get_db)
):
    """Eliminar centro de salud"""
    try:
        success = await HealthCenterService.delete(db=db, center_id=center_id)
        if not success:
            raise HTTPException(status_code=404, detail="Centro de salud no encontrado")
        return {"message": "Centro de salud eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error deleting health center", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== RECURSOS ====================

@router.get("/resources", response_model=List[ResourceResponse])
async def get_resources(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    resource_type: Optional[str] = Query(None),
    center_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de recursos"""
    try:
        resources = await ResourceService.get_all(
            db=db,
            skip=skip,
            limit=limit,
            resource_type=resource_type,
            center_id=center_id
        )
        return resources
    except Exception as e:
        logger.error("Error getting resources", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/resources", response_model=ResourceResponse)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db)
):
    """Crear nuevo recurso"""
    try:
        new_resource = await ResourceService.create(db=db, resource=resource)
        return new_resource
    except Exception as e:
        logger.error("Error creating resource", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== FLUJOS DE PACIENTES ====================

@router.get("/patient-flows", response_model=List[PatientFlowResponse])
async def get_patient_flows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    specialty_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de flujos de pacientes"""
    try:
        flows = await PatientFlowService.get_all(
            db=db,
            skip=skip,
            limit=limit,
            specialty_id=specialty_id
        )
        return flows
    except Exception as e:
        logger.error("Error getting patient flows", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/patient-flows", response_model=PatientFlowResponse)
async def create_patient_flow(
    flow: PatientFlowCreate,
    db: Session = Depends(get_db)
):
    """Crear nuevo flujo de pacientes"""
    try:
        new_flow = await PatientFlowService.create(db=db, flow=flow)
        return new_flow
    except Exception as e:
        logger.error("Error creating patient flow", error=str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")




