"""
Servicios para filtros de BieniMedico
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.integrations.bienimed.models.filter import ClienteCorporativo, Area, Usuario, CentroUsuario, Centro

class BienimedFilterService:
    def __init__(self, db: Session):
        self.db = db

    def get_clientes_corporativos(self, idcliente: int = 1) -> List[ClienteCorporativo]:
        """Obtener clientes corporativos activos"""
        try:
            return self.db.query(ClienteCorporativo).join(Centro, Centro.id == ClienteCorporativo.idcentro).filter(
                Centro.idcliente == idcliente,
                ClienteCorporativo.estado == 1
            ).all()
        except Exception as e:
            print(f"Error getting clientes corporativos: {e}")
            return []

    def get_areas(self, idcentro: int = 1) -> List[Area]:
        """Obtener áreas médicas activas"""
        try:
            return self.db.query(Area).filter(
                Area.idcentro == idcentro,
                Area.estado == 1
            ).all()
        except Exception as e:
            print(f"Error getting areas: {e}")
            return []

    def get_doctores(self, idcentro: int = 1) -> List[Usuario]:
        """Obtener doctores activos del centro"""
        try:
            return self.db.query(Usuario).join(
                CentroUsuario, CentroUsuario.idusuario == Usuario.id
            ).filter(
                CentroUsuario.idcentro == idcentro,
                CentroUsuario.idnivel.in_([2, 6]),  # Niveles de doctor
                CentroUsuario.estado == 1
            ).all()
        except Exception as e:
            print(f"Error getting doctores: {e}")
            return []

    def get_cliente_by_id(self, cliente_id: int) -> Optional[ClienteCorporativo]:
        """Obtener cliente por ID"""
        try:
            return self.db.query(ClienteCorporativo).filter(ClienteCorporativo.id == cliente_id).first()
        except Exception as e:
            print(f"Error getting cliente by ID: {e}")
            return None

    def get_area_by_id(self, area_id: int) -> Optional[Area]:
        """Obtener área por ID"""
        try:
            return self.db.query(Area).filter(Area.id == area_id).first()
        except Exception as e:
            print(f"Error getting area by ID: {e}")
            return None

    def get_doctor_by_id(self, doctor_id: int) -> Optional[Usuario]:
        """Obtener doctor por ID"""
        try:
            return self.db.query(Usuario).filter(Usuario.id == doctor_id).first()
        except Exception as e:
            print(f"Error getting doctor by ID: {e}")
            return None
