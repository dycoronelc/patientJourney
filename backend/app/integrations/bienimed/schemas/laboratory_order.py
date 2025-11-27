"""
Schemas para Órdenes de Laboratorio de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List

class LaboratoryOrderResponse(BaseModel):
    id: int
    uuid: str
    diagnostico_id: Optional[int] = None
    mostrar_diagnostico: bool
    trw_id: int
    pdf: str
    fecha_creacion: Optional[str] = None

    class Config:
        from_attributes = True

class LaboratoryOrderListResponse(BaseModel):
    laboratory_orders: List[LaboratoryOrderResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



