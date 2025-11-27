"""
Modelo de Orden de Laboratorio para Bienimed
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import BienimedBase

class LaboratoryOrder(BienimedBase):
    __tablename__ = "recetas_ordenes_laboratorio"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), nullable=False)
    iddiagnostico = Column(Integer, nullable=True)
    show_diagnostico = Column(Integer, nullable=False)
    idtrw = Column(Integer, nullable=False)
    pdf = Column(Text, nullable=False)
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
        return f"<LaboratoryOrder(id={self.id}, diagnostico_id={self.iddiagnostico})>"



