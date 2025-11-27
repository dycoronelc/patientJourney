"""
Servicio para consultar recetas de Bienimed
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.prescription import Prescription
from ..database import BienimedSessionLocal

class PrescriptionService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_prescriptions(
        self, 
        skip: int = 0, 
        limit: int = 100,
        diagnostico_id: Optional[int] = None
    ) -> List[Prescription]:
        """Obtener lista de recetas con filtros opcionales"""
        query = self.db.query(Prescription)
        
        if diagnostico_id:
            query = query.filter(Prescription.iddiagnostico == diagnostico_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_prescription_by_id(self, prescription_id: int) -> Optional[Prescription]:
        """Obtener receta por ID"""
        return self.db.query(Prescription).filter(Prescription.id == prescription_id).first()
    
    def get_prescription_by_uuid(self, uuid: str) -> Optional[Prescription]:
        """Obtener receta por UUID"""
        return self.db.query(Prescription).filter(Prescription.uuid == uuid).first()
    
    def count_prescriptions(self, diagnostico_id: Optional[int] = None) -> int:
        """Contar total de recetas"""
        query = self.db.query(Prescription)
        
        if diagnostico_id:
            query = query.filter(Prescription.iddiagnostico == diagnostico_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



