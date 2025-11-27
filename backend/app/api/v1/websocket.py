"""
WebSocket router
"""

from fastapi import APIRouter

websocket_router = APIRouter()

@websocket_router.websocket("/realtime")
async def websocket_endpoint(websocket):
    """WebSocket endpoint para datos en tiempo real"""
    await websocket.accept()
    await websocket.send_text("WebSocket connected")
    await websocket.close()



