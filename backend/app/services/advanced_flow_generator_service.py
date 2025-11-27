"""
Servicio avanzado para generar múltiples flujos basados en datos de Bienimed
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

class AdvancedFlowGeneratorService:
    def __init__(self):
        self.analytics_service = BienimedAnalyticsService()
        self.db = create_db_session()
        self.flow_service = PatientFlowService(self.db)
        self.bienimed_db = next(get_bienimed_db())
        self.catalog_service = CatalogService(self.bienimed_db)
    
    def generate_comprehensive_flows(self) -> List[Dict[str, Any]]:
        """Generar un conjunto completo de flujos basados en datos reales"""
        try:
            generated_flows = []
            
            # 1. Generar flujos por diagnósticos más comunes
            diagnosis_flows = self._generate_diagnosis_flows()
            generated_flows.extend(diagnosis_flows)
            
            # 2. Generar flujos por procedimientos más comunes
            procedure_flows = self._generate_procedure_flows()
            generated_flows.extend(procedure_flows)
            
            # 3. Generar flujos por especialidades (referencias)
            referral_flows = self._generate_referral_flows()
            generated_flows.extend(referral_flows)
            
            # 4. Generar flujos de laboratorio
            lab_flows = self._generate_laboratory_flows()
            generated_flows.extend(lab_flows)
            
            # 5. Generar flujos de imagenología
            imaging_flows = self._generate_imaging_flows()
            generated_flows.extend(imaging_flows)
            
            # 6. Generar flujos de emergencia
            emergency_flows = self._generate_emergency_flows()
            generated_flows.extend(emergency_flows)
            
            return generated_flows
        except Exception as e:
            print(f"Error generating comprehensive flows: {e}")
            return []
        finally:
            self._close_services()
    
    def _generate_diagnosis_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos para los diagnósticos más comunes"""
        try:
            flow_analytics = self.analytics_service.get_patient_flow_analytics()
            most_common = flow_analytics.get("most_common_diagnoses", {})
            generated_flows = []
            
            # Tomar los top 3 diagnósticos
            top_diagnoses = list(most_common.items())[:3]
            
            for diagnosis_id, frequency in top_diagnoses:
                flow_data = self._create_diagnosis_flow(diagnosis_id, frequency)
                
                try:
                    created_flow = self.flow_service.create_flow(flow_data)
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "diagnosis_based",
                        "frequency": frequency,
                        "estimated_cost": created_flow.estimated_cost,
                        "estimated_duration": created_flow.average_duration
                    })
                except Exception as e:
                    print(f"Error creating diagnosis flow {diagnosis_id}: {e}")
                    continue
            
            return generated_flows
        except Exception as e:
            print(f"Error generating diagnosis flows: {e}")
            return []
    
    def _generate_procedure_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos para los procedimientos más comunes"""
        try:
            flow_analytics = self.analytics_service.get_patient_flow_analytics()
            most_common = flow_analytics.get("most_common_procedures", {})
            generated_flows = []
            
            # Tomar los top 3 procedimientos
            top_procedures = list(most_common.items())[:3]
            
            for procedure_id, frequency in top_procedures:
                flow_data = self._create_procedure_flow(procedure_id, frequency)
                
                try:
                    created_flow = self.flow_service.create_flow(flow_data)
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "procedure_based",
                        "frequency": frequency,
                        "estimated_cost": created_flow.estimated_cost,
                        "estimated_duration": created_flow.average_duration
                    })
                except Exception as e:
                    print(f"Error creating procedure flow {procedure_id}: {e}")
                    continue
            
            return generated_flows
        except Exception as e:
            print(f"Error generating procedure flows: {e}")
            return []
    
    def _generate_referral_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos para las especialidades más referidas"""
        try:
            flow_analytics = self.analytics_service.get_patient_flow_analytics()
            most_common = flow_analytics.get("most_common_referrals", {})
            generated_flows = []
            
            # Tomar las top 3 especialidades
            top_referrals = list(most_common.items())[:3]
            
            for specialty_id, frequency in top_referrals:
                flow_data = self._create_referral_flow(specialty_id, frequency)
                
                try:
                    created_flow = self.flow_service.create_flow(flow_data)
                    generated_flows.append({
                        "id": created_flow.id,
                        "name": created_flow.name,
                        "type": "referral_based",
                        "frequency": frequency,
                        "estimated_cost": created_flow.estimated_cost,
                        "estimated_duration": created_flow.average_duration
                    })
                except Exception as e:
                    print(f"Error creating referral flow {specialty_id}: {e}")
                    continue
            
            return generated_flows
        except Exception as e:
            print(f"Error generating referral flows: {e}")
            return []
    
    def _generate_laboratory_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos específicos para laboratorio"""
        try:
            flow_data = self._create_laboratory_flow()
            created_flow = self.flow_service.create_flow(flow_data)
            
            return [{
                "id": created_flow.id,
                "name": created_flow.name,
                "type": "laboratory_based",
                "frequency": 100,  # Basado en lab_orders_count
                "estimated_cost": created_flow.estimated_cost,
                "estimated_duration": created_flow.average_duration
            }]
        except Exception as e:
            print(f"Error generating laboratory flow: {e}")
            return []
    
    def _generate_imaging_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos específicos para imagenología"""
        try:
            flow_data = self._create_imaging_flow()
            created_flow = self.flow_service.create_flow(flow_data)
            
            return [{
                "id": created_flow.id,
                "name": created_flow.name,
                "type": "imaging_based",
                "frequency": 63,  # Basado en imaging_orders_count
                "estimated_cost": created_flow.estimated_cost,
                "estimated_duration": created_flow.average_duration
            }]
        except Exception as e:
            print(f"Error generating imaging flow: {e}")
            return []
    
    def _generate_emergency_flows(self) -> List[Dict[str, Any]]:
        """Generar flujos de emergencia basados en patrones comunes"""
        try:
            flow_data = self._create_emergency_flow()
            created_flow = self.flow_service.create_flow(flow_data)
            
            return [{
                "id": created_flow.id,
                "name": created_flow.name,
                "type": "emergency_based",
                "frequency": 25,  # Estimado basado en facturas
                "estimated_cost": created_flow.estimated_cost,
                "estimated_duration": created_flow.average_duration
            }]
        except Exception as e:
            print(f"Error generating emergency flow: {e}")
            return []
    
    def _create_diagnosis_flow(self, diagnosis_id: str, frequency: int) -> PatientFlowCreate:
        """Crear flujo para un diagnóstico específico"""
        # Obtener nombre real del diagnóstico
        diagnosis_name = self.catalog_service.get_diagnosis_name(int(diagnosis_id))
        diagnosis_display = diagnosis_name if diagnosis_name else f"Diagnóstico {diagnosis_id}"
        
        return PatientFlowCreate(
            name=f"Flujo {diagnosis_display}",
            description=f"Flujo optimizado para {diagnosis_display} con {frequency} casos registrados",
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
                    label="Exámenes Diagnósticos",
                    cost=40.0,
                    duration=25,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id="node-3",
                    type="diagnosis",
                    label=diagnosis_display,
                    cost=0.0,
                    duration=15,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id="node-4",
                    type="prescription",
                    label="Tratamiento",
                    cost=0.0,
                    duration=10,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id="node-5",
                    type="followup",
                    label="Seguimiento",
                    cost=25.0,
                    duration=15,
                    position={"x": 1300, "y": 200}
                )
            ],
            edges=[
                FlowEdge(id="edge-1", source="node-1", target="node-2"),
                FlowEdge(id="edge-2", source="node-2", target="node-3"),
                FlowEdge(id="edge-3", source="node-3", target="node-4"),
                FlowEdge(id="edge-4", source="node-4", target="node-5")
            ],
            estimatedDuration=85,
            estimatedCost=100.0,
            isActive=True
        )
    
    def _create_procedure_flow(self, procedure_id: str, frequency: int) -> PatientFlowCreate:
        """Crear flujo para un procedimiento específico"""
        # Obtener nombre real del procedimiento
        procedure_name = self.catalog_service.get_procedure_name(int(procedure_id))
        procedure_display = procedure_name[:50] + "..." if procedure_name and len(procedure_name) > 50 else procedure_name or f"Procedimiento {procedure_id}"
        
        return PatientFlowCreate(
            name=f"Flujo {procedure_display}",
            description=f"Flujo optimizado para {procedure_display} con {frequency} casos registrados",
            nodes=[
                FlowStepNode(
                    id="node-1",
                    type="consultation",
                    label="Evaluación Pre-Procedimiento",
                    cost=45.0,
                    duration=30,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id="node-2",
                    type="laboratory",
                    label="Exámenes Pre-Operatorios",
                    cost=55.0,
                    duration=30,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id="node-3",
                    type="imaging",
                    label="Estudios de Imagen",
                    cost=80.0,
                    duration=45,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id="node-4",
                    type="procedure",
                    label=procedure_display,
                    cost=150.0,
                    duration=90,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id="node-5",
                    type="followup",
                    label="Recuperación y Seguimiento",
                    cost=35.0,
                    duration=30,
                    position={"x": 1300, "y": 200}
                )
            ],
            edges=[
                FlowEdge(id="edge-1", source="node-1", target="node-2"),
                FlowEdge(id="edge-2", source="node-2", target="node-3"),
                FlowEdge(id="edge-3", source="node-3", target="node-4"),
                FlowEdge(id="edge-4", source="node-4", target="node-5")
            ],
            estimatedDuration=225,
            estimatedCost=365.0,
            isActive=True
        )
    
    def _create_referral_flow(self, specialty_id: str, frequency: int) -> PatientFlowCreate:
        """Crear flujo para una especialidad específica"""
        # Obtener nombre real de la especialidad
        specialty_name = self.catalog_service.get_specialty_name(int(specialty_id))
        specialty_display = specialty_name if specialty_name else f"Especialidad {specialty_id}"
        
        return PatientFlowCreate(
            name=f"Flujo Referencia {specialty_display}",
            description=f"Flujo optimizado para referencias a {specialty_display} con {frequency} casos",
            nodes=[
                FlowStepNode(
                    id="node-1",
                    type="consultation",
                    label="Consulta General",
                    cost=35.0,
                    duration=25,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id="node-2",
                    type="laboratory",
                    label="Exámenes Básicos",
                    cost=30.0,
                    duration=20,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id="node-3",
                    type="referral",
                    label=f"Referencia {specialty_display}",
                    cost=0.0,
                    duration=10,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id="node-4",
                    type="consultation",
                    label=f"Consulta {specialty_display}",
                    cost=85.0,
                    duration=40,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id="node-5",
                    type="followup",
                    label="Seguimiento",
                    cost=30.0,
                    duration=20,
                    position={"x": 1300, "y": 200}
                )
            ],
            edges=[
                FlowEdge(id="edge-1", source="node-1", target="node-2"),
                FlowEdge(id="edge-2", source="node-2", target="node-3"),
                FlowEdge(id="edge-3", source="node-3", target="node-4"),
                FlowEdge(id="edge-4", source="node-4", target="node-5")
            ],
            estimatedDuration=115,
            estimatedCost=180.0,
            isActive=True
        )
    
    def _create_laboratory_flow(self) -> PatientFlowCreate:
        """Crear flujo específico para laboratorio"""
        return PatientFlowCreate(
            name="Flujo Laboratorio Completo",
            description="Flujo optimizado para estudios de laboratorio basado en 100 órdenes registradas",
            nodes=[
                FlowStepNode(
                    id="node-1",
                    type="consultation",
                    label="Consulta y Solicitud",
                    cost=35.0,
                    duration=15,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id="node-2",
                    type="laboratory",
                    label="Toma de Muestras",
                    cost=20.0,
                    duration=10,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id="node-3",
                    type="laboratory",
                    label="Procesamiento",
                    cost=0.0,
                    duration=60,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id="node-4",
                    type="diagnosis",
                    label="Interpretación",
                    cost=25.0,
                    duration=20,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id="node-5",
                    type="consultation",
                    label="Entrega de Resultados",
                    cost=30.0,
                    duration=15,
                    position={"x": 1300, "y": 200}
                )
            ],
            edges=[
                FlowEdge(id="edge-1", source="node-1", target="node-2"),
                FlowEdge(id="edge-2", source="node-2", target="node-3"),
                FlowEdge(id="edge-3", source="node-3", target="node-4"),
                FlowEdge(id="edge-4", source="node-4", target="node-5")
            ],
            estimatedDuration=120,
            estimatedCost=110.0,
            isActive=True
        )
    
    def _create_imaging_flow(self) -> PatientFlowCreate:
        """Crear flujo específico para imagenología"""
        return PatientFlowCreate(
            name="Flujo Imagenología Completo",
            description="Flujo optimizado para estudios de imagen basado en 63 órdenes registradas",
            nodes=[
                FlowStepNode(
                    id="node-1",
                    type="consultation",
                    label="Evaluación y Solicitud",
                    cost=35.0,
                    duration=20,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id="node-2",
                    type="laboratory",
                    label="Preparación",
                    cost=15.0,
                    duration=15,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id="node-3",
                    type="imaging",
                    label="Estudio de Imagen",
                    cost=120.0,
                    duration=45,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id="node-4",
                    type="diagnosis",
                    label="Interpretación Radiológica",
                    cost=50.0,
                    duration=30,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id="node-5",
                    type="consultation",
                    label="Entrega de Resultados",
                    cost=30.0,
                    duration=15,
                    position={"x": 1300, "y": 200}
                )
            ],
            edges=[
                FlowEdge(id="edge-1", source="node-1", target="node-2"),
                FlowEdge(id="edge-2", source="node-2", target="node-3"),
                FlowEdge(id="edge-3", source="node-3", target="node-4"),
                FlowEdge(id="edge-4", source="node-4", target="node-5")
            ],
            estimatedDuration=125,
            estimatedCost=250.0,
            isActive=True
        )
    
    def _create_emergency_flow(self) -> PatientFlowCreate:
        """Crear flujo de emergencia"""
        return PatientFlowCreate(
            name="Flujo de Emergencia",
            description="Flujo optimizado para casos de emergencia basado en patrones de facturación",
            nodes=[
                FlowStepNode(
                    id="node-1",
                    type="emergency",
                    label="Triaje de Emergencia",
                    cost=50.0,
                    duration=5,
                    position={"x": 100, "y": 200}
                ),
                FlowStepNode(
                    id="node-2",
                    type="consultation",
                    label="Evaluación Médica",
                    cost=75.0,
                    duration=15,
                    position={"x": 400, "y": 200}
                ),
                FlowStepNode(
                    id="node-3",
                    type="laboratory",
                    label="Exámenes Urgentes",
                    cost=60.0,
                    duration=20,
                    position={"x": 700, "y": 200}
                ),
                FlowStepNode(
                    id="node-4",
                    type="imaging",
                    label="Estudios de Urgencia",
                    cost=150.0,
                    duration=30,
                    position={"x": 1000, "y": 200}
                ),
                FlowStepNode(
                    id="node-5",
                    type="procedure",
                    label="Intervención",
                    cost=200.0,
                    duration=60,
                    position={"x": 1300, "y": 200}
                ),
                FlowStepNode(
                    id="node-6",
                    type="followup",
                    label="Estabilización",
                    cost=40.0,
                    duration=20,
                    position={"x": 1600, "y": 200}
                )
            ],
            edges=[
                FlowEdge(id="edge-1", source="node-1", target="node-2"),
                FlowEdge(id="edge-2", source="node-2", target="node-3"),
                FlowEdge(id="edge-3", source="node-3", target="node-4"),
                FlowEdge(id="edge-4", source="node-4", target="node-5"),
                FlowEdge(id="edge-5", source="node-5", target="node-6")
            ],
            estimatedDuration=150,
            estimatedCost=575.0,
            isActive=True
        )
    
    def _close_services(self):
        """Cerrar conexiones de servicios"""
        try:
            self.analytics_service._close_services()
            if self.db:
                self.db.close()
            if self.bienimed_db:
                self.bienimed_db.close()
        except:
            pass
