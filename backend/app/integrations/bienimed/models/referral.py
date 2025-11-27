"""
Modelo de Referencia para Bienimed
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import BienimedBase

class Referral(BienimedBase):
    __tablename__ = "listado_referencia"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), nullable=False)
    idconsulta = Column(Integer, nullable=False)
    idespecialidad = Column(Integer, nullable=False)
    motivo = Column(Text, nullable=False)
    creado = Column(DateTime, nullable=False, server_default=func.now())
    idreferido = Column(Integer, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "uuid": self.uuid,
            "consulta_id": self.idconsulta,
            "especialidad_id": self.idespecialidad,
            "motivo": self.motivo,
            "creado": self.creado.isoformat() if self.creado else None,
            "referido_id": self.idreferido,
        }
    
    def __repr__(self):
        return f"<Referral(id={self.id}, consulta_id={self.idconsulta}, especialidad_id={self.idespecialidad})>"



