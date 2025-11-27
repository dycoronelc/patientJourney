"""
Servicio para consultar órdenes de imagenología de Bienimed
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.imaging_order import ImagingOrder
from ..database import BienimedSessionLocal

class ImagingOrderService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_imaging_orders(
        self, 
        skip: int = 0, 
        limit: int = 100,
        diagnostico_id: Optional[int] = None
    ) -> List[ImagingOrder]:
        """Obtener lista de órdenes de imagenología con filtros opcionales"""
        query = self.db.query(ImagingOrder)
        
        if diagnostico_id:
            query = query.filter(ImagingOrder.iddiagnostico == diagnostico_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_imaging_order_by_id(self, order_id: int) -> Optional[ImagingOrder]:
        """Obtener orden de imagenología por ID"""
        return self.db.query(ImagingOrder).filter(ImagingOrder.id == order_id).first()
    
    def get_imaging_order_by_uuid(self, uuid: str) -> Optional[ImagingOrder]:
        """Obtener orden de imagenología por UUID"""
        return self.db.query(ImagingOrder).filter(ImagingOrder.uuid == uuid).first()
    
    def count_imaging_orders(self, diagnostico_id: Optional[int] = None) -> int:
        """Contar total de órdenes de imagenología"""
        query = self.db.query(ImagingOrder)
        
        if diagnostico_id:
            query = query.filter(ImagingOrder.iddiagnostico == diagnostico_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



