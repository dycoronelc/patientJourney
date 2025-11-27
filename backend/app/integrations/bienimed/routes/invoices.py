"""
Rutas para consultar facturas de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_bienimed_db
from ..services.invoice_service import InvoiceService
from ..schemas.invoice import InvoiceResponse, InvoiceListResponse

router = APIRouter()

@router.get("/", response_model=InvoiceListResponse)
def get_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None, description="Filtrar por paciente"),
    search: Optional[str] = Query(None, description="Buscar por nombre o número de factura"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de facturas de Bienimed"""
    try:
        service = InvoiceService(db)
        invoices = service.get_invoices(skip=skip, limit=limit, patient_id=patient_id, search=search)
        total = service.count_invoices(patient_id=patient_id)
        
        return InvoiceListResponse(
            invoices=[invoice.to_dict() for invoice in invoices],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar facturas: {str(e)}")
    finally:
        service.close()

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener una factura específica por ID"""
    try:
        service = InvoiceService(db)
        invoice = service.get_invoice_by_id(invoice_id)
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Factura no encontrada")
        
        return invoice.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar factura: {str(e)}")
    finally:
        service.close()

@router.get("/patient/{patient_id}", response_model=InvoiceListResponse)
def get_patient_invoices(patient_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener facturas de un paciente"""
    try:
        service = InvoiceService(db)
        invoices = service.get_patient_invoices(patient_id)
        
        return InvoiceListResponse(
            invoices=[invoice.to_dict() for invoice in invoices],
            total=len(invoices),
            page=1,
            per_page=len(invoices)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar facturas del paciente: {str(e)}")
    finally:
        service.close()



