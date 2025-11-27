"""
Configuración de base de datos para la integración con Bienimed
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configuración de la base de datos Bienimed
BIENIMED_DATABASE_URL = "mysql+pymysql://dcoronel:47HS7%23gtbuk0@localhost:3306/bienimeddemo"

# Crear engine para Bienimed
bienimed_engine = create_engine(
    BIENIMED_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Cambiar a True para debug
)

# SessionLocal para Bienimed
BienimedSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=bienimed_engine)

# Base para modelos de Bienimed
BienimedBase = declarative_base()

def get_bienimed_db():
    """
    Dependency para obtener sesión de base de datos de Bienimed
    """
    db = BienimedSessionLocal()
    try:
        yield db
    finally:
        db.close()



