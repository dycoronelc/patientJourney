"""
Schemas para Procedimientos de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List

class ProcedureResponse(BaseModel):
    id: int
    consulta_id: Optional[int] = None
    usuario_id: int
    paciente_id: Optional[int] = None
    procedimiento_id: Optional[int] = None
    descripcion: str
    realizado: Optional[str] = None
    cliente_id: Optional[int] = None
    creado: Optional[str] = None

    class Config:
        from_attributes = True

class ProcedureListResponse(BaseModel):
    procedures: List[ProcedureResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



