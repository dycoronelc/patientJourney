"""
Schemas para Doctores de Bienimed
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class DoctorResponse(BaseModel):
    id: int
    nombre: str
    apellidos: str
    nombre_completo: str
    documento: str
    tipo_documento: int
    idoneidad: str
    telefono: Optional[str] = None
    celular: Optional[str] = None
    correo: str
    especialidad_id: int
    subespecialidades: Optional[Dict[str, Any]] = None
    condiciones: Optional[Dict[str, Any]] = None
    atiende_a: Optional[Dict[str, Any]] = None
    estado: str
    sexo: Optional[int] = None
    fecha_nacimiento: Optional[str] = None
    domicilio: Optional[str] = None
    idiomas: Optional[Dict[str, Any]] = None
    ubicacion: Optional[Dict[str, Any]] = None
    fecha_creacion: Optional[str] = None

    class Config:
        from_attributes = True

class DoctorListResponse(BaseModel):
    doctors: List[DoctorResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



