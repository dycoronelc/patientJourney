"""
Schemas para la integración con Bienimed
"""
from .patient import PatientResponse, PatientListResponse
from .doctor import DoctorResponse, DoctorListResponse
from .diagnosis import DiagnosisResponse, DiagnosisListResponse
from .procedure import ProcedureResponse, ProcedureListResponse
from .referral import ReferralResponse, ReferralListResponse
from .prescription import PrescriptionResponse, PrescriptionListResponse
from .laboratory_order import LaboratoryOrderResponse, LaboratoryOrderListResponse
from .imaging_order import ImagingOrderResponse, ImagingOrderListResponse
from .invoice import InvoiceResponse, InvoiceListResponse

__all__ = [
    "PatientResponse",
    "PatientListResponse",
    "DoctorResponse", 
    "DoctorListResponse",
    "DiagnosisResponse",
    "DiagnosisListResponse",
    "ProcedureResponse",
    "ProcedureListResponse",
    "ReferralResponse",
    "ReferralListResponse",
    "PrescriptionResponse",
    "PrescriptionListResponse",
    "LaboratoryOrderResponse",
    "LaboratoryOrderListResponse",
    "ImagingOrderResponse",
    "ImagingOrderListResponse",
    "InvoiceResponse",
    "InvoiceListResponse",
]



