"""
Servicio para gestión de flujos médicos normalizados
Proporciona acceso a los 20 flujos médicos completos migrados
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
import structlog
from datetime import datetime

logger = structlog.get_logger()

class MedicalFlowService:
    """Servicio para operaciones con flujos médicos normalizados"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_specialties(self) -> List[Dict[str, Any]]:
        """Obtener todas las especialidades médicas"""
        try:
            # Query directo a la tabla specialties_normalized
            result = self.db.execute(text("""
                SELECT id, code, name, is_active
                FROM specialties_normalized
                WHERE is_active = 1
                ORDER BY name
            """))
            
            specialties = []
            for row in result:
                specialties.append({
                    "id": row[0],
                    "code": row[1],
                    "name": row[2],
                    "is_active": bool(row[3])
                })
            
            return specialties
            
        except Exception as e:
            logger.error("Error getting specialties", error=str(e))
            return []
    
    def get_flows_by_specialty(self, specialty_id: str) -> List[Dict[str, Any]]:
        """Obtener flujos por especialidad"""
        try:
            # Query directo a la tabla flows
            result = self.db.execute(text("""
                SELECT id, name, specialty_id, description, average_duration, 
                       estimated_cost, is_active
                FROM flows
                WHERE specialty_id = :specialty_id AND is_active = 1
                ORDER BY name
            """), {"specialty_id": specialty_id})
            
            flows = []
            for row in result:
                flows.append({
                    "id": row[0],
                    "name": row[1],
                    "specialty_id": row[2],
                    "description": row[3],
                    "average_duration": row[4],
                    "estimated_cost": float(row[5]) if row[5] else 0.0,
                    "is_active": bool(row[6])
                })
            
            return flows
            
        except Exception as e:
            logger.error("Error getting flows by specialty", error=str(e))
            return []
    
    def get_all_flows(self) -> List[Dict[str, Any]]:
        """Obtener todos los flujos médicos con nodos y edges"""
        try:
            # Query directo a la tabla flows
            result = self.db.execute(text("""
                SELECT f.id, f.name, f.specialty_id, f.description, f.average_duration, 
                       f.estimated_cost, f.is_active,
                       s.name as specialty_name
                FROM flows f
                LEFT JOIN specialties_normalized s ON f.specialty_id = s.id
                WHERE f.is_active = 1
                ORDER BY s.name, f.name
            """))
            
            flows = []
            for row in result:
                flow_id = row[0]
                flow_data = {
                    "id": flow_id,
                    "name": row[1],
                    "specialty_id": row[2],
                    "description": row[3],
                    "averageDuration": row[4],  # Cambiado para coincidir con frontend
                    "estimatedCost": float(row[5]) if row[5] else 0.0,  # Cambiado para coincidir con frontend
                    "isActive": bool(row[6]),  # Cambiado para coincidir con frontend
                    "specialtyName": row[7],  # Cambiado para coincidir con frontend
                    "nodes": self.get_flow_nodes(flow_id),
                    "edges": self.get_flow_edges(flow_id)
                }
                flows.append(flow_data)
            
            return flows
            
        except Exception as e:
            logger.error("Error getting all flows", error=str(e))
            return []
    
    def get_flow_nodes(self, flow_id: str) -> List[Dict[str, Any]]:
        """Obtener nodos de un flujo específico"""
        try:
            # Query directo a la tabla flow_nodes
            result = self.db.execute(text("""
                SELECT id, flow_id, step_type_id, label, description, order_index, 
                       duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y
                FROM flow_nodes
                WHERE flow_id = :flow_id
                ORDER BY order_index
            """), {"flow_id": flow_id})
            
            nodes = []
            for row in result:
                nodes.append({
                    "id": row[0],
                    "flowId": row[1],
                    "stepTypeId": row[2],
                    "label": row[3],
                    "description": row[4],
                    "orderIndex": row[5],
                    "durationMinutes": row[6],
                    "costMin": float(row[7]) if row[7] else 0.0,
                    "costMax": float(row[8]) if row[8] else 0.0,
                    "costAvg": float(row[9]) if row[9] else 0.0,
                    "position": {
                        "x": row[10],
                        "y": row[11]
                    }
                })
            
            return nodes
            
        except Exception as e:
            logger.error("Error getting flow nodes", error=str(e))
            return []
    
    def get_flow_edges(self, flow_id: str) -> List[Dict[str, Any]]:
        """Obtener conexiones de un flujo específico"""
        try:
            # Query directo a la tabla flow_edges_rel
            result = self.db.execute(text("""
                SELECT id, flow_id, source_node_id, target_node_id, edge_type
                FROM flow_edges_rel
                WHERE flow_id = :flow_id
                ORDER BY source_node_id, target_node_id
            """), {"flow_id": flow_id})
            
            edges = []
            for row in result:
                edges.append({
                    "id": row[0],
                    "flowId": row[1],
                    "sourceNodeId": row[2],
                    "targetNodeId": row[3],
                    "edgeType": row[4]
                })
            
            return edges
            
        except Exception as e:
            logger.error("Error getting flow edges", error=str(e))
            return []
    
    def get_flow_by_id(self, flow_id: str) -> Optional[Dict[str, Any]]:
        """Obtener flujo por ID con nodos y conexiones"""
        return self.get_flow_details(flow_id)
    
    def get_flow_details(self, flow_id: str) -> Optional[Dict[str, Any]]:
        """Obtener detalles completos de un flujo"""
        try:
            # Obtener información del flujo
            flow_result = self.db.execute(text("""
                SELECT f.id, f.name, f.specialty_id, f.description, f.average_duration, 
                       f.estimated_cost, f.is_active,
                       s.name as specialty_name
                FROM flows f
                LEFT JOIN specialties_normalized s ON f.specialty_id = s.id
                WHERE f.id = :flow_id
            """), {"flow_id": flow_id})
            
            flow_row = flow_result.fetchone()
            if not flow_row:
                return None
            
            flow_data = {
                "id": flow_row[0],
                "name": flow_row[1],
                "specialty_id": flow_row[2],
                "description": flow_row[3],
                "averageDuration": flow_row[4],  # Cambiado para coincidir con frontend
                "estimatedCost": float(flow_row[5]) if flow_row[5] else 0.0,  # Cambiado para coincidir con frontend
                "isActive": bool(flow_row[6]),  # Cambiado para coincidir con frontend
                "specialtyName": flow_row[7],  # Cambiado para coincidir con frontend
                "nodes": self.get_flow_nodes(flow_id),
                "edges": self.get_flow_edges(flow_id)
            }
            
            return flow_data
            
        except Exception as e:
            logger.error("Error getting flow details", error=str(e))
            return None
    
    def get_referral_criteria(self, specialty_id: str) -> List[Dict[str, Any]]:
        """Obtener criterios de referencia para una especialidad"""
        try:
            # Query directo a la tabla referral_criteria
            result = self.db.execute(text("""
                SELECT id, specialty_id, criteria_type, description, 
                       urgency_level, conditions, metadata
                FROM referral_criteria
                WHERE specialty_id = :specialty_id
                ORDER BY urgency_level, criteria_type
            """), {"specialty_id": specialty_id})
            
            criteria = []
            for row in result:
                criteria.append({
                    "id": row[0],
                    "specialty_id": row[1],
                    "criteria_type": row[2],
                    "description": row[3],
                    "urgency_level": row[4],
                    "conditions": row[5],
                    "metadata": row[6]
                })
            
            return criteria
            
        except Exception as e:
            logger.error("Error getting referral criteria", error=str(e))
            return []
