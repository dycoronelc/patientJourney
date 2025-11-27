"""
Servicio para consultar doctores de Bienimed
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..models.doctor import Doctor
from ..database import BienimedSessionLocal

class DoctorService:
    def __init__(self, db: Session = None):
        self.db = db or BienimedSessionLocal()
    
    def get_doctors(
        self, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        specialty_id: Optional[int] = None,
        active_only: bool = True
    ) -> List[Doctor]:
        """Obtener lista de doctores con filtros opcionales"""
        query = self.db.query(Doctor)
        
        if active_only:
            query = query.filter(Doctor.estado == 'Activo')
        
        if search:
            query = query.filter(
                or_(
                    Doctor.primernombre.ilike(f"%{search}%"),
                    Doctor.apellidopaterno.ilike(f"%{search}%"),
                    Doctor.correo.ilike(f"%{search}%")
                )
            )
        
        if specialty_id:
            query = query.filter(Doctor.idespecialidad == specialty_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_doctor_by_id(self, doctor_id: int) -> Optional[Doctor]:
        """Obtener doctor por ID"""
        return self.db.query(Doctor).filter(Doctor.id == doctor_id).first()
    
    def get_doctors_by_specialty(self, specialty_id: int) -> List[Doctor]:
        """Obtener doctores por especialidad"""
        return self.db.query(Doctor).filter(
            Doctor.idespecialidad == specialty_id,
            Doctor.estado == 'Activo'
        ).all()
    
    def count_doctors(self, search: Optional[str] = None, specialty_id: Optional[int] = None) -> int:
        """Contar total de doctores"""
        query = self.db.query(Doctor).filter(Doctor.estado == 'Activo')
        
        if search:
            query = query.filter(
                or_(
                    Doctor.primernombre.ilike(f"%{search}%"),
                    Doctor.apellidopaterno.ilike(f"%{search}%"),
                    Doctor.correo.ilike(f"%{search}%")
                )
            )
        
        if specialty_id:
            query = query.filter(Doctor.idespecialidad == specialty_id)
        
        return query.count()
    
    def close(self):
        """Cerrar conexión a la base de datos"""
        if self.db:
            self.db.close()



