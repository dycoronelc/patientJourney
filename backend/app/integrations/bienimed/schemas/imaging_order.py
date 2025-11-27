"""
Schemas para Órdenes de Imagenología de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List

class ImagingOrderResponse(BaseModel):
    id: int
    uuid: str
    diagnostico_id: Optional[int] = None
    mostrar_diagnostico: bool
    trw_id: int
    pdf: str
    fecha_creacion: Optional[str] = None

    class Config:
        from_attributes = True

class ImagingOrderListResponse(BaseModel):
    imaging_orders: List[ImagingOrderResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



