from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()


class BaseModel(Base):
    """Modelo base para todas las entidades del sistema"""
    __abstract__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self):
        return f"<{self.__class__.__name__}(id='{self.id}')>"

    def to_dict(self):
        """Convierte el modelo a diccionario"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }










