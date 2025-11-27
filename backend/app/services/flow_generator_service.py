"""
Servicio para generar flujos automáticamente basados en datos de Bienimed
"""
from typing import List, Dict, Any, Optional
from app.services.bienimed_analytics_service import BienimedAnalyticsService
from app.services.patient_flow_service import PatientFlowService
from app.schemas.patient_flow import PatientFlowCreate, FlowStepNode, FlowEdge
from app.core.database import create_db_session
import uuid
import json

class FlowGeneratorService:
    def __init__(self):
        self.analytics_service = BienimedAnalyticsService()
        self.db = create_db_session()
        self.flow_service = PatientFlowService(self.db)
    
    def generate_flows_from_bienimed_data(self) -> List[Dict[str, Any]]:
        """Generar flujos basados en datos reales de Bienimed"""
        try:
            # Obtener recomendaciones de flujos
            recommendations = self.analytics_service.generate_flow_recommendations()
            generated_flows = []
            
            for recommendation in recommendations:
                # Convertir recomendación a formato de flujo
                flow_data = self._convert_recommendation_to_flow(recommendation)
                
                # Crear el flujo en la base de datos
                try:
                    created_flow = self.flow_service.create_flow(flow_data)
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "description": created_flow.description,
                        "estimated_cost": created_flow.estimated_cost,
                        "estimated_duration": created_flow.average_duration,
                        "steps_count": len(flow_data.nodes),
                        "source": "bienimed_data",
                        "frequency": recommendation.get("frequency", 0)
                    })
                except Exception as e:
                    print(f"Error creating flow {flow_data.name}: {e}")
                    continue
            
            return generated_flows
        except Exception as e:
            print(f"Error generating flows: {e}")
            return []
        finally:
            self._close_services()
    
    def _convert_recommendation_to_flow(self, recommendation: Dict[str, Any]) -> PatientFlowCreate:
        """Convertir recomendación a formato PatientFlowCreate"""
        nodes = []
        edges = []
        
        # Crear nodos basados en los pasos
        for i, step in enumerate(recommendation.get("steps", [])):
            node_id = f"node-{i+1}"
            
            # Determinar tipo de nodo
            node_type = "default"
            if i == 0:
                node_type = "input"
            elif i == len(recommendation["steps"]) - 1:
                node_type = "output"
            
            # Crear nodo
            node = FlowStepNode(
                id=node_id,
                type=step.get("type", "consultation"),
                label=step.get("name", f"Paso {i+1}"),
                cost=step.get("cost", 0.0),
                duration=step.get("duration", 0),
                position={
                    "x": 250 + (i * 300),
                    "y": 200
                }
            )
            nodes.append(node)
            
            # Crear edge si no es el último nodo
            if i < len(recommendation["steps"]) - 1:
                edge = FlowEdge(
                    id=f"edge-{i+1}-{i+2}",
                    source=node_id,
                    target=f"node-{i+2}",
                    type="default"
                )
                edges.append(edge)
        
        # Crear el flujo
        flow_data = PatientFlowCreate(
            name=recommendation.get("name", "Flujo Generado"),
            description=recommendation.get("description", "Flujo generado automáticamente desde datos de Bienimed"),
            nodes=nodes,
            edges=edges,
            estimatedDuration=recommendation.get("estimated_duration", 0),
            estimatedCost=recommendation.get("estimated_cost", 0.0),
            isActive=True
        )
        
        return flow_data
    
    def generate_specialty_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos específicos por especialidad basados en datos reales"""
        try:
            # Obtener datos de analytics
            flow_analytics = self.analytics_service.get_patient_flow_analytics()
            generated_flows = []
            
            # Generar flujo para diagnósticos más comunes
            if flow_analytics.get("most_common_diagnoses"):
                top_diagnosis = list(flow_analytics["most_common_diagnoses"].keys())[0]
                frequency = flow_analytics["most_common_diagnoses"][top_diagnosis]
                
                flow_data = PatientFlowCreate(
                    name=f"Flujo Diagnóstico {top_diagnosis}",
                    description=f"Flujo optimizado para el diagnóstico más común (ID: {top_diagnosis}) con {frequency} casos",
                    nodes=[
                        FlowStepNode(
                            id="node-1",
                            type="consultation",
                            label="Consulta Inicial",
                            cost=35.0,
                            duration=20,
                            position={"x": 100, "y": 200}
                        ),
                        FlowStepNode(
                            id="node-2",
                            type="laboratory",
                            label="Exámenes de Laboratorio",
                            cost=30.0,
                            duration=15,
                            position={"x": 400, "y": 200}
                        ),
                        FlowStepNode(
                            id="node-3",
                            type="diagnosis",
                            label="Diagnóstico",
                            cost=0.0,
                            duration=10,
                            position={"x": 700, "y": 200}
                        ),
                        FlowStepNode(
                            id="node-4",
                            type="prescription",
                            label="Prescripción",
                            cost=0.0,
                            duration=5,
                            position={"x": 1000, "y": 200}
                        )
                    ],
                    edges=[
                        FlowEdge(id="edge-1", source="node-1", target="node-2"),
                        FlowEdge(id="edge-2", source="node-2", target="node-3"),
                        FlowEdge(id="edge-3", source="node-3", target="node-4")
                    ],
                    estimatedDuration=50,
                    estimatedCost=65.0,
                    isActive=True
                )
                
                try:
                    created_flow = self.flow_service.create_flow(flow_data)
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "diagnosis_based",
                        "frequency": frequency
                    })
                except Exception as e:
                    print(f"Error creating diagnosis flow: {e}")
            
            # Generar flujo para procedimientos más comunes
            if flow_analytics.get("most_common_procedures"):
                top_procedure = list(flow_analytics["most_common_procedures"].keys())[0]
                frequency = flow_analytics["most_common_procedures"][top_procedure]
                
                flow_data = PatientFlowCreate(
                    name=f"Flujo Procedimiento {top_procedure}",
                    description=f"Flujo optimizado para el procedimiento más común (ID: {top_procedure}) con {frequency} casos",
                    nodes=[
                        FlowStepNode(
                            id="node-1",
                            type="consultation",
                            label="Consulta Pre-Procedimiento",
                            cost=35.0,
                            duration=20,
                            position={"x": 100, "y": 200}
                        ),
                        FlowStepNode(
                            id="node-2",
                            type="laboratory",
                            label="Exámenes Pre-Operatorios",
                            cost=45.0,
                            duration=20,
                            position={"x": 400, "y": 200}
                        ),
                        FlowStepNode(
                            id="node-3",
                            type="procedure",
                            label="Procedimiento",
                            cost=120.0,
                            duration=60,
                            position={"x": 700, "y": 200}
                        ),
                        FlowStepNode(
                            id="node-4",
                            type="followup",
                            label="Seguimiento",
                            cost=25.0,
                            duration=15,
                            position={"x": 1000, "y": 200}
                        )
                    ],
                    edges=[
                        FlowEdge(id="edge-1", source="node-1", target="node-2"),
                        FlowEdge(id="edge-2", source="node-2", target="node-3"),
                        FlowEdge(id="edge-3", source="node-3", target="node-4")
                    ],
                    estimatedDuration=115,
                    estimatedCost=225.0,
                    isActive=True
                )
                
                try:
                    created_flow = self.flow_service.create_flow(flow_data)
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "procedure_based",
                        "frequency": frequency
                    })
                except Exception as e:
                    print(f"Error creating procedure flow: {e}")
            
            return generated_flows
        except Exception as e:
            print(f"Error generating specialty flows: {e}")
            return []
        finally:
            self._close_services()
    
    def _close_services(self):
        """Cerrar conexiones de servicios"""
        try:
            self.analytics_service._close_services()
            if self.db:
                self.db.close()
        except:
            pass



