"""
Rutas para consultar referencias de Bienimed
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_bienimed_db
from ..services.referral_service import ReferralService
from ..schemas.referral import ReferralResponse, ReferralListResponse

router = APIRouter()

@router.get("/", response_model=ReferralListResponse)
def get_referrals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    consulta_id: Optional[int] = Query(None, description="Filtrar por consulta"),
    especialidad_id: Optional[int] = Query(None, description="Filtrar por especialidad"),
    db: Session = Depends(get_bienimed_db)
):
    """Obtener lista de referencias de Bienimed"""
    try:
        service = ReferralService(db)
        referrals = service.get_referrals(skip=skip, limit=limit, consulta_id=consulta_id, especialidad_id=especialidad_id)
        total = service.count_referrals(consulta_id=consulta_id)
        
        return ReferralListResponse(
            referrals=[referral.to_dict() for referral in referrals],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar referencias: {str(e)}")
    finally:
        service.close()

@router.get("/{referral_id}", response_model=ReferralResponse)
def get_referral(referral_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener una referencia específica por ID"""
    try:
        service = ReferralService(db)
        referral = service.get_referral_by_id(referral_id)
        
        if not referral:
            raise HTTPException(status_code=404, detail="Referencia no encontrada")
        
        return referral.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar referencia: {str(e)}")
    finally:
        service.close()

@router.get("/consultation/{consulta_id}", response_model=ReferralListResponse)
def get_consultation_referrals(consulta_id: int, db: Session = Depends(get_bienimed_db)):
    """Obtener referencias de una consulta"""
    try:
        service = ReferralService(db)
        referrals = service.get_consultation_referrals(consulta_id)
        
        return ReferralListResponse(
            referrals=[referral.to_dict() for referral in referrals],
            total=len(referrals),
            page=1,
            per_page=len(referrals)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar referencias de la consulta: {str(e)}")
    finally:
        service.close()



