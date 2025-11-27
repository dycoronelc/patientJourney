"""
Modelo de Centro de Salud
"""

from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class HealthCenter(Base):
    """Modelo para centros de salud"""
    
    __tablename__ = "health_centers"
    
    # Campos principales
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100), nullable=False)  # hospital, clinic, policlinic, health_center
    
    # Ubicación
    address = Column(Text, nullable=True)
    city = Column(String(255), nullable=True)
    country = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Capacidad y recursos
    capacity = Column(JSON, nullable=True)  # Información de capacidad
    resources = Column(JSON, nullable=True)  # Recursos disponibles
    
    # Configuración
    specialties = Column(JSON, nullable=True)  # Especialidades disponibles
    operating_hours = Column(JSON, nullable=True)  # Horarios de operación
    contact_info = Column(JSON, nullable=True)  # Información de contacto
    
    # Metadatos
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    # specialties_rel = relationship("Specialty", secondary="center_specialties", back_populates="health_centers")
    # patient_interactions = relationship("PatientInteraction", back_populates="health_center")
    # resources_rel = relationship("Resource", back_populates="health_center")
    # patient_journeys = relationship("PatientJourney", back_populates="health_center")
    
    def __repr__(self):
        return f"<HealthCenter(id={self.id}, name={self.name}, type={self.type})>"
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "location": {
                "address": self.address,
                "city": self.city,
                "country": self.country,
                "coordinates": {
                    "lat": self.latitude,
                    "lng": self.longitude
                } if self.latitude and self.longitude else None
            },
            "capacity": self.capacity,
            "resources": self.resources,
            "specialties": self.specialties,
            "operatingHours": self.operating_hours,
            "contactInfo": self.contact_info,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }



