"""
Servicio para consultar procedimientos de Bienimed
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.procedure import Procedure
from ..database import BienimedSessionLocal

class ProcedureService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_procedures(
        self, 
        skip: int = 0, 
        limit: int = 100,
        patient_id: Optional[int] = None,
        consulta_id: Optional[int] = None
    ) -> List[Procedure]:
        """Obtener lista de procedimientos con filtros opcionales"""
        query = self.db.query(Procedure)
        
        if patient_id:
            query = query.filter(Procedure.idpaciente == patient_id)
        
        if consulta_id:
            query = query.filter(Procedure.idconsulta == consulta_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_procedure_by_id(self, procedure_id: int) -> Optional[Procedure]:
        """Obtener procedimiento por ID"""
        return self.db.query(Procedure).filter(Procedure.id == procedure_id).first()
    
    def get_patient_procedures(self, patient_id: int) -> List[Procedure]:
        """Obtener procedimientos de un paciente"""
        return self.db.query(Procedure).filter(Procedure.idpaciente == patient_id).all()
    
    def count_procedures(self, patient_id: Optional[int] = None) -> int:
        """Contar total de procedimientos"""
        query = self.db.query(Procedure)
        
        if patient_id:
            query = query.filter(Procedure.idpaciente == patient_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



