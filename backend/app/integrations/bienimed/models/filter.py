"""
Modelos para filtros de BieniMedico (Cliente, Área, Doctor)
"""
from sqlalchemy import Column, Integer, String, Text
from app.integrations.bienimed.database import BienimedBase

class ClienteCorporativo(BienimedBase):
    """Modelo para clientes corporativos"""
    __tablename__ = "cliente_corporativo"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    direccion = Column(Text, nullable=True)
    imagen_url = Column(String(500), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    idcentro = Column(Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "imagen_url": self.imagen_url,
            "estado": self.estado,
            "idcentro": self.idcentro,
        }

class Area(BienimedBase):
    """Modelo para áreas médicas"""
    __tablename__ = "cat_areas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    icon_active = Column(String(100), nullable=True)
    icon_color = Column(String(20), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    idcentro = Column(Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "icon_active": self.icon_active,
            "icon_color": self.icon_color,
            "estado": self.estado,
            "idcentro": self.idcentro,
        }

class Usuario(BienimedBase):
    """Modelo para usuarios/doctores"""
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    primernombre = Column(String(50), nullable=False)
    segundonombre = Column(String(50), nullable=True)
    apellidopaterno = Column(String(50), nullable=False)
    apellidomaterno = Column(String(50), nullable=True)
    foto = Column(String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "primernombre": self.primernombre,
            "segundonombre": self.segundonombre,
            "apellidopaterno": self.apellidopaterno,
            "apellidomaterno": self.apellidomaterno,
            "nombre_completo": f"{self.primernombre} {self.segundonombre or ''} {self.apellidopaterno} {self.apellidomaterno or ''}".strip(),
            "foto": self.foto,
        }

class CentroUsuario(BienimedBase):
    """Modelo para relación centros-usuarios"""
    __tablename__ = "centros_usuarios"

    id = Column(Integer, primary_key=True, index=True)
    idcentro = Column(Integer, nullable=False)
    idusuario = Column(Integer, nullable=False)
    idnivel = Column(Integer, nullable=False)
    estado = Column(Integer, nullable=False, default=1)

    def to_dict(self):
        return {
            "id": self.id,
            "idcentro": self.idcentro,
            "idusuario": self.idusuario,
            "idnivel": self.idnivel,
            "estado": self.estado,
        }

class Centro(BienimedBase):
    """Modelo para centros médicos"""
    __tablename__ = "centros"

    id = Column(Integer, primary_key=True, index=True)
    idcliente = Column(Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "idcliente": self.idcliente,
        }
