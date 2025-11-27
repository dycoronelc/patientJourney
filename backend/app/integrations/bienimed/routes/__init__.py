"""
Rutas para la integración con Bienimed
"""
from .patients import router as patients_router
from .doctors import router as doctors_router
from .diagnoses import router as diagnoses_router
from .procedures import router as procedures_router
from .referrals import router as referrals_router
from .prescriptions import router as prescriptions_router
from .laboratory_orders import router as laboratory_orders_router
from .imaging_orders import router as imaging_orders_router
from .invoices import router as invoices_router
from .filters import router as filters_router

__all__ = [
    "patients_router",
    "doctors_router",
    "diagnoses_router",
    "procedures_router",
    "referrals_router",
    "prescriptions_router",
    "laboratory_orders_router",
    "imaging_orders_router",
    "invoices_router",
    "filters_router",
]



