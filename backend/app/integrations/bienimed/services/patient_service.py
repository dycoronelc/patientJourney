"""
Servicio para consultar pacientes de Bienimed
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from ..models.patient import Patient
from ..database import BienimedSessionLocal

class PatientService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_patients(
        self, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        document: Optional[str] = None
    ) -> List[Patient]:
        """Obtener lista de pacientes con filtros opcionales"""
        query = self.db.query(Patient)
        
        if search:
            query = query.filter(
                or_(
                    Patient.primernombre.ilike(f"%{search}%"),
                    Patient.apellidopaterno.ilike(f"%{search}%"),
                    Patient.correo.ilike(f"%{search}%")
                )
            )
        
        if document:
            query = query.filter(Patient.numerodocumento == document)
        
        return query.offset(skip).limit(limit).all()
    
    def get_patient_by_id(self, patient_id: int) -> Optional[Patient]:
        """Obtener paciente por ID"""
        return self.db.query(Patient).filter(Patient.id == patient_id).first()
    
    def get_patient_by_document(self, document: str) -> Optional[Patient]:
        """Obtener paciente por documento"""
        return self.db.query(Patient).filter(Patient.numerodocumento == document).first()
    
    def count_patients(self, search: Optional[str] = None) -> int:
        """Contar total de pacientes"""
        query = self.db.query(Patient)
        
        if search:
            query = query.filter(
                or_(
                    Patient.primernombre.ilike(f"%{search}%"),
                    Patient.apellidopaterno.ilike(f"%{search}%"),
                    Patient.correo.ilike(f"%{search}%")
                )
            )
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



