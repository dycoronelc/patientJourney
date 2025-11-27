"""
Servicio para gestión de flujos de pacientes
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.patient_flow import PatientFlow
from app.schemas.patient_flow import PatientFlowCreate, PatientFlowUpdate
import uuid
import json


class PatientFlowService:
    def __init__(self, db: Session):
        self.db = db

    def get_flows(
        self,
        skip: int = 0,
        limit: int = 100,
        specialty_id: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[PatientFlow]:
        """Obtener lista de flujos con filtros"""
        query = self.db.query(PatientFlow)
        
        if specialty_id:
            query = query.filter(PatientFlow.specialty_id == specialty_id)
        if is_active is not None:
            query = query.filter(PatientFlow.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()

    def get_flow(self, flow_id: str) -> Optional[PatientFlow]:
        """Obtener un flujo por ID"""
        return self.db.query(PatientFlow).filter(PatientFlow.id == flow_id).first()

    def create_flow(self, flow_data: PatientFlowCreate) -> PatientFlow:
        """Crear un nuevo flujo"""
        # Calcular duración y costo estimados si hay nodos
        nodes = flow_data.flow_steps or []
        edges = flow_data.flow_edges or []
        
        # Calcular costo total
        total_cost = sum(node.cost or 0.0 for node in nodes)
        
        # Calcular duración total
        total_duration = sum(node.duration or 0 for node in nodes)
        
        # Convertir nodos y edges a JSON
        nodes_json = [node.model_dump() for node in nodes] if nodes else None
        edges_json = [edge.model_dump() for edge in edges] if edges else None
        
        db_flow = PatientFlow(
            id=str(uuid.uuid4()),
            name=flow_data.name,
            description=flow_data.description,
            specialty_id=flow_data.specialty_id,
            flow_steps=nodes_json,
            flow_edges=edges_json,
            average_duration=flow_data.average_duration or total_duration,
            estimated_cost=flow_data.estimated_cost or total_cost,
            resource_requirements=flow_data.resource_requirements,
            cost_breakdown=flow_data.cost_breakdown,
            is_active=flow_data.is_active
        )
        
        self.db.add(db_flow)
        self.db.commit()
        self.db.refresh(db_flow)
        return db_flow

    def update_flow(self, flow_id: str, flow_data: PatientFlowUpdate) -> Optional[PatientFlow]:
        """Actualizar un flujo existente"""
        db_flow = self.get_flow(flow_id)
        if not db_flow:
            return None
        
        update_data = flow_data.model_dump(exclude_unset=True)
        
        # Si hay nodos, calcular costo y duración
        if 'flow_steps' in update_data and update_data['flow_steps']:
            nodes = update_data['flow_steps']
            # Calcular costo total
            total_cost = sum(float(node.get('cost', 0)) for node in nodes if isinstance(node, dict))
            # Calcular duración total
            total_duration = sum(int(node.get('duration', 0)) for node in nodes if isinstance(node, dict))
            
            if 'estimated_cost' not in update_data or update_data['estimated_cost'] is None:
                update_data['estimated_cost'] = total_cost
            if 'average_duration' not in update_data or update_data['average_duration'] is None:
                update_data['average_duration'] = total_duration
        
        # Actualizar campos
        for key, value in update_data.items():
            if hasattr(db_flow, key):
                setattr(db_flow, key, value)
        
        self.db.commit()
        self.db.refresh(db_flow)
        return db_flow

    def delete_flow(self, flow_id: str) -> bool:
        """Eliminar un flujo"""
        db_flow = self.get_flow(flow_id)
        if not db_flow:
            return False
        
        self.db.delete(db_flow)
        self.db.commit()
        return True

    def duplicate_flow(self, flow_id: str, new_name: Optional[str] = None) -> Optional[PatientFlow]:
        """Duplicar un flujo existente"""
        original_flow = self.get_flow(flow_id)
        if not original_flow:
            return None
        
        new_flow = PatientFlow(
            id=str(uuid.uuid4()),
            name=new_name or f"{original_flow.name} (Copia)",
            description=original_flow.description,
            specialty_id=original_flow.specialty_id,
            flow_steps=original_flow.flow_steps,
            flow_edges=original_flow.flow_edges,
            average_duration=original_flow.average_duration,
            estimated_cost=original_flow.estimated_cost,
            resource_requirements=original_flow.resource_requirements,
            cost_breakdown=original_flow.cost_breakdown,
            is_active=original_flow.is_active
        )
        
        self.db.add(new_flow)
        self.db.commit()
        self.db.refresh(new_flow)
        return new_flow
