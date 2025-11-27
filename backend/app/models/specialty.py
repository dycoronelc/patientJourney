"""
Modelo de Especialidad Médica
"""

from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Specialty(Base):
    """Modelo para especialidades médicas"""
    
    __tablename__ = "specialties"
    
    # Campos principales
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Datos médicos
    common_tests = Column(JSON, nullable=True)  # Lista de estudios comunes
    typical_medications = Column(JSON, nullable=True)  # Lista de medicamentos típicos
    icd10_codes = Column(JSON, nullable=True)  # Códigos ICD-10
    cpt_codes = Column(JSON, nullable=True)  # Códigos CPT
    
    # Configuración de recursos
    average_consultation_time = Column(Integer, default=30)  # en minutos
    resource_requirements = Column(JSON, nullable=True)  # Requerimientos de recursos
    patient_flow = Column(JSON, nullable=True)  # Flujo de pacientes
    
    # Metadatos
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    # health_centers = relationship("HealthCenter", secondary="center_specialties", back_populates="specialties")
    # patient_interactions = relationship("PatientInteraction", back_populates="specialty")
    # patient_flows_rel = relationship("PatientFlow", back_populates="specialty")
    
    def __repr__(self):
        return f"<Specialty(id={self.id}, name={self.name})>"
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "commonTests": self.common_tests,
            "typicalMedications": self.typical_medications,
            "icd10Codes": self.icd10_codes,
            "cptCodes": self.cpt_codes,
            "averageConsultationTime": self.average_consultation_time,
            "resourceRequirements": self.resource_requirements,
            "patientFlow": self.patient_flow,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }



