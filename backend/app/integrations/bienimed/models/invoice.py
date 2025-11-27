"""
Modelo de Factura para Bienimed
"""
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, Text, DECIMAL
from sqlalchemy.sql import func
from ..database import BienimedBase

class Invoice(BienimedBase):
    __tablename__ = "invoice_headers"
    
    id = Column(Integer, primary_key=True, index=True)
    id_responsible_for_payment = Column(Integer, nullable=True)
    id_created_by = Column(Integer, nullable=True)
    invoice_number = Column(String(255), nullable=True)
    id_payment_method = Column(Integer, nullable=True)
    id_center = Column(Integer, nullable=True)
    type_discount = Column(Integer, nullable=True)
    method_discount = Column(Integer, nullable=True)
    option_discount = Column(String(255), nullable=True)
    discount_percentage = Column(Integer, nullable=True)
    discount_amount = Column(DECIMAL(10, 2), nullable=True)
    detail_custom_discount = Column(String(255), nullable=True)
    created_date = Column(Date, nullable=True)
    created_time = Column(Time, nullable=True)
    subtotal = Column(DECIMAL(13, 2), nullable=True)
    total = Column(DECIMAL(13, 2), nullable=True)
    custom_total = Column(DECIMAL(10, 2), nullable=True)
    id_patient = Column(Integer, nullable=True)
    patient_document_type = Column(Integer, nullable=True)
    patient_document = Column(String(255), nullable=True)
    patient_name = Column(String(255), nullable=True)
    patient_last_name = Column(String(255), nullable=True)
    patient_email = Column(String(255), nullable=True)
    patient_phone = Column(String(255), nullable=True)
    patient_id_province = Column(Integer, nullable=True)
    patient_id_district = Column(Integer, nullable=True)
    patient_id_corregimiento = Column(Integer, nullable=True)
    patient_address = Column(String(255), nullable=True)
    respons_tipo_documento = Column(String(255), nullable=True)
    respons_document = Column(String(255), nullable=True)
    respons_name = Column(String(255), nullable=True)
    respons_last_name = Column(String(255), nullable=True)
    respons_email = Column(String(255), nullable=True)
    respons_phone = Column(String(255), nullable=True)
    respons_id_province = Column(Integer, nullable=True)
    respons_id_district = Column(Integer, nullable=True)
    respons_id_corregimiento = Column(Integer, nullable=True)
    respons_address = Column(String(250), nullable=False)
    respons_country = Column(Integer, nullable=False)
    respons_company_name = Column(String(255), nullable=True)
    respons_ruc = Column(String(255), nullable=True)
    respons_government = Column(String(10), nullable=False)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now(), onupdate=func.now())
    delete_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "numero_factura": self.invoice_number,
            "paciente_id": self.id_patient,
            "paciente_nombre": f"{self.patient_name or ''} {self.patient_last_name or ''}".strip(),
            "paciente_documento": self.patient_document,
            "paciente_email": self.patient_email,
            "paciente_telefono": self.patient_phone,
            "subtotal": float(self.subtotal) if self.subtotal else 0.0,
            "total": float(self.total) if self.total else 0.0,
            "descuento_porcentaje": self.discount_percentage,
            "descuento_monto": float(self.discount_amount) if self.discount_amount else 0.0,
            "fecha_creacion": self.created_date.isoformat() if self.created_date else None,
            "hora_creacion": str(self.created_time) if self.created_time else None,
            "metodo_pago_id": self.id_payment_method,
            "centro_id": self.id_center,
            "responsable_pago": {
                "nombre": f"{self.respons_name or ''} {self.respons_last_name or ''}".strip(),
                "documento": self.respons_document,
                "email": self.respons_email,
                "telefono": self.respons_phone,
                "empresa": self.respons_company_name,
                "ruc": self.respons_ruc,
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, numero='{self.invoice_number}', total={self.total})>"



