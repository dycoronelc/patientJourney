"""
Modelo de Doctor para Bienimed
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, JSON
from sqlalchemy.sql import func
from ..database import BienimedBase

class Doctor(BienimedBase):
    __tablename__ = "medicos"
    
    id = Column(Integer, primary_key=True, index=True)
    primernombre = Column(String(50), nullable=False)
    segundonombre = Column(String(50), nullable=True)
    apellidopaterno = Column(String(50), nullable=False)
    apellidomaterno = Column(String(50), nullable=True)
    numerodocumento = Column(String(25), nullable=False)
    tipodocumento = Column(Integer, nullable=False)
    idoneidad = Column(String(20), nullable=False)
    telefono = Column(String(120), nullable=True)
    celular = Column(String(20), nullable=True)
    correo = Column(String(150), nullable=False)
    idespecialidad = Column(Integer, nullable=False)
    subespecialidades = Column(JSON, nullable=True)
    condiciones = Column(JSON, nullable=True)
    atiendea = Column(JSON, nullable=True)
    estado = Column(String(10), nullable=False)
    sexo = Column(Integer, nullable=True)
    fechanacimiento = Column(Date, nullable=True)
    idprovincia = Column(Integer, nullable=True)
    iddistrito = Column(Integer, nullable=True)
    idcorregimiento = Column(Integer, nullable=True)
    domicilio = Column(String(255), nullable=True)
    foto = Column(Text, nullable=False)
    firma = Column(Text, nullable=True)
    idiomas = Column(JSON, nullable=True)
    ubicacion = Column(JSON, nullable=True)
    idusuario = Column(Integer, nullable=False)
    idcreador = Column(Integer, nullable=False)
    fecha_creacion = Column(DateTime, nullable=False, server_default=func.now())
    idtrw = Column(Integer, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "nombre": f"{self.primernombre} {self.segundonombre or ''}".strip(),
            "apellidos": f"{self.apellidopaterno} {self.apellidomaterno or ''}".strip(),
            "nombre_completo": f"Dr. {self.primernombre} {self.segundonombre or ''} {self.apellidopaterno} {self.apellidomaterno or ''}".strip(),
            "documento": self.numerodocumento,
            "tipo_documento": self.tipodocumento,
            "idoneidad": self.idoneidad,
            "telefono": self.telefono,
            "celular": self.celular,
            "correo": self.correo,
            "especialidad_id": self.idespecialidad,
            "subespecialidades": self.subespecialidades,
            "condiciones": self.condiciones,
            "atiende_a": self.atiendea,
            "estado": self.estado,
            "sexo": self.sexo,
            "fecha_nacimiento": self.fechanacimiento.isoformat() if self.fechanacimiento else None,
            "domicilio": self.domicilio,
            "idiomas": self.idiomas,
            "ubicacion": self.ubicacion,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }
    
    def __repr__(self):
        return f"<Doctor(id={self.id}, nombre='Dr. {self.primernombre} {self.apellidopaterno}')>"



