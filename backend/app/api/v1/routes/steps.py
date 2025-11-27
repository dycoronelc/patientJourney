from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.core.database import get_db
from app.services.step_service import StepService
from app.models.step import Step
from app.schemas.step import (
    StepCreate, StepUpdate, StepResponse, 
    FlowStepCreate, FlowStepUpdate, FlowStepResponse,
    StepTemplate
)

router = APIRouter()


@router.get("/")
def get_steps(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    step_type: Optional[str] = Query(None, description="Filtrar por tipo de paso"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    is_active: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    db: Session = Depends(get_db)
):
    """Obtener lista de pasos con filtros opcionales"""
    try:
        # Construir consulta SQL directa para evitar conflictos de modelos
        query = """
            SELECT id, name, description, step_type, base_cost, cost_unit,
                   duration_minutes, icon, color, is_active, category, tags,
                   created_at, updated_at
            FROM steps
            WHERE 1=1
        """
        params = {}
        
        if step_type:
            query += " AND step_type = :step_type"
            params["step_type"] = step_type
        if category:
            query += " AND category = :category"
            params["category"] = category
        if is_active is not None:
            query += " AND is_active = :is_active"
            params["is_active"] = is_active
            
        query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
        params["limit"] = limit
        params["skip"] = skip
        
        # Ejecutar consulta
        result = db.execute(text(query), params)
        
        # Convertir a diccionario
        result_list = []
        for row in result:
            result_list.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "step_type": row[3],
                "base_cost": float(row[4]) if row[4] else 0.0,
                "cost_unit": row[5],
                "duration_minutes": row[6],
                "icon": row[7],
                "color": row[8],
                "is_active": bool(row[9]),
                "category": row[10],
                "tags": row[11].split(",") if row[11] else [],
                "created_at": row[12].isoformat() if row[12] else None,
                "updated_at": row[13].isoformat() if row[13] else None
            })
        
        return result_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.get("/{step_id}", response_model=StepResponse)
def get_step(step_id: str, db: Session = Depends(get_db)):
    """Obtener un paso específico por ID"""
    step_service = StepService(db)
    step = step_service.get_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Paso no encontrado")
    return step


@router.post("/", response_model=StepResponse)
def create_step(step_data: StepCreate, db: Session = Depends(get_db)):
    """Crear un nuevo paso"""
    try:
        step_service = StepService(db)
        
        # Verificar si ya existe un paso con el mismo nombre
        existing_step = db.query(Step).filter(Step.name == step_data.name).first()
        if existing_step:
            raise HTTPException(status_code=400, detail="Ya existe un paso con este nombre")
        
        step = step_service.create_step(step_data)
        
        # Convertir a diccionario para evitar problemas de serialización
        return {
            "id": step.id,
            "name": step.name,
            "description": step.description,
            "step_type": step.step_type,
            "base_cost": float(step.base_cost),
            "cost_unit": step.cost_unit,
            "duration_minutes": step.duration_minutes,
            "icon": step.icon,
            "color": step.color,
            "is_active": step.is_active,
            "category": step.category,
            "tags": step.tags.split(",") if step.tags else [],
            "created_at": step.created_at.isoformat() if step.created_at else None,
            "updated_at": step.updated_at.isoformat() if step.updated_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear paso: {str(e)}")


@router.put("/{step_id}", response_model=StepResponse)
def update_step(step_id: str, step_data: StepUpdate, db: Session = Depends(get_db)):
    """Actualizar un paso existente"""
    try:
        step_service = StepService(db)
        
        # Verificar si el nombre ya existe en otro paso
        if step_data.name:
            existing_step = db.query(Step).filter(
                Step.name == step_data.name, 
                Step.id != step_id
            ).first()
            if existing_step:
                raise HTTPException(status_code=400, detail="Ya existe otro paso con este nombre")
        
        updated_step = step_service.update_step(step_id, step_data)
        if not updated_step:
            raise HTTPException(status_code=404, detail="Paso no encontrado")
        
        # Convertir a diccionario para evitar problemas de serialización
        return {
            "id": updated_step.id,
            "name": updated_step.name,
            "description": updated_step.description,
            "step_type": updated_step.step_type,
            "base_cost": float(updated_step.base_cost),
            "cost_unit": updated_step.cost_unit,
            "duration_minutes": updated_step.duration_minutes,
            "icon": updated_step.icon,
            "color": updated_step.color,
            "is_active": updated_step.is_active,
            "category": updated_step.category,
            "tags": updated_step.tags.split(",") if updated_step.tags else [],
            "created_at": updated_step.created_at.isoformat() if updated_step.created_at else None,
            "updated_at": updated_step.updated_at.isoformat() if updated_step.updated_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar paso: {str(e)}")


@router.delete("/{step_id}")
def delete_step(step_id: str, db: Session = Depends(get_db)):
    """Eliminar un paso"""
    step_service = StepService(db)
    try:
        success = step_service.delete_step(step_id)
        if not success:
            raise HTTPException(status_code=404, detail="Paso no encontrado")
        return {"message": "Paso eliminado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/type/{step_type}", response_model=List[StepResponse])
def get_steps_by_type(step_type: str, db: Session = Depends(get_db)):
    """Obtener pasos por tipo"""
    step_service = StepService(db)
    steps = step_service.get_steps_by_type(step_type)
    return steps


@router.get("/categories/list")
def get_step_categories(db: Session = Depends(get_db)):
    """Obtener todas las categorías de pasos"""
    step_service = StepService(db)
    categories = step_service.get_step_categories()
    return {"categories": categories}


@router.post("/initialize-defaults")
def initialize_default_steps(db: Session = Depends(get_db)):
    """Inicializar pasos por defecto del sistema"""
    step_service = StepService(db)
    created_steps = step_service.create_default_steps()
    return {
        "message": f"Se crearon {len(created_steps)} pasos por defecto",
        "steps": [step.to_dict() for step in created_steps]
    }


# Endpoints para FlowSteps
@router.get("/flows/{flow_id}/steps", response_model=List[FlowStepResponse])
def get_flow_steps(flow_id: str, db: Session = Depends(get_db)):
    """Obtener todos los pasos de un flujo"""
    step_service = StepService(db)
    flow_steps = step_service.get_flow_steps(flow_id)
    return flow_steps


@router.post("/flows/{flow_id}/steps", response_model=FlowStepResponse)
def add_step_to_flow(
    flow_id: str, 
    flow_step_data: FlowStepCreate, 
    db: Session = Depends(get_db)
):
    """Agregar un paso a un flujo"""
    step_service = StepService(db)
    
    # Verificar que el flujo existe (aquí deberías verificar en tu modelo de flujos)
    # flow = flow_service.get_flow(flow_id)
    # if not flow:
    #     raise HTTPException(status_code=404, detail="Flujo no encontrado")
    
    # Verificar que el paso existe
    step = step_service.get_step(flow_step_data.step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Paso no encontrado")
    
    # Establecer el flow_id
    flow_step_data.flow_id = flow_id
    
    return step_service.create_flow_step(flow_step_data)


@router.put("/flows/steps/{flow_step_id}", response_model=FlowStepResponse)
def update_flow_step(
    flow_step_id: str, 
    flow_step_data: FlowStepUpdate, 
    db: Session = Depends(get_db)
):
    """Actualizar un paso en un flujo"""
    step_service = StepService(db)
    updated_flow_step = step_service.update_flow_step(flow_step_id, flow_step_data)
    if not updated_flow_step:
        raise HTTPException(status_code=404, detail="Paso del flujo no encontrado")
    return updated_flow_step


@router.delete("/flows/steps/{flow_step_id}")
def remove_step_from_flow(flow_step_id: str, db: Session = Depends(get_db)):
    """Eliminar un paso de un flujo"""
    step_service = StepService(db)
    success = step_service.delete_flow_step(flow_step_id)
    if not success:
        raise HTTPException(status_code=404, detail="Paso del flujo no encontrado")
    return {"message": "Paso eliminado del flujo exitosamente"}


@router.post("/flows/{flow_id}/reorder")
def reorder_flow_steps(
    flow_id: str, 
    step_orders: List[dict], 
    db: Session = Depends(get_db)
):
    """Reordenar los pasos de un flujo"""
    step_service = StepService(db)
    try:
        success = step_service.reorder_flow_steps(flow_id, step_orders)
        if success:
            return {"message": "Pasos reordenados exitosamente"}
        else:
            raise HTTPException(status_code=400, detail="Error al reordenar los pasos")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
