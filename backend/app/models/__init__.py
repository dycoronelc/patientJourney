"""
Modelos de base de datos - Estructura optimizada
Solo incluye las tablas esenciales para el Patient Journey Predictor
"""

from app.models.base import BaseModel
from app.models.specialty import Specialty
from app.models.health_center import HealthCenter
from app.models.patient_flow import PatientFlow, PatientJourney
from app.models.step import Step, FlowStep

# Modelos normalizados para flujos médicos
from app.models.flow_models import (
    Specialty as SpecialtyNormalized,
    StepType,
    UrgencyLevel,
    Flow,
    FlowNode,
    FlowEdge,
    ReferralCriteria,
    NodeResource
)

__all__ = [
    "BaseModel",
    "Specialty",
    "HealthCenter", 
    "PatientFlow",
    "PatientJourney",
    "Step",
    "FlowStep",
    # Modelos normalizados
    "SpecialtyNormalized",
    "StepType",
    "UrgencyLevel",
    "Flow",
    "FlowNode",
    "FlowEdge",
    "ReferralCriteria",
    "NodeResource"
]
