"""
Esquemas para especialidades médicas
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SpecialtyBase(BaseModel):
    name: str
    description: Optional[str] = None
    commonTests: Optional[List[Dict[str, Any]]] = None
    typicalMedications: Optional[List[Dict[str, Any]]] = None
    icd10Codes: Optional[List[str]] = None
    cptCodes: Optional[List[str]] = None
    averageConsultationTime: Optional[int] = 30
    resourceRequirements: Optional[List[Dict[str, Any]]] = None
    patientFlow: Optional[List[Dict[str, Any]]] = None

class SpecialtyCreate(SpecialtyBase):
    pass

class SpecialtyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    commonTests: Optional[List[Dict[str, Any]]] = None
    typicalMedications: Optional[List[Dict[str, Any]]] = None
    icd10Codes: Optional[List[str]] = None
    cptCodes: Optional[List[str]] = None
    averageConsultationTime: Optional[int] = None
    resourceRequirements: Optional[List[Dict[str, Any]]] = None
    patientFlow: Optional[List[Dict[str, Any]]] = None

class SpecialtyResponse(SpecialtyBase):
    id: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True



