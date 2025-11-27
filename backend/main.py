"""
Patient Journey Predictor - Backend API
FastAPI application for medical resource prediction platform
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn
import structlog
from typing import Dict, Any

# Importar configuración
from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.redis import init_redis, close_redis
from app.core.logging import setup_logging

# Importar rutas
from app.api.v1.routes import config, integration, analytics, visualization, auth, patient_journey, steps, patient_flows, bienimed_analytics, flow_generator, advanced_flow_generator, flow_cleanup, unique_flow_generator, step_sync

# Importar rutas de flujos médicos normalizados
from app.api.v1.routes import medical_flows

# Importar rutas de integración Bienimed
from app.integrations.bienimed.routes import filters_router

from app.api.v1.websocket import websocket_router

# Configurar logging
setup_logging()
logger = structlog.get_logger()

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    logger.info("Starting Patient Journey Predictor API")
    
    try:
        # Inicializar base de datos
        await init_db()
        logger.info("Database initialized successfully")
        
        # Inicializar Redis
        await init_redis()
        logger.info("Redis initialized successfully")
        
        yield
        
    except Exception as e:
        logger.error("Failed to initialize services", error=str(e))
        raise
    
    finally:
        # Shutdown
        logger.info("Shutting down Patient Journey Predictor API")
        await close_db()
        await close_redis()

# Crear aplicación FastAPI
app = FastAPI(
    title="Patient Journey Predictor API",
    description="API para la plataforma de predicción de recursos médicos basada en interacciones de pacientes",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Middleware de seguridad
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": "2024-01-01T00:00:00Z"  # En producción usar datetime.utcnow()
    }

# Incluir rutas
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(config.router, prefix="/api/v1/config", tags=["Configuration"])
app.include_router(integration.router, prefix="/api/v1/integration", tags=["Integration"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(visualization.router, prefix="/api/v1/visualization", tags=["Visualization"])
app.include_router(patient_journey.router, prefix="/api/v1/patient-journey", tags=["Patient Journey"])
app.include_router(steps.router, prefix="/api/v1/steps", tags=["Steps"])
app.include_router(patient_flows.router, prefix="/api/v1/flows", tags=["Patient Flows"])
app.include_router(bienimed_analytics.router, prefix="/api/v1/bienimed-analytics", tags=["Bienimed Analytics"])
app.include_router(flow_generator.router, prefix="/api/v1/flow-generator", tags=["Flow Generator"])
app.include_router(advanced_flow_generator.router, prefix="/api/v1/advanced-flow-generator", tags=["Advanced Flow Generator"])
app.include_router(flow_cleanup.router, prefix="/api/v1/flow-cleanup", tags=["Flow Cleanup"])
app.include_router(unique_flow_generator.router, prefix="/api/v1/unique-flow-generator", tags=["Unique Flow Generator"])
app.include_router(step_sync.router, prefix="/api/v1/step-sync", tags=["Step Synchronization"])

# Rutas de flujos médicos normalizados
app.include_router(medical_flows.router, prefix="/api/v1/medical-flows", tags=["Flujos Médicos Normalizados"])

# Rutas de integración Bienimed
app.include_router(filters_router, prefix="/api/v1/bienimed/filters", tags=["Bienimed - Filtros"])

app.include_router(websocket_router, prefix="/ws", tags=["WebSocket"])

# Manejo de errores global
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error("HTTP exception", status_code=exc.status_code, detail=exc.detail)
    return {
        "success": False,
        "error": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error("Unhandled exception", error=str(exc))
    return {
        "success": False,
        "error": "Internal server error",
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )

