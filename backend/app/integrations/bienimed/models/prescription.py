"""
Modelo de Receta Médica para Bienimed
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import BienimedBase

class Prescription(BienimedBase):
    __tablename__ = "recetas_medicamentos"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), nullable=False)
    iddiagnostico = Column(Integer, nullable=False)
    show_diagnostico = Column(Integer, nullable=False)
    idtrw = Column(Integer, nullable=True)
    pdf = Column(String(100), nullable=True)
    fecha_creacion = Column(DateTime, nullable=False, server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "uuid": self.uuid,
            "diagnostico_id": self.iddiagnostico,
            "mostrar_diagnostico": bool(self.show_diagnostico),
            "trw_id": self.idtrw,
            "pdf": self.pdf,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }
    
    def __repr__(self):
        return f"<Prescription(id={self.id}, diagnostico_id={self.iddiagnostico})>"



