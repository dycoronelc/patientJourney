"""
Schemas para Facturas de Bienimed
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ResponsablePago(BaseModel):
    nombre: str
    documento: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    ruc: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: int
    numero_factura: Optional[str] = None
    paciente_id: Optional[int] = None
    paciente_nombre: str
    paciente_documento: Optional[str] = None
    paciente_email: Optional[str] = None
    paciente_telefono: Optional[str] = None
    subtotal: float
    total: float
    descuento_porcentaje: Optional[int] = None
    descuento_monto: float
    fecha_creacion: Optional[str] = None
    hora_creacion: Optional[str] = None
    metodo_pago_id: Optional[int] = None
    centro_id: Optional[int] = None
    responsable_pago: ResponsablePago
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int
    page: int
    per_page: int

    class Config:
        from_attributes = True



