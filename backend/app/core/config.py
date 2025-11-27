"""
Configuración de la aplicación
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Aplicación
    APP_NAME: str = "Patient Journey Predictor API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Base de datos MySQL
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/patient_journey"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_ENABLED: bool = False  # Deshabilitado para desarrollo
    
    # Seguridad
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Hosts permitidos
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # JWT
    JWT_SECRET_KEY: str = "your-jwt-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    
    # Integración médica
    FHIR_BASE_URL: Optional[str] = None
    DICOM_STORAGE_PATH: str = "/app/storage/dicom"
    HL7_FHIR_ENABLED: bool = True
    
    # Analítica
    ML_MODEL_PATH: str = "/app/models"
    PREDICTION_CACHE_TTL: int = 300  # 5 minutos
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Archivos
    UPLOAD_DIR: str = "/app/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30
    WS_MAX_CONNECTIONS: int = 1000
    
    # Celery (para tareas asíncronas)
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Monitoreo
    PROMETHEUS_ENABLED: bool = True
    METRICS_PORT: int = 9090
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Instancia global de configuración
settings = Settings()

