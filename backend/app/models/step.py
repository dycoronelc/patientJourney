from sqlalchemy import Column, String, Float, Text, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Step(Base):
    __tablename__ = "steps"

    # Campos base
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Información básica del paso
    name = Column(String(100), nullable=False, comment="Nombre del paso")
    description = Column(Text, comment="Descripción detallada del paso")
    step_type = Column(String(50), nullable=False, comment="Tipo de paso (consultation, laboratory, imaging, referral, discharge)")
    
    # Información de costos
    base_cost = Column(Float, nullable=False, default=0.0, comment="Costo base del paso")
    cost_unit = Column(String(20), default="USD", comment="Unidad monetaria")
    
    # Configuración del paso
    duration_minutes = Column(Integer, comment="Duración estimada en minutos")
    icon = Column(String(50), comment="Icono Material-UI a usar")
    color = Column(String(20), default="#1976d2", comment="Color del borde del paso")
    
    # Configuración adicional
    is_active = Column(Boolean, default=True, comment="Si el paso está activo")
    category = Column(String(50), comment="Categoría del paso")
    tags = Column(Text, comment="Tags separados por comas")
    
    # Información del sistema
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    # Un paso puede estar en múltiples flujos
    # flow_steps = relationship("FlowStep", back_populates="step")

    def __repr__(self):
        return f"<Step(id='{self.id}', name='{self.name}', type='{self.step_type}')>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "step_type": self.step_type,
            "base_cost": self.base_cost,
            "cost_unit": self.cost_unit,
            "duration_minutes": self.duration_minutes,
            "icon": self.icon,
            "color": self.color,
            "is_active": self.is_active,
            "category": self.category,
            "tags": self.tags.split(",") if self.tags else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class FlowStep(Base):
    """Tabla intermedia para relacionar flujos con pasos"""
    __tablename__ = "flow_steps"

    # Campos base
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    flow_id = Column(String(36), nullable=False, comment="ID del flujo")
    step_id = Column(String(36), nullable=False, comment="ID del paso")
    order_index = Column(Integer, nullable=False, comment="Orden del paso en el flujo")
    
    # Configuración específica del paso en este flujo
    custom_name = Column(String(100), comment="Nombre personalizado para este flujo")
    custom_cost = Column(Float, comment="Costo personalizado para este flujo")
    custom_description = Column(Text, comment="Descripción personalizada")
    
    # Configuración de conexiones
    next_step_ids = Column(Text, comment="IDs de pasos siguientes (JSON)")
    previous_step_ids = Column(Text, comment="IDs de pasos anteriores (JSON)")
    
    # Configuración de posición en el diagrama
    position_x = Column(Integer, default=250, comment="Posición X en el diagrama")
    position_y = Column(Integer, default=100, comment="Posición Y en el diagrama")

    # Relaciones
    # step = relationship("Step", back_populates="flow_steps")

    def __repr__(self):
        return f"<FlowStep(flow_id='{self.flow_id}', step_id='{self.step_id}', order={self.order_index})>"

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "flow_id": self.flow_id,
            "step_id": self.step_id,
            "order_index": self.order_index,
            "custom_name": self.custom_name,
            "custom_cost": self.custom_cost,
            "custom_description": self.custom_description,
            "next_step_ids": json.loads(self.next_step_ids) if self.next_step_ids else [],
            "previous_step_ids": json.loads(self.previous_step_ids) if self.previous_step_ids else [],
            "position_x": self.position_x,
            "position_y": self.position_y,
            "step": self.step.to_dict() if self.step else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
