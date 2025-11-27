from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.step import Step, FlowStep
from app.schemas.step import StepCreate, StepUpdate, FlowStepCreate, FlowStepUpdate
import uuid


class StepService:
    def __init__(self, db: Session):
        self.db = db

    # Métodos para Steps
    def create_step(self, step_data: StepCreate) -> Step:
        """Crear un nuevo paso"""
        db_step = Step(
            id=str(uuid.uuid4()),
            name=step_data.name,
            description=step_data.description,
            step_type=step_data.step_type,
            base_cost=step_data.base_cost,
            cost_unit=step_data.cost_unit,
            duration_minutes=step_data.duration_minutes,
            icon=step_data.icon,
            color=step_data.color,
            is_active=step_data.is_active,
            category=step_data.category,
            tags=",".join(step_data.tags) if step_data.tags else None,
        )
        
        self.db.add(db_step)
        self.db.commit()
        self.db.refresh(db_step)
        return db_step

    def get_step(self, step_id: str) -> Optional[Step]:
        """Obtener un paso por ID"""
        return self.db.query(Step).filter(Step.id == step_id).first()

    def get_steps(
        self, 
        skip: int = 0, 
        limit: int = 100,
        step_type: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[Step]:
        """Obtener lista de pasos con filtros"""
        query = self.db.query(Step)
        
        if step_type:
            query = query.filter(Step.step_type == step_type)
        if category:
            query = query.filter(Step.category == category)
        if is_active is not None:
            query = query.filter(Step.is_active == is_active)
            
        return query.offset(skip).limit(limit).all()

    def update_step(self, step_id: str, step_data: StepUpdate) -> Optional[Step]:
        """Actualizar un paso"""
        db_step = self.get_step(step_id)
        if not db_step:
            return None
            
        update_data = step_data.dict(exclude_unset=True)
        
        # Manejar tags
        if 'tags' in update_data and update_data['tags'] is not None:
            update_data['tags'] = ",".join(update_data['tags'])
        
        for field, value in update_data.items():
            setattr(db_step, field, value)
            
        self.db.commit()
        self.db.refresh(db_step)
        return db_step

    def delete_step(self, step_id: str) -> bool:
        """Eliminar un paso"""
        db_step = self.get_step(step_id)
        if not db_step:
            return False
            
        # Verificar si el paso está siendo usado en algún flujo
        flow_steps_count = self.db.query(FlowStep).filter(FlowStep.step_id == step_id).count()
        if flow_steps_count > 0:
            raise ValueError(f"No se puede eliminar el paso '{db_step.name}' porque está siendo usado en {flow_steps_count} flujo(s)")
            
        self.db.delete(db_step)
        self.db.commit()
        return True

    def get_steps_by_type(self, step_type: str) -> List[Step]:
        """Obtener pasos por tipo"""
        return self.db.query(Step).filter(
            and_(Step.step_type == step_type, Step.is_active == True)
        ).all()

    def get_step_categories(self) -> List[str]:
        """Obtener todas las categorías de pasos"""
        categories = self.db.query(Step.category).filter(
            and_(Step.category.isnot(None), Step.is_active == True)
        ).distinct().all()
        return [cat[0] for cat in categories if cat[0]]

    # Métodos para FlowSteps
    def create_flow_step(self, flow_step_data: FlowStepCreate) -> FlowStep:
        """Crear una relación flujo-paso"""
        import json
        
        db_flow_step = FlowStep(
            id=str(uuid.uuid4()),
            flow_id=flow_step_data.flow_id,
            step_id=flow_step_data.step_id,
            order_index=flow_step_data.order_index,
            custom_name=flow_step_data.custom_name,
            custom_cost=flow_step_data.custom_cost,
            custom_description=flow_step_data.custom_description,
            next_step_ids=json.dumps(flow_step_data.next_step_ids) if flow_step_data.next_step_ids else None,
            previous_step_ids=json.dumps(flow_step_data.previous_step_ids) if flow_step_data.previous_step_ids else None,
            position_x=flow_step_data.position_x,
            position_y=flow_step_data.position_y,
        )
        
        self.db.add(db_flow_step)
        self.db.commit()
        self.db.refresh(db_flow_step)
        return db_flow_step

    def get_flow_steps(self, flow_id: str) -> List[FlowStep]:
        """Obtener todos los pasos de un flujo ordenados por order_index"""
        return self.db.query(FlowStep).filter(
            FlowStep.flow_id == flow_id
        ).order_by(FlowStep.order_index).all()

    def update_flow_step(self, flow_step_id: str, flow_step_data: FlowStepUpdate) -> Optional[FlowStep]:
        """Actualizar una relación flujo-paso"""
        db_flow_step = self.db.query(FlowStep).filter(FlowStep.id == flow_step_id).first()
        if not db_flow_step:
            return None
            
        update_data = flow_step_data.dict(exclude_unset=True)
        
        # Manejar listas JSON
        for field in ['next_step_ids', 'previous_step_ids']:
            if field in update_data and update_data[field] is not None:
                update_data[field] = json.dumps(update_data[field])
        
        for field, value in update_data.items():
            setattr(db_flow_step, field, value)
            
        self.db.commit()
        self.db.refresh(db_flow_step)
        return db_flow_step

    def delete_flow_step(self, flow_step_id: str) -> bool:
        """Eliminar una relación flujo-paso"""
        db_flow_step = self.db.query(FlowStep).filter(FlowStep.id == flow_step_id).first()
        if not db_flow_step:
            return False
            
        self.db.delete(db_flow_step)
        self.db.commit()
        return True

    def reorder_flow_steps(self, flow_id: str, step_orders: List[dict]) -> bool:
        """Reordenar los pasos de un flujo"""
        try:
            for step_order in step_orders:
                flow_step_id = step_order['flow_step_id']
                new_order = step_order['order_index']
                
                db_flow_step = self.db.query(FlowStep).filter(
                    and_(FlowStep.id == flow_step_id, FlowStep.flow_id == flow_id)
                ).first()
                
                if db_flow_step:
                    db_flow_step.order_index = new_order
                    
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise e

    # Métodos de utilidad
    def create_default_steps(self) -> List[Step]:
        """Crear pasos por defecto del sistema"""
        default_steps = [
            {
                "name": "Consulta General",
                "description": "Consulta médica general con evaluación inicial del paciente",
                "step_type": "consultation",
                "base_cost": 35.0,
                "duration_minutes": 20,
                "icon": "Person",
                "color": "#1976d2",
                "category": "Consulta",
                "tags": ["general", "evaluacion", "consulta"]
            },
            {
                "name": "Perfil Lipídico",
                "description": "Estudio de laboratorio para evaluar lípidos en sangre",
                "step_type": "laboratory",
                "base_cost": 42.5,
                "duration_minutes": 0,
                "icon": "Science",
                "color": "#dc004e",
                "category": "Laboratorio",
                "tags": ["laboratorio", "sangre", "lipidos"]
            },
            {
                "name": "Electrocardiograma",
                "description": "Estudio de imagen para evaluar la actividad eléctrica del corazón",
                "step_type": "imaging",
                "base_cost": 35.0,
                "duration_minutes": 15,
                "icon": "Assignment",
                "color": "#2e7d32",
                "category": "Imágenes",
                "tags": ["corazon", "ecg", "electrocardiograma"]
            },
            {
                "name": "Referencia Cardiólogo",
                "description": "Referencia a especialista en cardiología",
                "step_type": "referral",
                "base_cost": 120.0,
                "duration_minutes": 30,
                "icon": "LocalHospital",
                "color": "#ed6c02",
                "category": "Referencia",
                "tags": ["cardiologia", "especialista", "referencia"]
            },
            {
                "name": "Alta del Paciente",
                "description": "Alta médica con prescripción y seguimiento",
                "step_type": "discharge",
                "base_cost": 0.0,
                "duration_minutes": 10,
                "icon": "CheckCircle",
                "color": "#2e7d32",
                "category": "Alta",
                "tags": ["alta", "prescripcion", "seguimiento"]
            },
            {
                "name": "Exámenes Básicos",
                "description": "Hemograma completo y química sanguínea básica",
                "step_type": "laboratory",
                "base_cost": 30.0,
                "duration_minutes": 0,
                "icon": "Science",
                "color": "#dc004e",
                "category": "Laboratorio",
                "tags": ["hemograma", "quimica", "basico"]
            },
            {
                "name": "Estudios Hormonales",
                "description": "TSH, T3, T4 y glucosa para evaluación endocrinológica",
                "step_type": "laboratory",
                "base_cost": 55.5,
                "duration_minutes": 0,
                "icon": "Science",
                "color": "#dc004e",
                "category": "Laboratorio",
                "tags": ["hormonas", "tsh", "glucosa"]
            },
            {
                "name": "Densitometría Ósea",
                "description": "Estudio para evaluar densidad mineral ósea",
                "step_type": "imaging",
                "base_cost": 85.0,
                "duration_minutes": 30,
                "icon": "Assignment",
                "color": "#2e7d32",
                "category": "Imágenes",
                "tags": ["huesos", "osteoporosis", "densidad"]
            },
            {
                "name": "Perfil Metabólico",
                "description": "Estudio completo del metabolismo para pacientes geriátricos",
                "step_type": "laboratory",
                "base_cost": 65.0,
                "duration_minutes": 0,
                "icon": "Science",
                "color": "#dc004e",
                "category": "Laboratorio",
                "tags": ["metabolismo", "geriatrico", "completo"]
            },
            {
                "name": "Consulta Endocrinología",
                "description": "Consulta especializada en endocrinología",
                "step_type": "consultation",
                "base_cost": 70.0,
                "duration_minutes": 25,
                "icon": "Person",
                "color": "#1976d2",
                "category": "Consulta",
                "tags": ["endocrinologia", "especialista", "hormonas"]
            },
            {
                "name": "Referencias Múltiples",
                "description": "Referencias a múltiples especialistas",
                "step_type": "referral",
                "base_cost": 195.0,
                "duration_minutes": 45,
                "icon": "LocalHospital",
                "color": "#ed6c02",
                "category": "Referencia",
                "tags": ["multiple", "especialistas", "geriatrico"]
            }
        ]

        created_steps = []
        for step_data in default_steps:
            # Verificar si ya existe
            existing_step = self.db.query(Step).filter(Step.name == step_data["name"]).first()
            if not existing_step:
                step_create = StepCreate(**step_data)
                created_step = self.create_step(step_create)
                created_steps.append(created_step)
            else:
                created_steps.append(existing_step)

        return created_steps










