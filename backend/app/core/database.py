"""
Configuración de base de datos MySQL
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import structlog
from typing import Generator

from .config import settings

logger = structlog.get_logger()

# Crear engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=3600,  # Reciclar conexiones cada hora
    echo=settings.DEBUG
)

# SessionLocal para dependencias
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Metadata para migraciones
metadata = MetaData()

async def init_db():
    """Inicializar base de datos"""
    try:
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error("Failed to initialize database", error=str(e))
        raise

async def close_db():
    """Cerrar conexiones de base de datos"""
    try:
        engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error("Error closing database connections", error=str(e))

def get_db() -> Generator[Session, None, None]:
    """
    Dependencia para obtener sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error("Database session error", error=str(e))
        db.rollback()
        raise
    finally:
        db.close()

# Función para crear sesión independiente
def create_db_session() -> Session:
    """Crear una nueva sesión de base de datos"""
    return SessionLocal()




