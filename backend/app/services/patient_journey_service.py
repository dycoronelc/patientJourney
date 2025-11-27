"""
Servicio para gestión de recorridos de pacientes
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
import structlog
from datetime import datetime

from app.models.patient_flow import PatientJourney
# from app.models.order import LaboratoryOrder, ImagingOrder, Referral  # Comentado temporalmente
from app.schemas.patient_journey import PatientJourneyCreate, PatientJourneyUpdate, PatientJourneyResponse
from app.services.external_systems_service import ExternalSystemsService

logger = structlog.get_logger()

class PatientJourneyService:
    """Servicio para operaciones con recorridos de pacientes"""
    
    @staticmethod
    async def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        patient_id: Optional[str] = None,
        center_id: Optional[str] = None,
        specialty_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[PatientJourneyResponse]:
        """Obtener todos los recorridos de pacientes"""
        try:
            query = db.query(PatientJourney)
            
            if patient_id:
                query = query.filter(PatientJourney.patient_id == patient_id)
            
            if center_id:
                query = query.filter(PatientJourney.health_center_id == center_id)
            
            if specialty_id:
                query = query.filter(PatientJourney.specialty_id == specialty_id)
            
            if status:
                query = query.filter(PatientJourney.status == status)
            
            journeys = query.offset(skip).limit(limit).all()
            
            return [PatientJourneyResponse.from_orm(journey) for journey in journeys]
            
        except Exception as e:
            logger.error("Error getting patient journeys", error=str(e))
            raise
    
    @staticmethod
    async def get_by_id_with_details(db: Session, journey_id: str) -> Optional[Dict[str, Any]]:
        """Obtener recorrido de paciente con todos los detalles"""
        try:
            journey = db.query(PatientJourney).filter(PatientJourney.id == journey_id).first()
            
            if not journey:
                return None
            
            # Comentado temporalmente - requiere modelos eliminados
            # lab_orders = db.query(LaboratoryOrder).filter(
            #     LaboratoryOrder.patient_journey_id == journey_id
            # ).all()
            
            # imaging_orders = db.query(ImagingOrder).filter(
            #     ImagingOrder.patient_journey_id == journey_id
            # ).all()
            
            # referrals = db.query(Referral).filter(
            #     Referral.patient_journey_id == journey_id
            # ).all()
            
            return {
                **journey.to_dict(),
                "laboratoryOrders": [],  # [order.to_dict() for order in lab_orders],
                "imagingOrders": [],  # [order.to_dict() for order in imaging_orders],
                "referrals": []  # [ref.to_dict() for ref in referrals]
            }
            
        except Exception as e:
            logger.error("Error getting patient journey details", error=str(e))
            raise
    
    @staticmethod
    async def create(db: Session, journey: PatientJourneyCreate) -> PatientJourneyResponse:
        """Crear nuevo recorrido de paciente"""
        try:
            journey_id = str(uuid.uuid4())
            
            db_journey = PatientJourney(
                id=journey_id,
                patient_id=journey.patientId,
                health_center_id=journey.healthCenterId,
                specialty_id=journey.specialtyId,
                flow_id=journey.flowId,
                status='in_progress'
            )
            
            db.add(db_journey)
            db.commit()
            db.refresh(db_journey)
            
            logger.info("Patient journey created", journey_id=journey_id)
            
            return PatientJourneyResponse.from_orm(db_journey)
            
        except Exception as e:
            db.rollback()
            logger.error("Error creating patient journey", error=str(e))
            raise
    
    @staticmethod
    async def update(
        db: Session,
        journey_id: str,
        journey: PatientJourneyUpdate
    ) -> Optional[PatientJourneyResponse]:
        """Actualizar recorrido de paciente"""
        try:
            db_journey = db.query(PatientJourney).filter(
                PatientJourney.id == journey_id
            ).first()
            
            if not db_journey:
                return None
            
            update_data = journey.dict(exclude_unset=True)
            for field, value in update_data.items():
                snake_field = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
                if hasattr(db_journey, snake_field):
                    setattr(db_journey, snake_field, value)
            
            db_journey.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(db_journey)
            
            logger.info("Patient journey updated", journey_id=journey_id)
            
            return PatientJourneyResponse.from_orm(db_journey)
            
        except Exception as e:
            db.rollback()
            logger.error("Error updating patient journey", error=str(e))
            raise
    
    @staticmethod
    async def sync_laboratory_orders(db: Session, journey_id: str) -> Dict[str, Any]:
        """Sincronizar órdenes de laboratorio desde sistema externo"""
        try:
            journey = db.query(PatientJourney).filter(PatientJourney.id == journey_id).first()
            
            if not journey:
                return {"success": False, "message": "Journey not found"}
            
            # Consultar sistema externo (simulado)
            # En producción, usar la URL real del sistema externo
            external_url = "http://external-lis-system.com"
            
            orders = await ExternalSystemsService.fetch_laboratory_orders(
                patient_id=journey.patient_id,
                external_system_url=external_url
            )
            
            # Guardar órdenes en la base de datos
            for order_data in orders:
                # Crear o actualizar orden
                pass
            
            logger.info("Laboratory orders synced", journey_id=journey_id, count=len(orders))
            
            return {"success": True, "ordersCount": len(orders)}
            
        except Exception as e:
            logger.error("Error syncing laboratory orders", error=str(e))
            raise
    
    @staticmethod
    async def sync_imaging_orders(db: Session, journey_id: str) -> Dict[str, Any]:
        """Sincronizar órdenes de imágenes desde sistema externo"""
        try:
            journey = db.query(PatientJourney).filter(PatientJourney.id == journey_id).first()
            
            if not journey:
                return {"success": False, "message": "Journey not found"}
            
            # Consultar sistema PACS externo (simulado)
            external_url = "http://external-pacs-system.com"
            
            orders = await ExternalSystemsService.fetch_imaging_orders(
                patient_id=journey.patient_id,
                external_system_url=external_url
            )
            
            logger.info("Imaging orders synced", journey_id=journey_id, count=len(orders))
            
            return {"success": True, "ordersCount": len(orders)}
            
        except Exception as e:
            logger.error("Error syncing imaging orders", error=str(e))
            raise
    
    @staticmethod
    async def sync_referrals(db: Session, journey_id: str) -> Dict[str, Any]:
        """Sincronizar referencias desde sistema externo"""
        try:
            journey = db.query(PatientJourney).filter(PatientJourney.id == journey_id).first()
            
            if not journey:
                return {"success": False, "message": "Journey not found"}
            
            # Consultar sistema de referencias externo (simulado)
            external_url = "http://external-referral-system.com"
            
            referrals = await ExternalSystemsService.fetch_referrals(
                patient_id=journey.patient_id,
                external_system_url=external_url
            )
            
            logger.info("Referrals synced", journey_id=journey_id, count=len(referrals))
            
            return {"success": True, "referralsCount": len(referrals)}
            
        except Exception as e:
            logger.error("Error syncing referrals", error=str(e))
            raise
    
    @staticmethod
    async def get_laboratory_orders(db: Session, journey_id: str) -> List[Dict[str, Any]]:
        """Obtener órdenes de laboratorio de un recorrido"""
        try:
            # Comentado temporalmente - requiere modelos eliminados
            # orders = db.query(LaboratoryOrder).filter(
            #     LaboratoryOrder.patient_journey_id == journey_id
            # ).all()
            
            return []  # [order.to_dict() for order in orders]
            
        except Exception as e:
            logger.error("Error getting laboratory orders", error=str(e))
            raise
    
    @staticmethod
    async def get_imaging_orders(db: Session, journey_id: str) -> List[Dict[str, Any]]:
        """Obtener órdenes de imágenes de un recorrido"""
        try:
            # Comentado temporalmente - requiere modelos eliminados
            # orders = db.query(ImagingOrder).filter(
            #     ImagingOrder.patient_journey_id == journey_id
            # ).all()
            
            return []  # [order.to_dict() for order in orders]
            
        except Exception as e:
            logger.error("Error getting imaging orders", error=str(e))
            raise
    
    @staticmethod
    async def get_referrals(db: Session, journey_id: str) -> List[Dict[str, Any]]:
        """Obtener referencias de un recorrido"""
        try:
            # Comentado temporalmente - requiere modelos eliminados
            # referrals = db.query(Referral).filter(
            #     Referral.patient_journey_id == journey_id
            # ).all()
            
            return []  # [ref.to_dict() for ref in referrals]
            
        except Exception as e:
            logger.error("Error getting referrals", error=str(e))
            raise
    
    @staticmethod
    async def get_flow_diagram(db: Session, journey_id: str) -> Dict[str, Any]:
        """Obtener datos para diagrama de flujo"""
        try:
            journey = await PatientJourneyService.get_by_id_with_details(db, journey_id)
            
            if not journey:
                return {}
            
            # Construir diagrama de flujo
            return {
                "journeyId": journey_id,
                "nodes": [],  # Implementar lógica de generación de nodos
                "edges": [],  # Implementar lógica de generación de conexiones
                "metrics": {
                    "totalSteps": len(journey.get("completedSteps", [])),
                    "totalCost": journey.get("totalCost", 0),
                    "totalDuration": journey.get("totalDuration", 0)
                }
            }
            
        except Exception as e:
            logger.error("Error getting flow diagram", error=str(e))
            raise
    
    @staticmethod
    async def get_timeline(db: Session, journey_id: str) -> Dict[str, Any]:
        """Obtener timeline del recorrido"""
        try:
            journey = await PatientJourneyService.get_by_id_with_details(db, journey_id)
            
            if not journey:
                return {}
            
            # Construir timeline
            return {
                "journeyId": journey_id,
                "events": [],  # Implementar lógica de eventos
                "totalDuration": journey.get("totalDuration", 0)
            }
            
        except Exception as e:
            logger.error("Error getting timeline", error=str(e))
            raise
    
    @staticmethod
    async def get_cost_summary(db: Session, journey_id: str) -> Dict[str, Any]:
        """Obtener resumen de costos"""
        try:
            journey = db.query(PatientJourney).filter(PatientJourney.id == journey_id).first()
            
            if not journey:
                return {}
            
            return {
                "journeyId": journey_id,
                "totalCost": journey.total_cost,
                "costDetails": journey.cost_details or {},
                "costBreakdown": []  # Implementar desglose detallado
            }
            
        except Exception as e:
            logger.error("Error getting cost summary", error=str(e))
            raise










