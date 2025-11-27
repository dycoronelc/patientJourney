"""
Servicio para consultar catálogos de Bienimed
"""
from sqlalchemy.orm import Session
from typing import Dict, Optional, List
from app.integrations.bienimed.models.catalog import CIE10Catalog, ProcedureCatalog, SpecialtyCatalog
from app.integrations.bienimed.database import get_bienimed_db

class CatalogService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_diagnosis_name(self, diagnosis_id: int) -> Optional[str]:
        """Obtener el nombre de un diagnóstico por ID con formato código - nombre"""
        try:
            diagnosis = self.db.query(CIE10Catalog).filter(CIE10Catalog.id == diagnosis_id).first()
            if diagnosis:
                # Formato: IF(codigo!='',CONCAT(codigo,' - ',nombre),nombre)
                if diagnosis.codigo and diagnosis.codigo.strip():
                    return f"{diagnosis.codigo} - {diagnosis.nombre}"
                else:
                    return diagnosis.nombre
            return None
        except Exception as e:
            print(f"Error getting diagnosis name for ID {diagnosis_id}: {e}")
            return None
    
    def get_procedure_name(self, procedure_id: int) -> Optional[str]:
        """Obtener el nombre de un procedimiento por ID"""
        try:
            procedure = self.db.query(ProcedureCatalog).filter(ProcedureCatalog.id == procedure_id).first()
            if procedure:
                return procedure.descripcion
            return None
        except Exception as e:
            print(f"Error getting procedure name for ID {procedure_id}: {e}")
            return None
    
    def get_specialty_name(self, specialty_id: int) -> Optional[str]:
        """Obtener el nombre de una especialidad por ID"""
        try:
            specialty = self.db.query(SpecialtyCatalog).filter(SpecialtyCatalog.id == specialty_id).first()
            if specialty:
                return specialty.nombre
            return None
        except Exception as e:
            print(f"Error getting specialty name for ID {specialty_id}: {e}")
            return None
    
    def get_diagnosis_info(self, diagnosis_id: int) -> Optional[Dict]:
        """Obtener información completa de un diagnóstico"""
        try:
            diagnosis = self.db.query(CIE10Catalog).filter(CIE10Catalog.id == diagnosis_id).first()
            if diagnosis:
                return diagnosis.to_dict()
            return None
        except Exception as e:
            print(f"Error getting diagnosis info for ID {diagnosis_id}: {e}")
            return None
    
    def get_procedure_info(self, procedure_id: int) -> Optional[Dict]:
        """Obtener información completa de un procedimiento"""
        try:
            procedure = self.db.query(ProcedureCatalog).filter(ProcedureCatalog.id == procedure_id).first()
            if procedure:
                return procedure.to_dict()
            return None
        except Exception as e:
            print(f"Error getting procedure info for ID {procedure_id}: {e}")
            return None
    
    def get_specialty_info(self, specialty_id: int) -> Optional[Dict]:
        """Obtener información completa de una especialidad"""
        try:
            specialty = self.db.query(SpecialtyCatalog).filter(SpecialtyCatalog.id == specialty_id).first()
            if specialty:
                return specialty.to_dict()
            return None
        except Exception as e:
            print(f"Error getting specialty info for ID {specialty_id}: {e}")
            return None
    
    def batch_get_diagnosis_names(self, diagnosis_ids: List[int]) -> Dict[int, str]:
        """Obtener nombres de múltiples diagnósticos"""
        try:
            diagnoses = self.db.query(CIE10Catalog).filter(CIE10Catalog.id.in_(diagnosis_ids)).all()
            return {diag.id: diag.nombre for diag in diagnoses}
        except Exception as e:
            print(f"Error batch getting diagnosis names: {e}")
            return {}
    
    def batch_get_procedure_names(self, procedure_ids: List[int]) -> Dict[int, str]:
        """Obtener nombres de múltiples procedimientos"""
        try:
            procedures = self.db.query(ProcedureCatalog).filter(ProcedureCatalog.id.in_(procedure_ids)).all()
            return {proc.id: proc.descripcion for proc in procedures}
        except Exception as e:
            print(f"Error batch getting procedure names: {e}")
            return {}
    
    def batch_get_specialty_names(self, specialty_ids: List[int]) -> Dict[int, str]:
        """Obtener nombres de múltiples especialidades"""
        try:
            specialties = self.db.query(SpecialtyCatalog).filter(SpecialtyCatalog.id.in_(specialty_ids)).all()
            return {spec.id: spec.nombre for spec in specialties}
        except Exception as e:
            print(f"Error batch getting specialty names: {e}")
            return {}
    
    def get_active_diagnoses(self, limit: int = 10) -> List[Dict]:
        """Obtener diagnósticos activos con formato código - nombre"""
        try:
            # Simulamos el query: SELECT id, IF(codigo!='',CONCAT(codigo,' - ',nombre),nombre) AS nombre FROM cat_cie10 WHERE estado='Activo'
            diagnoses = self.db.query(CIE10Catalog).limit(limit).all()
            result = []
            
            for diagnosis in diagnoses:
                if diagnosis.codigo and diagnosis.codigo.strip():
                    display_name = f"{diagnosis.codigo} - {diagnosis.nombre}"
                else:
                    display_name = diagnosis.nombre
                
                result.append({
                    "id": diagnosis.id,
                    "codigo": diagnosis.codigo,
                    "nombre": diagnosis.nombre,
                    "display_name": display_name
                })
            
            return result
        except Exception as e:
            print(f"Error getting active diagnoses: {e}")
            return []



