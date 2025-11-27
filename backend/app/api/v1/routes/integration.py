"""
Rutas de integración
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_integration():
    """Endpoint de prueba para integración"""
    return {"message": "Integration module working"}



