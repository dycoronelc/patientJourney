"""
Esquemas para recorridos de pacientes
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PatientJourneyBase(BaseModel):
    patientId: str
    healthCenterId: Optional[str] = None
    specialtyId: Optional[str] = None
    flowId: Optional[str] = None

class PatientJourneyCreate(PatientJourneyBase):
    pass

class PatientJourneyUpdate(BaseModel):
    status: Optional[str] = None
    currentStep: Optional[str] = None
    completedSteps: Optional[List[Dict[str, Any]]] = None
    totalCost: Optional[float] = None
    costDetails: Optional[Dict[str, Any]] = None
    totalDuration: Optional[int] = None
    waitTimes: Optional[Dict[str, Any]] = None

class PatientJourneyResponse(PatientJourneyBase):
    id: str
    status: str
    currentStep: Optional[str] = None
    startDate: datetime
    endDate: Optional[datetime] = None
    totalCost: float
    totalDuration: Optional[int] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class PatientJourneyDetailResponse(PatientJourneyResponse):
    completedSteps: Optional[List[Dict[str, Any]]] = None
    laboratoryOrders: Optional[List[Dict[str, Any]]] = None
    imagingOrders: Optional[List[Dict[str, Any]]] = None
    referrals: Optional[List[Dict[str, Any]]] = None
    costDetails: Optional[Dict[str, Any]] = None
    waitTimes: Optional[Dict[str, Any]] = None

class LaboratoryOrderResponse(BaseModel):
    id: str
    externalId: Optional[str] = None
    patientId: str
    orderType: str
    tests: Optional[List[str]] = None
    orderDate: datetime
    scheduledDate: Optional[datetime] = None
    completedDate: Optional[datetime] = None
    status: str
    priority: str
    resultsAvailable: bool
    estimatedCost: float
    actualCost: Optional[float] = None
    sourceSystem: Optional[str] = None

class ImagingOrderResponse(BaseModel):
    id: str
    externalId: Optional[str] = None
    patientId: str
    imagingType: str
    bodyPart: Optional[str] = None
    modality: Optional[str] = None
    orderDate: datetime
    scheduledDate: Optional[datetime] = None
    completedDate: Optional[datetime] = None
    status: str
    priority: str
    resultsAvailable: bool
    estimatedCost: float
    actualCost: Optional[float] = None
    sourceSystem: Optional[str] = None

class ReferralResponse(BaseModel):
    id: str
    externalId: Optional[str] = None
    patientId: str
    fromSpecialtyId: Optional[str] = None
    toSpecialtyId: Optional[str] = None
    reason: str
    urgency: str
    referralDate: datetime
    appointmentDate: Optional[datetime] = None
    status: str
    estimatedCost: float
    actualCost: Optional[float] = None
    sourceSystem: Optional[str] = None










