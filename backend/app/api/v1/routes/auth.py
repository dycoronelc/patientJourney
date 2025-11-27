"""
Rutas de autenticación
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_auth():
    """Endpoint de prueba para autenticación"""
    return {"message": "Auth module working"}



