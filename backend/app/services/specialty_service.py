"""
Servicio para gestión de especialidades médicas
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import uuid
import structlog
from datetime import datetime

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate, SpecialtyResponse

logger = structlog.get_logger()

class SpecialtyService:
    """Servicio para operaciones con especialidades"""
    
    @staticmethod
    async def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> List[SpecialtyResponse]:
        """Obtener todas las especialidades con filtros"""
        try:
            query = db.query(Specialty).filter(Specialty.is_active == True)
            
            if search:
                query = query.filter(
                    or_(
                        Specialty.name.ilike(f"%{search}%"),
                        Specialty.description.ilike(f"%{search}%")
                    )
                )
            
            specialties = query.offset(skip).limit(limit).all()
            
            return [SpecialtyResponse.from_orm(specialty) for specialty in specialties]
            
        except Exception as e:
            logger.error("Error getting specialties", error=str(e))
            raise
    
    @staticmethod
    async def get_by_id(db: Session, specialty_id: str) -> Optional[SpecialtyResponse]:
        """Obtener especialidad por ID"""
        try:
            specialty = db.query(Specialty).filter(
                Specialty.id == specialty_id,
                Specialty.is_active == True
            ).first()
            
            if not specialty:
                return None
                
            return SpecialtyResponse.from_orm(specialty)
            
        except Exception as e:
            logger.error("Error getting specialty by ID", error=str(e))
            raise
    
    @staticmethod
    async def create(db: Session, specialty: SpecialtyCreate) -> SpecialtyResponse:
        """Crear nueva especialidad"""
        try:
            # Generar ID único
            specialty_id = str(uuid.uuid4())
            
            # Crear instancia del modelo
            db_specialty = Specialty(
                id=specialty_id,
                name=specialty.name,
                description=specialty.description,
                common_tests=specialty.commonTests,
                typical_medications=specialty.typicalMedications,
                icd10_codes=specialty.icd10Codes,
                cpt_codes=specialty.cptCodes,
                average_consultation_time=specialty.averageConsultationTime,
                resource_requirements=specialty.resourceRequirements,
                patient_flow=specialty.patientFlow,
                is_active=True
            )
            
            # Guardar en base de datos
            db.add(db_specialty)
            db.commit()
            db.refresh(db_specialty)
            
            logger.info("Specialty created", specialty_id=specialty_id, name=specialty.name)
            
            return SpecialtyResponse.from_orm(db_specialty)
            
        except Exception as e:
            db.rollback()
            logger.error("Error creating specialty", error=str(e))
            raise
    
    @staticmethod
    async def update(
        db: Session,
        specialty_id: str,
        specialty: SpecialtyUpdate
    ) -> Optional[SpecialtyResponse]:
        """Actualizar especialidad"""
        try:
            # Buscar especialidad existente
            db_specialty = db.query(Specialty).filter(
                Specialty.id == specialty_id,
                Specialty.is_active == True
            ).first()
            
            if not db_specialty:
                return None
            
            # Actualizar campos
            update_data = specialty.dict(exclude_unset=True)
            for field, value in update_data.items():
                # Mapear campos de snake_case a camelCase
                if field == "commonTests":
                    db_specialty.common_tests = value
                elif field == "typicalMedications":
                    db_specialty.typical_medications = value
                elif field == "icd10Codes":
                    db_specialty.icd10_codes = value
                elif field == "cptCodes":
                    db_specialty.cpt_codes = value
                elif field == "averageConsultationTime":
                    db_specialty.average_consultation_time = value
                elif field == "resourceRequirements":
                    db_specialty.resource_requirements = value
                elif field == "patientFlow":
                    db_specialty.patient_flow = value
                else:
                    setattr(db_specialty, field, value)
            
            # Actualizar timestamp
            db_specialty.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(db_specialty)
            
            logger.info("Specialty updated", specialty_id=specialty_id)
            
            return SpecialtyResponse.from_orm(db_specialty)
            
        except Exception as e:
            db.rollback()
            logger.error("Error updating specialty", error=str(e))
            raise
    
    @staticmethod
    async def delete(db: Session, specialty_id: str) -> bool:
        """Eliminar especialidad (soft delete)"""
        try:
            # Buscar especialidad
            db_specialty = db.query(Specialty).filter(
                Specialty.id == specialty_id,
                Specialty.is_active == True
            ).first()
            
            if not db_specialty:
                return False
            
            # Soft delete
            db_specialty.is_active = False
            db_specialty.updated_at = datetime.utcnow()
            
            db.commit()
            
            logger.info("Specialty deleted", specialty_id=specialty_id)
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error("Error deleting specialty", error=str(e))
            raise
    
    @staticmethod
    async def get_by_name(db: Session, name: str) -> Optional[SpecialtyResponse]:
        """Obtener especialidad por nombre"""
        try:
            specialty = db.query(Specialty).filter(
                Specialty.name == name,
                Specialty.is_active == True
            ).first()
            
            if not specialty:
                return None
                
            return SpecialtyResponse.from_orm(specialty)
            
        except Exception as e:
            logger.error("Error getting specialty by name", error=str(e))
            raise
    
    @staticmethod
    async def get_count(db: Session) -> int:
        """Obtener número total de especialidades activas"""
        try:
            count = db.query(Specialty).filter(Specialty.is_active == True).count()
            return count
        except Exception as e:
            logger.error("Error getting specialty count", error=str(e))
            raise




