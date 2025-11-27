"""
Servicio para generar flujos únicos basados en diagnósticos reales de CIE-10
"""
from typing import List, Dict, Any, Optional
from app.services.bienimed_analytics_service import BienimedAnalyticsService
from app.services.patient_flow_service import PatientFlowService
from app.services.catalog_service import CatalogService
from app.schemas.patient_flow import PatientFlowCreate, FlowStepNode, FlowEdge
from app.core.database import create_db_session
from app.integrations.bienimed.database import get_bienimed_db
import uuid
import json
from datetime import datetime

class UniqueFlowGeneratorService:
    def __init__(self):
        self.analytics_service = BienimedAnalyticsService()
        self.db = create_db_session()
        self.flow_service = PatientFlowService(self.db)
        self.bienimed_db = next(get_bienimed_db())
        self.catalog_service = CatalogService(self.bienimed_db)
    
    def generate_unique_diagnosis_flows(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Generar flujos únicos basados en diagnósticos reales de CIE-10"""
        try:
            generated_flows = []
            
            # Obtener diagnósticos activos únicos
            active_diagnoses = self.catalog_service.get_active_diagnoses(limit)
            
            for diagnosis in active_diagnoses:
                try:
                    # Crear flujo único para cada diagnóstico
                    flow_data = self._create_unique_diagnosis_flow(diagnosis)
                    created_flow = self.flow_service.create_flow(flow_data)
                    
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "unique_diagnosis",
                        "diagnosis_id": diagnosis["id"],
                        "diagnosis_code": diagnosis["codigo"],
                        "diagnosis_name": diagnosis["nombre"],
                        "display_name": diagnosis["display_name"],
                        "estimated_cost": created_flow.estimated_cost,
                        "estimated_duration": created_flow.average_duration
                    })
                    
                except Exception as e:
                    print(f"Error creating flow for diagnosis {diagnosis['display_name']}: {e}")
                    continue
            
            return generated_flows
            
        except Exception as e:
            print(f"Error generating unique diagnosis flows: {e}")
            return []
        finally:
            self._close_services()
    
    def _create_unique_diagnosis_flow(self, diagnosis: Dict) -> PatientFlowCreate:
        """Crear flujo único para un diagnóstico específico"""
        diagnosis_display = diagnosis["display_name"]
        
        # Generar ID único para el flujo
        flow_id = str(uuid.uuid4())
        
        return PatientFlowCreate(
            name=f"Flujo {diagnosis_display}",
            description=f"Flujo optimizado para {diagnosis_display} basado en datos reales de Bienimed",
            nodes=[
                FlowStepNode(
                    id=f"{flow_id}-node-1",
                    type="consultation",
                    label="Consulta Inicial",
                    cost=35.0,
                    duration=20,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-2",
                    type="laboratory",
                    label="Exámenes Diagnósticos",
                    cost=40.0,
                    duration=25,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-3",
                    type="diagnosis",
                    label=diagnosis_display,
                    cost=0.0,
                    duration=15,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-4",
                    type="prescription",
                    label="Tratamiento Específico",
                    cost=0.0,
                    duration=10,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-5",
                    type="followup",
                    label="Seguimiento",
                    cost=25.0,
                    duration=15,
                    position={"x": 1300, "y": 200}
                ),
            ],
            edges=[
                FlowEdge(id=f"{flow_id}-edge-1", source=f"{flow_id}-node-1", target=f"{flow_id}-node-2"),
                FlowEdge(id=f"{flow_id}-edge-2", source=f"{flow_id}-node-2", target=f"{flow_id}-node-3"),
                FlowEdge(id=f"{flow_id}-edge-3", source=f"{flow_id}-node-3", target=f"{flow_id}-node-4"),
                FlowEdge(id=f"{flow_id}-edge-4", source=f"{flow_id}-node-4", target=f"{flow_id}-node-5"),
            ],
            steps=5,
            estimatedDuration=85,
            estimatedCost=100.0,
            isActive=True
        )
    
    def generate_unique_procedure_flows(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Generar flujos únicos basados en procedimientos reales"""
        try:
            generated_flows = []
            
            # Obtener procedimientos únicos (simulamos obtener los más comunes)
            # En una implementación real, esto vendría de los datos de Bienimed
            common_procedures = [
                {"id": 1, "codigo": "001", "descripcion": "Consulta médica general"},
                {"id": 2, "codigo": "002", "descripcion": "Examen físico completo"},
                {"id": 3, "codigo": "003", "descripcion": "Análisis de laboratorio básico"},
                {"id": 4, "codigo": "004", "descripcion": "Radiografía de tórax"},
                {"id": 5, "codigo": "005", "descripcion": "Electrocardiograma"},
            ]
            
            for procedure in common_procedures[:limit]:
                try:
                    flow_data = self._create_unique_procedure_flow(procedure)
                    created_flow = self.flow_service.create_flow(flow_data)
                    
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "unique_procedure",
                        "procedure_id": procedure["id"],
                        "procedure_code": procedure["codigo"],
                        "procedure_name": procedure["descripcion"],
                        "estimated_cost": created_flow.estimated_cost,
                        "estimated_duration": created_flow.average_duration
                    })
                    
                except Exception as e:
                    print(f"Error creating flow for procedure {procedure['descripcion']}: {e}")
                    continue
            
            return generated_flows
            
        except Exception as e:
            print(f"Error generating unique procedure flows: {e}")
            return []
        finally:
            self._close_services()
    
    def _create_unique_procedure_flow(self, procedure: Dict) -> PatientFlowCreate:
        """Crear flujo único para un procedimiento específico"""
        procedure_display = f"{procedure['codigo']} - {procedure['descripcion']}"
        
        # Generar ID único para el flujo
        flow_id = str(uuid.uuid4())
        
        return PatientFlowCreate(
            name=f"Flujo {procedure_display}",
            description=f"Flujo optimizado para {procedure_display} basado en datos reales",
            nodes=[
                FlowStepNode(
                    id=f"{flow_id}-node-1",
                    type="consultation",
                    label="Evaluación Pre-Procedimiento",
                    cost=35.0,
                    duration=20,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-2",
                    type="laboratory",
                    label="Exámenes Pre-Operatorios",
                    cost=45.0,
                    duration=30,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-3",
                    type="procedure",
                    label=procedure_display,
                    cost=150.0,
                    duration=90,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id=f"{flow_id}-node-4",
                    type="followup",
                    label="Recuperación y Seguimiento",
                    cost=35.0,
                    duration=40,
                    position={"x": 1000, "y": 200}
                ),
            ],
            edges=[
                FlowEdge(id=f"{flow_id}-edge-1", source=f"{flow_id}-node-1", target=f"{flow_id}-node-2"),
                FlowEdge(id=f"{flow_id}-edge-2", source=f"{flow_id}-node-2", target=f"{flow_id}-node-3"),
                FlowEdge(id=f"{flow_id}-edge-3", source=f"{flow_id}-node-3", target=f"{flow_id}-node-4"),
            ],
            steps=4,
            estimatedDuration=180,
            estimatedCost=265.0,
            isActive=True
        )
    
    def _close_services(self):
        """Cerrar conexiones de servicios"""
        try:
            if self.db:
                self.db.close()
            if self.bienimed_db:
                self.bienimed_db.close()
        except:
            pass
