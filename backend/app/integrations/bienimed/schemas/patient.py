"""
Schemas para Pacientes de Bienimed
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class PatientResponse(BaseModel):
    id: int
    nombre: str
    apellidos: str
    nombre_completo: str
    documento: str
    tipo_documento: str
    fecha_nacimiento: Optional[str] = None
    sexo: int
    tiene_seguro: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    correo: str
    domicilio: Optional[str] = None
    fecha_creacion: Optional[str] = None
    actualizado: Optional[str] = None

    class Config:
        from_attributes = True

class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



