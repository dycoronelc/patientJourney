"""
Esquemas para centros de salud
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class HealthCenterBase(BaseModel):
    name: str
    type: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[Dict[str, Any]] = None
    resources: Optional[List[Dict[str, Any]]] = None
    specialties: Optional[List[str]] = None
    operatingHours: Optional[Dict[str, Any]] = None
    contactInfo: Optional[Dict[str, Any]] = None

class HealthCenterCreate(HealthCenterBase):
    pass

class HealthCenterUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[Dict[str, Any]] = None
    resources: Optional[List[Dict[str, Any]]] = None
    specialties: Optional[List[str]] = None
    operatingHours: Optional[Dict[str, Any]] = None
    contactInfo: Optional[Dict[str, Any]] = None

class HealthCenterResponse(HealthCenterBase):
    id: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True



