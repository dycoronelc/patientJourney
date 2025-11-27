from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class StepBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Nombre del paso")
    description: Optional[str] = Field(None, description="Descripción del paso")
    step_type: str = Field(..., description="Tipo de paso")
    base_cost: float = Field(0.0, ge=0, description="Costo base del paso")
    cost_unit: str = Field("USD", max_length=20, description="Unidad monetaria")
    duration_minutes: Optional[int] = Field(None, ge=0, description="Duración en minutos")
    icon: Optional[str] = Field(None, max_length=50, description="Icono Material-UI")
    color: str = Field("#1976d2", max_length=20, description="Color del borde")
    is_active: bool = Field(True, description="Si el paso está activo")
    category: Optional[str] = Field(None, max_length=50, description="Categoría")
    tags: Optional[List[str]] = Field(None, description="Tags del paso")

    @validator('step_type')
    def validate_step_type(cls, v):
        valid_types = ['consultation', 'laboratory', 'imaging', 'referral', 'discharge', 'procedure', 'medication', 'prescription', 'followup', 'emergency', 'diagnosis', 'surgery', 'recovery']
        if v not in valid_types:
            raise ValueError(f'step_type debe ser uno de: {valid_types}')
        return v

    @validator('color')
    def validate_color(cls, v):
        # Validar que sea un color hexadecimal válido
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('color debe ser un código hexadecimal válido (#RRGGBB)')
        return v


class StepCreate(StepBase):
    pass


class StepUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    step_type: Optional[str] = None
    base_cost: Optional[float] = Field(None, ge=0)
    cost_unit: Optional[str] = Field(None, max_length=20)
    duration_minutes: Optional[int] = Field(None, ge=0)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None

    @validator('step_type')
    def validate_step_type(cls, v):
        if v is not None:
            valid_types = ['consultation', 'laboratory', 'imaging', 'referral', 'discharge', 'procedure', 'medication', 'prescription', 'followup', 'emergency', 'diagnosis', 'surgery', 'recovery']
            if v not in valid_types:
                raise ValueError(f'step_type debe ser uno de: {valid_types}')
        return v

    @validator('color')
    def validate_color(cls, v):
        if v is not None:
            if not v.startswith('#') or len(v) != 7:
                raise ValueError('color debe ser un código hexadecimal válido (#RRGGBB)')
        return v


class StepResponse(StepBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class FlowStepBase(BaseModel):
    flow_id: str = Field(..., description="ID del flujo")
    step_id: str = Field(..., description="ID del paso")
    order_index: int = Field(..., ge=0, description="Orden en el flujo")
    custom_name: Optional[str] = Field(None, max_length=100, description="Nombre personalizado")
    custom_cost: Optional[float] = Field(None, ge=0, description="Costo personalizado")
    custom_description: Optional[str] = Field(None, description="Descripción personalizada")
    next_step_ids: Optional[List[str]] = Field(None, description="IDs de pasos siguientes")
    previous_step_ids: Optional[List[str]] = Field(None, description="IDs de pasos anteriores")
    position_x: int = Field(250, description="Posición X")
    position_y: int = Field(100, description="Posición Y")


class FlowStepCreate(FlowStepBase):
    pass


class FlowStepUpdate(BaseModel):
    order_index: Optional[int] = Field(None, ge=0)
    custom_name: Optional[str] = Field(None, max_length=100)
    custom_cost: Optional[float] = Field(None, ge=0)
    custom_description: Optional[str] = None
    next_step_ids: Optional[List[str]] = None
    previous_step_ids: Optional[List[str]] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None


class FlowStepResponse(FlowStepBase):
    id: str
    step: Optional[StepResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StepTemplate(BaseModel):
    """Plantilla para crear pasos predefinidos"""
    name: str
    description: str
    step_type: str
    base_cost: float
    duration_minutes: Optional[int] = None
    icon: str
    color: str
    category: str
    tags: List[str] = []
