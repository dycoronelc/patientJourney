"""
Rutas de visualización
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_visualization():
    """Endpoint de prueba para visualización"""
    return {"message": "Visualization module working"}



