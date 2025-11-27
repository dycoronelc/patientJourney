"""
Rutas para consultar órdenes de imagenología de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_bienimed_db
from ..services.imaging_order_service import ImagingOrderService
from ..schemas.imaging_order import ImagingOrderResponse, ImagingOrderListResponse

router = APIRouter()

@router.get("/", response_model=ImagingOrderListResponse)
def get_imaging_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    diagnostico_id: Optional[int] = Query(None, description="Filtrar por diagnóstico"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de órdenes de imagenología de Bienimed"""
    try:
        service = ImagingOrderService(db)
        orders = service.get_imaging_orders(skip=skip, limit=limit, diagnostico_id=diagnostico_id)
        total = service.count_imaging_orders(diagnostico_id=diagnostico_id)
        
        return ImagingOrderListResponse(
            imaging_orders=[order.to_dict() for order in orders],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar órdenes de imagenología: {str(e)}")
    finally:
        service.close()

@router.get("/{order_id}", response_model=ImagingOrderResponse)
def get_imaging_order(order_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener una orden de imagenología específica por ID"""
    try:
        service = ImagingOrderService(db)
        order = service.get_imaging_order_by_id(order_id)
        
        if not order:
            raise HTTPException(status_code=404, detail="Orden de imagenología no encontrada")
        
        return order.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar orden de imagenología: {str(e)}")
    finally:
        service.close()

@router.get("/uuid/{uuid}", response_model=ImagingOrderResponse)
def get_imaging_order_by_uuid(uuid: str, db: Session = Depends(get_bienimed_db)):
    """Obtener una orden de imagenología por UUID"""
    try:
        service = ImagingOrderService(db)
        order = service.get_imaging_order_by_uuid(uuid)
        
        if not order:
            raise HTTPException(status_code=404, detail="Orden de imagenología no encontrada")
        
        return order.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar orden de imagenología: {str(e)}")
    finally:
        service.close()



