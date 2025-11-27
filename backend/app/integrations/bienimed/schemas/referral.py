"""
Schemas para Referencias de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List

class ReferralResponse(BaseModel):
    id: int
    uuid: str
    consulta_id: int
    especialidad_id: int
    motivo: str
    creado: Optional[str] = None
    referido_id: Optional[int] = None

    class Config:
        from_attributes = True

class ReferralListResponse(BaseModel):
    referrals: List[ReferralResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



