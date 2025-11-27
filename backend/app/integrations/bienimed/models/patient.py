"""
Modelo de Paciente para Bienimed
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from ..database import BienimedBase

class Patient(BienimedBase):
    __tablename__ = "pacientes"
    
    id = Column(Integer, primary_key=True, index=True)
    primernombre = Column(String(50), nullable=False)
    segundonombre = Column(String(50), nullable=True)
    apellidopaterno = Column(String(50), nullable=False)
    apellidomaterno = Column(String(50), nullable=True)
    numerodocumento = Column(String(25), nullable=False, index=True)
    tipodocumento = Column(String(10), nullable=False)
    fechanacimiento = Column(Date, nullable=True)
    sexo = Column(Integer, nullable=False)
    tieneseguro = Column(String(2), nullable=True)
    telefono = Column(String(120), nullable=True)
    celular = Column(String(20), nullable=True)
    correo = Column(String(100), nullable=False)
    idprovincia = Column(Integer, nullable=True)
    iddistrito = Column(Integer, nullable=True)
    idcorregimiento = Column(Integer, nullable=True)
    domicilio = Column(String(255), nullable=True)
    foto = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, nullable=False, server_default=func.now())
    actualizado = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    idcreadopor = Column(Integer, nullable=False)
    idtrw = Column(Integer, nullable=True)
    id_grupo_sanguineo = Column(Integer, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "nombre": f"{self.primernombre} {self.segundonombre or ''}".strip(),
            "apellidos": f"{self.apellidopaterno} {self.apellidomaterno or ''}".strip(),
            "nombre_completo": f"{self.primernombre} {self.segundonombre or ''} {self.apellidopaterno} {self.apellidomaterno or ''}".strip(),
            "documento": self.numerodocumento,
            "tipo_documento": self.tipodocumento,
            "fecha_nacimiento": self.fechanacimiento.isoformat() if self.fechanacimiento else None,
            "sexo": self.sexo,
            "tiene_seguro": self.tieneseguro,
            "telefono": self.telefono,
            "celular": self.celular,
            "correo": self.correo,
            "domicilio": self.domicilio,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "actualizado": self.actualizado.isoformat() if self.actualizado else None,
        }
    
    def __repr__(self):
        return f"<Patient(id={self.id}, nombre='{self.primernombre} {self.apellidopaterno}')>"



