"""
Servicio para consultar referencias de Bienimed
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.referral import Referral
from ..database import BienimedSessionLocal

class ReferralService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_referrals(
        self, 
        skip: int = 0, 
        limit: int = 100,
        consulta_id: Optional[int] = None,
        especialidad_id: Optional[int] = None
    ) -> List[Referral]:
        """Obtener lista de referencias con filtros opcionales"""
        query = self.db.query(Referral)
        
        if consulta_id:
            query = query.filter(Referral.idconsulta == consulta_id)
        
        if especialidad_id:
            query = query.filter(Referral.idespecialidad == especialidad_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_referral_by_id(self, referral_id: int) -> Optional[Referral]:
        """Obtener referencia por ID"""
        return self.db.query(Referral).filter(Referral.id == referral_id).first()
    
    def get_consultation_referrals(self, consulta_id: int) -> List[Referral]:
        """Obtener referencias de una consulta"""
        return self.db.query(Referral).filter(Referral.idconsulta == consulta_id).all()
    
    def count_referrals(self, consulta_id: Optional[int] = None) -> int:
        """Contar total de referencias"""
        query = self.db.query(Referral)
        
        if consulta_id:
            query = query.filter(Referral.idconsulta == consulta_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



