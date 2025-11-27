"""
Modelos para catálogos de Bienimed
"""
from sqlalchemy import Column, Integer, String, Text
from app.integrations.bienimed.database import BienimedBase

class CIE10Catalog(BienimedBase):
    """Catálogo de diagnósticos CIE-10"""
    __tablename__ = "cat_cie10"

    id = Column(Integer, primary_key=True, index=True)
    id_categoria = Column(Integer, nullable=True)
    id_diagnostico = Column(Integer, nullable=True)
    id_detalle = Column(Integer, nullable=True)
    codigo = Column(String(250), nullable=True)
    nombre = Column(Text, nullable=True)
    grupo = Column(String(250), nullable=True)
    estado = Column(String(20), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nombre": self.nombre,
            "grupo": self.grupo
        }

class ProcedureCatalog(BienimedBase):
    """Catálogo de procedimientos"""
    __tablename__ = "cat_procedimientos"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), nullable=True)
    descripcion = Column(Text, nullable=True)
    version = Column(String(10), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "descripcion": self.descripcion,
            "version": self.version
        }

class SpecialtyCatalog(BienimedBase):
    """Catálogo de especialidades"""
    __tablename__ = "cat_especialidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=True)
    descripcion = Column(Text, nullable=True)
    estado = Column(String(20), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "estado": self.estado
        }



