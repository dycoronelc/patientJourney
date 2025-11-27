"""
Servicio para consultar diagnósticos de Bienimed
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.diagnosis import Diagnosis
from ..database import BienimedSessionLocal

class DiagnosisService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_diagnoses(
        self, 
        skip: int = 0, 
        limit: int = 100,
        patient_id: Optional[int] = None,
        consulta_id: Optional[int] = None
    ) -> List[Diagnosis]:
        """Obtener lista de diagnósticos con filtros opcionales"""
        query = self.db.query(Diagnosis)
        
        if patient_id:
            query = query.filter(Diagnosis.idpaciente == patient_id)
        
        if consulta_id:
            query = query.filter(Diagnosis.idconsulta == consulta_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_diagnosis_by_id(self, diagnosis_id: int) -> Optional[Diagnosis]:
        """Obtener diagnóstico por ID"""
        return self.db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
    
    def get_patient_diagnoses(self, patient_id: int) -> List[Diagnosis]:
        """Obtener diagnósticos de un paciente"""
        return self.db.query(Diagnosis).filter(Diagnosis.idpaciente == patient_id).all()
    
    def count_diagnoses(self, patient_id: Optional[int] = None) -> int:
        """Contar total de diagnósticos"""
        query = self.db.query(Diagnosis)
        
        if patient_id:
            query = query.filter(Diagnosis.idpaciente == patient_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



