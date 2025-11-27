"""
Modelo de Flujo de Paciente Detallado
"""

from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class PatientFlow(Base):
    """Modelo para flujos de pacientes"""
    
    __tablename__ = "patient_flows"
    
    # Campos principales
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Relación con especialidad
    specialty_id = Column(String(36), nullable=True)  # Removido ForeignKey temporalmente
    
    # Definición del flujo
    flow_steps = Column(JSON, nullable=True)  # Pasos del flujo (nodos del diagrama)
    flow_edges = Column(JSON, nullable=True)  # Conexiones entre pasos (edges del diagrama)
    average_duration = Column(Integer, nullable=True)  # Duración promedio en minutos
    
    # Recursos necesarios
    resource_requirements = Column(JSON, nullable=True)
    
    # Costos asociados
    estimated_cost = Column(Float, default=0.0)  # Costo estimado total del flujo
    cost_breakdown = Column(JSON, nullable=True)  # Desglose de costos por paso
    
    # Metadatos
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    # specialty = relationship("Specialty", back_populates="patient_flows_rel")
    # patient_journeys = relationship("PatientJourney", back_populates="flow")
    
    def __repr__(self):
        return f"<PatientFlow(id={self.id}, name={self.name})>"
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "specialty": self.specialty_id,
            "specialtyId": self.specialty_id,
            "flowSteps": self.flow_steps,
            "flowEdges": self.flow_edges,
            "nodes": self.flow_steps,  # Alias para el frontend
            "edges": self.flow_edges,  # Alias para el frontend
            "steps": len(self.flow_steps) if self.flow_steps else 0,
            "averageDuration": self.average_duration,
            "estimatedDuration": self.average_duration,  # Alias
            "resourceRequirements": self.resource_requirements,
            "estimatedCost": self.estimated_cost,
            "costBreakdown": self.cost_breakdown,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }


class PatientJourney(Base):
    """Modelo para el recorrido completo de un paciente"""
    
    __tablename__ = "patient_journeys"
    
    # Campos principales
    id = Column(String(36), primary_key=True, index=True)
    patient_id = Column(String(255), nullable=False, index=True)
    
    # Relaciones
    health_center_id = Column(String(36), ForeignKey('health_centers.id'))
    specialty_id = Column(String(36), ForeignKey('specialties.id'))
    flow_id = Column(String(36), ForeignKey('patient_flows.id'))
    
    # Estado del recorrido
    status = Column(String(50), default='in_progress')  # in_progress, completed, cancelled
    current_step = Column(String(255), nullable=True)
    
    # Fechas
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Pasos completados
    completed_steps = Column(JSON, nullable=True)  # Lista de pasos completados
    
    # Órdenes y referencias (consultadas de sistemas externos)
    laboratory_orders = Column(JSON, nullable=True)  # Órdenes de laboratorio
    imaging_orders = Column(JSON, nullable=True)  # Órdenes de imágenes
    referrals = Column(JSON, nullable=True)  # Referencias a especialistas
    
    # Costos
    total_cost = Column(Float, default=0.0)
    cost_details = Column(JSON, nullable=True)  # Desglose detallado de costos
    
    # Tiempos
    total_duration = Column(Integer, nullable=True)  # Duración total en minutos
    wait_times = Column(JSON, nullable=True)  # Tiempos de espera por paso
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    # health_center = relationship("HealthCenter", back_populates="patient_journeys")
    # specialty = relationship("Specialty")
    # flow = relationship("PatientFlow", back_populates="patient_journeys")
    
    def __repr__(self):
        return f"<PatientJourney(id={self.id}, patient_id={self.patient_id}, status={self.status})>"
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            "id": self.id,
            "patientId": self.patient_id,
            "healthCenterId": self.health_center_id,
            "specialtyId": self.specialty_id,
            "flowId": self.flow_id,
            "status": self.status,
            "currentStep": self.current_step,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "endDate": self.end_date.isoformat() if self.end_date else None,
            "completedSteps": self.completed_steps,
            "laboratoryOrders": self.laboratory_orders,
            "imagingOrders": self.imaging_orders,
            "referrals": self.referrals,
            "totalCost": self.total_cost,
            "costDetails": self.cost_details,
            "totalDuration": self.total_duration,
            "waitTimes": self.wait_times,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }
