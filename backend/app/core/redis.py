"""
Configuración de Redis
"""

import redis.asyncio as redis
import structlog
from typing import Optional

from .config import settings

logger = structlog.get_logger()

# Instancia global de Redis
redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Inicializar conexión a Redis"""
    global redis_client
    
    # Verificar si Redis está habilitado
    if not settings.REDIS_ENABLED:
        logger.info("Redis disabled in configuration - skipping initialization")
        redis_client = None
        return
    
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD,
            decode_responses=True,
            encoding="utf-8"
        )
        
        # Probar la conexión
        await redis_client.ping()
        logger.info("Redis initialized successfully")
        
    except Exception as e:
        logger.error("Failed to initialize Redis", error=str(e))
        # En desarrollo, continuar sin Redis
        if settings.DEBUG:
            logger.warning("Continuing without Redis in debug mode")
            redis_client = None
        else:
            raise

async def close_redis():
    """Cerrar conexión a Redis"""
    global redis_client
    if redis_client:
        try:
            await redis_client.close()
            logger.info("Redis connection closed")
        except Exception as e:
            logger.error("Error closing Redis connection", error=str(e))
        finally:
            redis_client = None

def get_redis() -> Optional[redis.Redis]:
    """Obtener instancia de Redis"""
    return redis_client

def is_redis_available() -> bool:
    """Verificar si Redis está disponible"""
    return redis_client is not None



