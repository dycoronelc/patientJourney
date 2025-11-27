"""
Servicio para consultar facturas de Bienimed
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..models.invoice import Invoice
from ..database import BienimedSessionLocal

class InvoiceService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_invoices(
        self, 
        skip: int = 0, 
        limit: int = 100,
        patient_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[Invoice]:
        """Obtener lista de facturas con filtros opcionales"""
        query = self.db.query(Invoice)
        
        if patient_id:
            query = query.filter(Invoice.id_patient == patient_id)
        
        if search:
            query = query.filter(
                or_(
                    Invoice.patient_name.ilike(f"%{search}%"),
                    Invoice.patient_last_name.ilike(f"%{search}%"),
                    Invoice.invoice_number.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()
    
    def get_invoice_by_id(self, invoice_id: int) -> Optional[Invoice]:
        """Obtener factura por ID"""
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    def get_patient_invoices(self, patient_id: int) -> List[Invoice]:
        """Obtener facturas de un paciente"""
        return self.db.query(Invoice).filter(Invoice.id_patient == patient_id).all()
    
    def count_invoices(self, patient_id: Optional[int] = None) -> int:
        """Contar total de facturas"""
        query = self.db.query(Invoice)
        
        if patient_id:
            query = query.filter(Invoice.id_patient == patient_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



