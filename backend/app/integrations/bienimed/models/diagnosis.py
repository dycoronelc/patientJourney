"""
Modelo de Diagnóstico para Bienimed
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from ..database import BienimedBase

class Diagnosis(BienimedBase):
    __tablename__ = "listado_diagnostico"
    
    id = Column(Integer, primary_key=True, index=True)
    idconsulta = Column(Integer, nullable=True)
    idusuario = Column(Integer, nullable=False)
    idpaciente = Column(Integer, nullable=True)
    iddiagnostico = Column(Integer, nullable=False)
    descripcion = Column(String(250), nullable=False)
    fecha = Column(Date, nullable=False)
    idcliente = Column(Integer, nullable=True)
    creado = Column(DateTime, nullable=True, server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "consulta_id": self.idconsulta,
            "usuario_id": self.idusuario,
            "paciente_id": self.idpaciente,
            "diagnostico_id": self.iddiagnostico,
            "descripcion": self.descripcion,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "cliente_id": self.idcliente,
            "creado": self.creado.isoformat() if self.creado else None,
        }
    
    def __repr__(self):
        return f"<Diagnosis(id={self.id}, paciente_id={self.idpaciente}, diagnostico_id={self.iddiagnostico})>"



