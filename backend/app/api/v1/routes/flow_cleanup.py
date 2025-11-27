"""
Rutas para limpieza de flujos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.patient_flow_service import PatientFlowService
import re

router = APIRouter()

@router.delete("/cleanup-old-flows")
def cleanup_old_flows():
    """Eliminar flujos que tengan IDs en el nombre"""
    try:
        db = next(get_db())
        flow_service = PatientFlowService(db)
        
        # Obtener todos los flujos activos
        all_flows = flow_service.get_flows()
        
        # Patrones para identificar flujos con IDs
        patterns = [
            r"Flujo Diagnóstico \d+",
            r"Flujo Procedimiento \d+", 
            r"Flujo Referencia Especialidad \d+"
        ]
        
        flows_to_delete = []
        
        for flow in all_flows:
            for pattern in patterns:
                if re.match(pattern, flow.name):
                    flows_to_delete.append(flow)
                    break
        
        deleted_count = 0
        deleted_flows = []
        
        for flow in flows_to_delete:
            try:
                flow_service.delete_flow(flow.id)
                deleted_count += 1
                deleted_flows.append({
                    "id": str(flow.id),
                    "name": flow.name
                })
            except Exception as e:
                print(f"Error deleting flow {flow.name}: {e}")
                continue
        
        db.close()
        
        return {
            "message": f"Se eliminaron {deleted_count} flujos con IDs en el nombre",
            "deleted_flows": deleted_flows,
            "total_deleted": deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al limpiar flujos: {str(e)}")

@router.get("/count-old-flows")
def count_old_flows():
    """Contar flujos que tengan IDs en el nombre"""
    try:
        db = next(get_db())
        flow_service = PatientFlowService(db)
        
        # Obtener todos los flujos activos
        all_flows = flow_service.get_flows()
        
        # Patrones para identificar flujos con IDs
        patterns = [
            r"Flujo Diagnóstico \d+",
            r"Flujo Procedimiento \d+", 
            r"Flujo Referencia Especialidad \d+"
        ]
        
        old_flows = []
        
        for flow in all_flows:
            for pattern in patterns:
                if re.match(pattern, flow.name):
                    old_flows.append({
                        "id": str(flow.id),
                        "name": flow.name
                    })
                    break
        
        db.close()
        
        return {
            "total_old_flows": len(old_flows),
            "old_flows": old_flows
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al contar flujos antiguos: {str(e)}")

@router.delete("/cleanup-generic-flows")
def cleanup_generic_flows():
    """Eliminar flujos genéricos duplicados (Laboratorio, Imagenología, Emergencia)"""
    try:
        db = next(get_db())
        flow_service = PatientFlowService(db)
        
        # Obtener todos los flujos activos
        all_flows = flow_service.get_flows()
        
        # Patrones para identificar flujos genéricos duplicados
        generic_patterns = [
            r"Flujo Laboratorio Completo",
            r"Flujo Imagenología Completo",
            r"Flujo de Emergencia"
        ]
        
        flows_to_delete = []
        
        for flow in all_flows:
            for pattern in generic_patterns:
                if re.match(pattern, flow.name):
                    flows_to_delete.append(flow)
                    break
        
        deleted_count = 0
        deleted_flows = []
        
        for flow in flows_to_delete:
            try:
                flow_service.delete_flow(flow.id)
                deleted_count += 1
                deleted_flows.append({
                    "id": str(flow.id),
                    "name": flow.name
                })
            except Exception as e:
                print(f"Error deleting flow {flow.name}: {e}")
                continue
        
        db.close()
        
        return {
            "message": f"Se eliminaron {deleted_count} flujos genéricos duplicados",
            "deleted_flows": deleted_flows,
            "total_deleted": deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al limpiar flujos genéricos: {str(e)}")

@router.delete("/cleanup-all-duplicates")
def cleanup_all_duplicates():
    """Eliminar todos los flujos duplicados, manteniendo solo uno de cada tipo"""
    try:
        db = next(get_db())
        flow_service = PatientFlowService(db)
        
        # Obtener todos los flujos activos
        all_flows = flow_service.get_flows()
        
        # Agrupar por nombre
        flows_by_name = {}
        for flow in all_flows:
            if flow.name not in flows_by_name:
                flows_to_delete = []
            flows_by_name[flow.name] = flows_by_name.get(flow.name, []) + [flow]
        
        deleted_count = 0
        deleted_flows = []
        
        # Para cada grupo, mantener solo el primero y eliminar el resto
        for name, flows in flows_by_name.items():
            if len(flows) > 1:
                # Mantener el primero (más reciente o el que tenga mejor ID)
                flows_to_delete = flows[1:]  # Eliminar todos excepto el primero
                
                for flow in flows_to_delete:
                    try:
                        flow_service.delete_flow(flow.id)
                        deleted_count += 1
                        deleted_flows.append({
                            "id": str(flow.id),
                            "name": flow.name
                        })
                    except Exception as e:
                        print(f"Error deleting flow {flow.name}: {e}")
                        continue
        
        db.close()
        
        return {
            "message": f"Se eliminaron {deleted_count} flujos duplicados",
            "deleted_flows": deleted_flows,
            "total_deleted": deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al limpiar duplicados: {str(e)}")



