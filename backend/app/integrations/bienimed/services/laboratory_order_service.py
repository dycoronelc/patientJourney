"""
Servicio para consultar órdenes de laboratorio de Bienimed
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.laboratory_order import LaboratoryOrder
from ..database import BienimedSessionLocal

class LaboratoryOrderService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_laboratory_orders(
        self, 
        skip: int = 0, 
        limit: int = 100,
        diagnostico_id: Optional[int] = None
    ) -> List[LaboratoryOrder]:
        """Obtener lista de órdenes de laboratorio con filtros opcionales"""
        query = self.db.query(LaboratoryOrder)
        
        if diagnostico_id:
            query = query.filter(LaboratoryOrder.iddiagnostico == diagnostico_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_laboratory_order_by_id(self, order_id: int) -> Optional[LaboratoryOrder]:
        """Obtener orden de laboratorio por ID"""
        return self.db.query(LaboratoryOrder).filter(LaboratoryOrder.id == order_id).first()
    
    def get_laboratory_order_by_uuid(self, uuid: str) -> Optional[LaboratoryOrder]:
        """Obtener orden de laboratorio por UUID"""
        return self.db.query(LaboratoryOrder).filter(LaboratoryOrder.uuid == uuid).first()
    
    def count_laboratory_orders(self, diagnostico_id: Optional[int] = None) -> int:
        """Contar total de órdenes de laboratorio"""
        query = self.db.query(LaboratoryOrder)
        
        if diagnostico_id:
            query = query.filter(LaboratoryOrder.iddiagnostico == diagnostico_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



