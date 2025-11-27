"""
Schemas para Patient Flow
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class FlowStepNode(BaseModel):
    """Nodo individual del flujo"""
    id: str
    type: Optional[str] = None
    label: Optional[str] = None
    cost: Optional[float] = 0.0
    duration: Optional[int] = 0
    position: Optional[Dict[str, float]] = None
    data: Optional[Dict[str, Any]] = None


class FlowEdge(BaseModel):
    """Conexión entre nodos"""
    id: Optional[str] = None
    source: str
    target: str
    type: Optional[str] = "default"


class PatientFlowBase(BaseModel):
    """Schema base para PatientFlow"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    specialty_id: Optional[str] = Field(None, alias="specialtyId")
    flow_steps: Optional[List[FlowStepNode]] = Field(None, alias="nodes")
    flow_edges: Optional[List[FlowEdge]] = Field(None, alias="edges")
    average_duration: Optional[int] = Field(None, alias="estimatedDuration")
    estimated_cost: Optional[float] = Field(0.0, alias="estimatedCost")
    resource_requirements: Optional[Dict[str, Any]] = None
    cost_breakdown: Optional[Dict[str, Any]] = None
    is_active: bool = True

    class Config:
        populate_by_name = True


class PatientFlowCreate(PatientFlowBase):
    """Schema para crear un flujo"""
    pass


class PatientFlowUpdate(BaseModel):
    """Schema para actualizar un flujo"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    specialty_id: Optional[str] = Field(None, alias="specialtyId")
    flow_steps: Optional[List[FlowStepNode]] = Field(None, alias="nodes")
    flow_edges: Optional[List[FlowEdge]] = Field(None, alias="edges")
    average_duration: Optional[int] = Field(None, alias="estimatedDuration")
    estimated_cost: Optional[float] = Field(None, alias="estimatedCost")
    resource_requirements: Optional[Dict[str, Any]] = None
    cost_breakdown: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

    class Config:
        populate_by_name = True


class PatientFlowResponse(BaseModel):
    """Schema de respuesta para un flujo"""
    id: str
    name: str
    description: Optional[str] = None
    specialty: Optional[str] = None
    specialtyId: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None
    steps: int = 0
    estimatedCost: float = 0.0
    estimatedDuration: Optional[int] = None
    isActive: bool = True
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True
