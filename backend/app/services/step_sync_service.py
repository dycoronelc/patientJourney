"""
Servicio para sincronizar pasos del maestro con los flujos generados
"""
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.services.step_service import StepService
from app.schemas.step import StepCreate
from app.core.database import create_db_session
import uuid

class StepSyncService:
    def __init__(self):
        self.db = create_db_session()
        self.step_service = StepService(self.db)
    
    def sync_steps_from_flows(self) -> Dict[str, Any]:
        """Sincronizar pasos del maestro basándose en los flujos existentes"""
        try:
            # Obtener todos los flujos activos
            from app.services.patient_flow_service import PatientFlowService
            flow_service = PatientFlowService(self.db)
            flows = flow_service.get_flows(is_active=True)
            
            created_steps = []
            updated_steps = []
            
            for flow in flows:
                if flow.flow_steps:
                    # Procesar cada nodo del flujo
                    for node in flow.flow_steps:
                        step_data = self._extract_step_from_node(node, flow)
                        if step_data:
                            # Verificar si el paso ya existe
                            existing_step = self._find_existing_step(step_data)
                            
                            if existing_step:
                                # Actualizar paso existente si es necesario
                                updated_step = self._update_existing_step(existing_step, step_data)
                                if updated_step:
                                    updated_steps.append(updated_step)
                            else:
                                # Crear nuevo paso
                                new_step = self._create_new_step(step_data)
                                if new_step:
                                    created_steps.append(new_step)
            
            return {
                "message": f"Sincronización completada: {len(created_steps)} pasos creados, {len(updated_steps)} pasos actualizados",
                "created_steps": created_steps,
                "updated_steps": updated_steps,
                "total_created": len(created_steps),
                "total_updated": len(updated_steps)
            }
            
        except Exception as e:
            print(f"Error syncing steps from flows: {e}")
            return {
                "message": f"Error en sincronización: {str(e)}",
                "created_steps": [],
                "updated_steps": [],
                "total_created": 0,
                "total_updated": 0
            }
        finally:
            if self.db:
                self.db.close()
    
    def _extract_step_from_node(self, node: Dict, flow: Any) -> Optional[Dict]:
        """Extraer información de paso desde un nodo de flujo"""
        try:
            step_type = node.get('type', 'unknown')
            label = node.get('label', 'Paso sin nombre')
            cost = node.get('cost', 0.0)
            duration = node.get('duration', 0)
            
            # Mapear tipos de nodo a categorías de pasos
            category_mapping = {
                'consultation': 'Consulta',
                'laboratory': 'Laboratorio',
                'imaging': 'Imágenes',
                'diagnosis': 'Diagnóstico',
                'prescription': 'Tratamiento',
                'followup': 'Seguimiento',
                'emergency': 'Emergencia',
                'procedure': 'Procedimiento',
                'referral': 'Referencia',
                'discharge': 'Alta'
            }
            
            category = category_mapping.get(step_type, 'General')
            
            # Mapear tipos a iconos
            icon_mapping = {
                'consultation': 'Person',
                'laboratory': 'Science',
                'imaging': 'Assignment',
                'diagnosis': 'LocalHospital',
                'prescription': 'Medication',
                'followup': 'Schedule',
                'emergency': 'Emergency',
                'procedure': 'MedicalServices',
                'referral': 'TransferWithinAStation',
                'discharge': 'CheckCircle'
            }
            
            icon = icon_mapping.get(step_type, 'Help')
            
            # Mapear tipos a colores
            color_mapping = {
                'consultation': '#1976d2',
                'laboratory': '#dc004e',
                'imaging': '#2e7d32',
                'diagnosis': '#ed6c02',
                'prescription': '#9c27b0',
                'followup': '#00bcd4',
                'emergency': '#f44336',
                'procedure': '#ff9800',
                'referral': '#795548',
                'discharge': '#4caf50'
            }
            
            color = color_mapping.get(step_type, '#757575')
            
            return {
                'name': label,
                'description': f"Paso de {step_type} extraído del flujo {flow.name}",
                'step_type': step_type,
                'base_cost': cost,
                'cost_unit': 'USD',
                'duration_minutes': duration,
                'icon': icon,
                'color': color,
                'is_active': True,
                'category': category,
                'tags': [step_type, category, 'auto-generated']
            }
            
        except Exception as e:
            print(f"Error extracting step from node: {e}")
            return None
    
    def _find_existing_step(self, step_data: Dict) -> Optional[Any]:
        """Buscar si ya existe un paso similar"""
        try:
            # Buscar por nombre exacto
            existing_steps = self.step_service.get_steps()
            for step in existing_steps:
                if step.name.lower() == step_data['name'].lower():
                    return step
            
            # Si no se encuentra por nombre, buscar por tipo y categoría
            for step in existing_steps:
                if (step.step_type == step_data['step_type'] and 
                    step.category == step_data['category']):
                    return step
            
            return None
            
        except Exception as e:
            print(f"Error finding existing step: {e}")
            return None
    
    def _create_new_step(self, step_data: Dict) -> Optional[Dict]:
        """Crear un nuevo paso en el maestro"""
        try:
            step_create = StepCreate(**step_data)
            created_step = self.step_service.create_step(step_create)
            
            return {
                'id': str(created_step.id),
                'name': created_step.name,
                'type': created_step.step_type,
                'category': created_step.category,
                'cost': created_step.base_cost,
                'duration': created_step.duration_minutes
            }
            
        except Exception as e:
            print(f"Error creating new step: {e}")
            return None
    
    def _update_existing_step(self, existing_step: Any, step_data: Dict) -> Optional[Dict]:
        """Actualizar un paso existente si es necesario"""
        try:
            # Solo actualizar si hay diferencias significativas
            needs_update = False
            
            if existing_step.base_cost != step_data['base_cost']:
                existing_step.base_cost = step_data['base_cost']
                needs_update = True
            
            if existing_step.duration_minutes != step_data['duration_minutes']:
                existing_step.duration_minutes = step_data['duration_minutes']
                needs_update = True
            
            if needs_update:
                updated_step = self.step_service.update_step(str(existing_step.id), {
                    'base_cost': step_data['base_cost'],
                    'duration_minutes': step_data['duration_minutes']
                })
                
                return {
                    'id': str(updated_step.id),
                    'name': updated_step.name,
                    'type': updated_step.step_type,
                    'category': updated_step.category,
                    'cost': updated_step.base_cost,
                    'duration': updated_step.duration_minutes
                }
            
            return None
            
        except Exception as e:
            print(f"Error updating existing step: {e}")
            return None
    
    def create_diagnosis_specific_steps(self, diagnosis_list: List[Dict]) -> Dict[str, Any]:
        """Crear pasos específicos para diagnósticos CIE-10"""
        try:
            created_steps = []
            
            for diagnosis in diagnosis_list:
                # Crear paso de diagnóstico específico
                diagnosis_step = {
                    'name': f"Diagnóstico {diagnosis['display_name']}",
                    'description': f"Diagnóstico específico para {diagnosis['display_name']}",
                    'step_type': 'diagnosis',
                    'base_cost': 0.0,
                    'cost_unit': 'USD',
                    'duration_minutes': 15,
                    'icon': 'LocalHospital',
                    'color': '#ed6c02',
                    'is_active': True,
                    'category': 'Diagnóstico',
                    'tags': ['diagnosis', 'cie10', diagnosis['codigo'], 'auto-generated']
                }
                
                # Verificar si ya existe
                existing_step = self._find_existing_step(diagnosis_step)
                
                if not existing_step:
                    new_step = self._create_new_step(diagnosis_step)
                    if new_step:
                        created_steps.append(new_step)
            
            return {
                "message": f"Se crearon {len(created_steps)} pasos específicos de diagnósticos",
                "created_steps": created_steps,
                "total_created": len(created_steps)
            }
            
        except Exception as e:
            print(f"Error creating diagnosis specific steps: {e}")
            return {
                "message": f"Error creando pasos de diagnósticos: {str(e)}",
                "created_steps": [],
                "total_created": 0
            }
