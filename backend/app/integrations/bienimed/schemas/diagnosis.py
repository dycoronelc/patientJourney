"""
Schemas para Diagnósticos de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List

class DiagnosisResponse(BaseModel):
    id: int
    consulta_id: Optional[int] = None
    usuario_id: int
    paciente_id: Optional[int] = None
    diagnostico_id: int
    descripcion: str
    fecha: Optional[str] = None
    cliente_id: Optional[int] = None
    creado: Optional[str] = None

    class Config:
        from_attributes = True

class DiagnosisListResponse(BaseModel):
    diagnoses: List[DiagnosisResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



