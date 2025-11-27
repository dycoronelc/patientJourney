"""
Schemas para filtros de BieniMedico
"""
from pydantic import BaseModel, Field
from typing import Optional

class ClienteCorporativoResponse(BaseModel):
    id: int
    nombre: str
    direccion: Optional[str]
    imagen_url: Optional[str]
    estado: int
    idcentro: int

    class Config:
        from_attributes = True

class AreaResponse(BaseModel):
    id: int
    nombre: str
    icon_active: Optional[str]
    icon_color: Optional[str]
    estado: int
    idcentro: int

    class Config:
        from_attributes = True

class UsuarioResponse(BaseModel):
    id: int
    primernombre: str
    segundonombre: Optional[str]
    apellidopaterno: str
    apellidomaterno: Optional[str]
    nombre_completo: str
    foto: Optional[str]

    class Config:
        from_attributes = True
