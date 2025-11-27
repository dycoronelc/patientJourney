"""
Modelos para el sistema de flujos médicos normalizado
Basado en el archivo manual_flujos_consolidado.sql
"""

from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, Boolean, Float, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Specialty(Base):
    """Modelo para especialidades médicas (versión normalizada)"""
    
    __tablename__ = "specialties_normalized"
    
    id = Column(String(36), primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    flows = relationship("Flow", back_populates="specialty")
    referral_criteria_from = relationship("ReferralCriteria", foreign_keys="ReferralCriteria.target_specialty_id", back_populates="target_specialty")
    referral_criteria_to = relationship("ReferralCriteria", foreign_keys="ReferralCriteria.target_specialty_id", back_populates="target_specialty")
    
    def __repr__(self):
        return f"<Specialty(id={self.id}, code={self.code}, name={self.name})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "isActive": self.is_active
        }

class StepType(Base):
    """Modelo para tipos de pasos médicos"""
    
    __tablename__ = "step_types"
    
    id = Column(String(36), primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    
    # Relaciones
    flow_nodes = relationship("FlowNode", back_populates="step_type")
    
    def __repr__(self):
        return f"<StepType(id={self.id}, code={self.code}, name={self.name})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name
        }

class UrgencyLevel(Base):
    """Modelo para niveles de urgencia"""
    
    __tablename__ = "urgency_levels"
    
    id = Column(String(36), primary_key=True, index=True)
    code = Column(String(30), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    
    # Relaciones
    referral_criteria = relationship("ReferralCriteria", back_populates="urgency")
    
    def __repr__(self):
        return f"<UrgencyLevel(id={self.id}, code={self.code}, name={self.name})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name
        }

class Flow(Base):
    """Modelo para flujos médicos unificado - soporta múltiples fuentes de datos"""
    
    __tablename__ = "flows"
    
    # Campos principales
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    specialty_id = Column(String(36), ForeignKey('specialties_normalized.id'), nullable=True)
    description = Column(Text, nullable=True)
    
    # Origen y tipo
    source_system = Column(String(50), nullable=False, default='normalized', index=True)  # 'normalized', 'bienimed', 'minimed', 'pacifica_salud', 'css'
    source_id = Column(String(100), nullable=True)  # ID original en el sistema fuente
    flow_type = Column(String(50), nullable=True, index=True)  # 'standard', 'emergency', 'followup', 'procedure'
    is_template = Column(Boolean, default=False, index=True)  # TRUE para flujos normalizados (plantillas)
    code = Column(String(50), nullable=True, unique=True, index=True)  # Código único del flujo
    
    # Especialidad adicional
    specialty_name = Column(String(255), nullable=True, index=True)  # Nombre de especialidad (desnormalizado para rapidez)
    
    # Métricas
    average_duration = Column(Integer, nullable=True)  # en minutos
    estimated_cost = Column(DECIMAL(10, 2), nullable=True)
    complexity_level = Column(String(20), nullable=True)  # 'low', 'medium', 'high', 'critical'
    
    # Configuración
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)  # Si es visible públicamente
    version = Column(String(20), default='1.0')  # Versión del flujo
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(String(100), nullable=True)  # Usuario/sistema que lo creó
    flow_metadata = Column('metadata', JSON, nullable=True)  # Metadatos adicionales específicos del origen (metadata es reservado en SQLAlchemy)
    
    # Campos de compatibilidad (para flujos importados con estructura diferente)
    flow_steps = Column(JSON, nullable=True)  # JSON de pasos (para compatibilidad)
    flow_edges = Column(JSON, nullable=True)  # JSON de conexiones (para compatibilidad)
    resource_requirements = Column(JSON, nullable=True)  # Requerimientos de recursos
    cost_breakdown = Column(JSON, nullable=True)  # Desglose de costos
    
    # Relaciones
    specialty = relationship("Specialty", back_populates="flows")
    flow_nodes = relationship("FlowNode", back_populates="flow", cascade="all, delete-orphan")
    flow_edges = relationship("FlowEdge", back_populates="flow", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Flow(id={self.id}, name={self.name}, specialty_id={self.specialty_id})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "specialtyId": self.specialty_id,
            "specialtyName": self.specialty_name or (self.specialty.name if self.specialty else None),
            "description": self.description,
            "averageDuration": self.average_duration,
            "estimatedCost": float(self.estimated_cost) if self.estimated_cost else None,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "nodes": [node.to_dict() for node in self.flow_nodes],
            "edges": [edge.to_dict() for edge in self.flow_edges],
            # Nuevos campos
            "sourceSystem": self.source_system,
            "sourceId": self.source_id,
            "flowType": self.flow_type,
            "isTemplate": self.is_template,
            "code": self.code,
            "complexityLevel": self.complexity_level,
            "isPublic": self.is_public,
            "version": self.version,
            "createdBy": self.created_by,
            "metadata": self.flow_metadata
        }

class FlowNode(Base):
    """Modelo para nodos/pasos de flujos médicos"""
    
    __tablename__ = "flow_nodes"
    
    id = Column(String(36), primary_key=True, index=True)
    flow_id = Column(String(36), ForeignKey('flows.id'), nullable=False)
    step_type_id = Column(String(36), ForeignKey('step_types.id'), nullable=False)
    label = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    cost_min = Column(DECIMAL(10, 2), nullable=True)
    cost_max = Column(DECIMAL(10, 2), nullable=True)
    cost_avg = Column(DECIMAL(10, 2), nullable=True)
    position_x = Column(Integer, default=200)
    position_y = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    flow = relationship("Flow", back_populates="flow_nodes")
    step_type = relationship("StepType", back_populates="flow_nodes")
    node_resources = relationship("NodeResource", back_populates="node", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<FlowNode(id={self.id}, flow_id={self.flow_id}, label={self.label})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "flowId": self.flow_id,
            "stepTypeId": self.step_type_id,
            "stepTypeName": self.step_type.name if self.step_type else None,
            "label": self.label,
            "description": self.description,
            "orderIndex": self.order_index,
            "durationMinutes": self.duration_minutes,
            "costMin": float(self.cost_min) if self.cost_min else None,
            "costMax": float(self.cost_max) if self.cost_max else None,
            "costAvg": float(self.cost_avg) if self.cost_avg else None,
            "position": {
                "x": self.position_x,
                "y": self.position_y
            },
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

class FlowEdge(Base):
    """Modelo para conexiones entre nodos de flujos"""
    
    __tablename__ = "flow_edges_rel"
    
    id = Column(String(36), primary_key=True, index=True)
    flow_id = Column(String(36), ForeignKey('flows.id'), nullable=False)
    source_node_id = Column(String(36), ForeignKey('flow_nodes.id'), nullable=False)
    target_node_id = Column(String(36), ForeignKey('flow_nodes.id'), nullable=False)
    edge_type = Column(String(30), default='default')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    flow = relationship("Flow", back_populates="flow_edges")
    source_node = relationship("FlowNode", foreign_keys=[source_node_id])
    target_node = relationship("FlowNode", foreign_keys=[target_node_id])
    
    def __repr__(self):
        return f"<FlowEdge(id={self.id}, flow_id={self.flow_id}, source={self.source_node_id}, target={self.target_node_id})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "flowId": self.flow_id,
            "sourceNodeId": self.source_node_id,
            "targetNodeId": self.target_node_id,
            "edgeType": self.edge_type,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

class ReferralCriteria(Base):
    """Modelo para criterios de referencia entre especialidades"""
    
    __tablename__ = "referral_criteria"
    
    id = Column(String(36), primary_key=True, index=True)
    diagnosis = Column(String(200), nullable=False, index=True)
    criterion = Column(Text, nullable=False)
    target_specialty_id = Column(String(36), ForeignKey('specialties_normalized.id'), nullable=False)
    urgency_id = Column(String(36), ForeignKey('urgency_levels.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    target_specialty = relationship("Specialty", foreign_keys=[target_specialty_id], back_populates="referral_criteria_to")
    urgency = relationship("UrgencyLevel", back_populates="referral_criteria")
    
    def __repr__(self):
        return f"<ReferralCriteria(id={self.id}, diagnosis={self.diagnosis}, target_specialty_id={self.target_specialty_id})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "diagnosis": self.diagnosis,
            "criterion": self.criterion,
            "targetSpecialtyId": self.target_specialty_id,
            "targetSpecialtyName": self.target_specialty.name if self.target_specialty else None,
            "urgencyId": self.urgency_id,
            "urgencyName": self.urgency.name if self.urgency else None,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

class NodeResource(Base):
    """Modelo para recursos necesarios en cada nodo"""
    
    __tablename__ = "node_resources"
    
    id = Column(String(36), primary_key=True, index=True)
    node_id = Column(String(36), ForeignKey('flow_nodes.id'), nullable=False)
    resource_code = Column(String(100), nullable=False)
    quantity = Column(Integer, default=1)
    
    # Relaciones
    node = relationship("FlowNode", back_populates="node_resources")
    
    def __repr__(self):
        return f"<NodeResource(id={self.id}, node_id={self.node_id}, resource_code={self.resource_code})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "nodeId": self.node_id,
            "resourceCode": self.resource_code,
            "quantity": self.quantity
        }

