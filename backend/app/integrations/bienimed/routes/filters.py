"""
Rutas para filtros de BieniMedico
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.integrations.bienimed.database import get_bienimed_db
from app.integrations.bienimed.services.filter_service import BienimedFilterService
from app.integrations.bienimed.schemas.filter import ClienteCorporativoResponse, AreaResponse, UsuarioResponse

router = APIRouter()

@router.get("/clientes", response_model=List[ClienteCorporativoResponse])
def get_clientes_corporativos(
    idcliente: int = Query(1, description="ID del cliente"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener clientes corporativos activos"""
    try:
        service = BienimedFilterService(db)
        clientes = service.get_clientes_corporativos(idcliente=idcliente)
        return [cliente.to_dict() for cliente in clientes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo clientes: {str(e)}")

@router.get("/clientes/{cliente_id}", response_model=ClienteCorporativoResponse)
def get_cliente(cliente_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener cliente por ID"""
    try:
        service = BienimedFilterService(db)
        cliente = service.get_cliente_by_id(cliente_id)
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return cliente.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo cliente: {str(e)}")

@router.get("/areas", response_model=List[AreaResponse])
def get_areas(
    idcentro: int = Query(1, description="ID del centro"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener áreas médicas activas"""
    try:
        service = BienimedFilterService(db)
        areas = service.get_areas(idcentro=idcentro)
        return [area.to_dict() for area in areas]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo áreas: {str(e)}")

@router.get("/areas/{area_id}", response_model=AreaResponse)
def get_area(area_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener área por ID"""
    try:
        service = BienimedFilterService(db)
        area = service.get_area_by_id(area_id)
        if not area:
            raise HTTPException(status_code=404, detail="Área no encontrada")
        return area.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo área: {str(e)}")

@router.get("/doctores", response_model=List[UsuarioResponse])
def get_doctores(
    idcentro: int = Query(1, description="ID del centro"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener doctores activos del centro"""
    try:
        service = BienimedFilterService(db)
        doctores = service.get_doctores(idcentro=idcentro)
        return [doctor.to_dict() for doctor in doctores]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo doctores: {str(e)}")

@router.get("/doctores/{doctor_id}", response_model=UsuarioResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener doctor por ID"""
    try:
        service = BienimedFilterService(db)
        doctor = service.get_doctor_by_id(doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor no encontrado")
        return doctor.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo doctor: {str(e)}")
