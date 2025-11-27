"""
Schemas para Recetas de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List

class PrescriptionResponse(BaseModel):
    id: int
    uuid: str
    diagnostico_id: int
    mostrar_diagnostico: bool
    trw_id: Optional[int] = None
    pdf: Optional[str] = None
    fecha_creacion: Optional[str] = None

    class Config:
        from_attributes = True

class PrescriptionListResponse(BaseModel):
    prescriptions: List[PrescriptionResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



