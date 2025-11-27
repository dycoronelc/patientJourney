"""
Esquemas para recursos
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ResourceBase(BaseModel):
    name: str
    type: str
    category: Optional[str] = None
    description: Optional[str] = None
    availability: Optional[str] = "available"
    capacity: Optional[int] = 1
    currentUtilization: Optional[int] = 0
    costPerHour: Optional[float] = 0.0
    location: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    healthCenterId: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    availability: Optional[str] = None
    capacity: Optional[int] = None
    currentUtilization: Optional[int] = None
    costPerHour: Optional[float] = None
    location: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    healthCenterId: Optional[str] = None

class ResourceResponse(ResourceBase):
    id: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True



