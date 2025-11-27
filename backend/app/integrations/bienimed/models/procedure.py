"""
Modelo de Procedimiento para Bienimed
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from ..database import BienimedBase

class Procedure(BienimedBase):
    __tablename__ = "listado_procedimiento"
    
    id = Column(Integer, primary_key=True, index=True)
    idconsulta = Column(Integer, nullable=True)
    idusuario = Column(Integer, nullable=False)
    idpaciente = Column(Integer, nullable=True)
    idprocedimiento = Column(Integer, nullable=True)
    descripcion = Column(String(250), nullable=False)
    realizado = Column(Date, nullable=True)
    idcliente = Column(Integer, nullable=True)
    creado = Column(DateTime, nullable=True, server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "consulta_id": self.idconsulta,
            "usuario_id": self.idusuario,
            "paciente_id": self.idpaciente,
            "procedimiento_id": self.idprocedimiento,
            "descripcion": self.descripcion,
            "realizado": self.realizado.isoformat() if self.realizado else None,
            "cliente_id": self.idcliente,
            "creado": self.creado.isoformat() if self.creado else None,
        }
    
    def __repr__(self):
        return f"<Procedure(id={self.id}, paciente_id={self.idpaciente}, procedimiento_id={self.idprocedimiento})>"



