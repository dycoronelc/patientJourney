"""
Servicio para integración con sistemas externos (LIS, PACS, etc.)
"""

import httpx
import structlog
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.core.config import settings

logger = structlog.get_logger()

class ExternalSystemsService:
    """Servicio para consultar sistemas externos de salud"""
    
    @staticmethod
    async def fetch_laboratory_orders(patient_id: str, external_system_url: str) -> List[Dict[str, Any]]:
        """
        Consultar órdenes de laboratorio desde sistema externo (LIS)
        
        Args:
            patient_id: ID del paciente
            external_system_url: URL del sistema externo
            
        Returns:
            Lista de órdenes de laboratorio
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{external_system_url}/api/laboratory/orders",
                    params={"patient_id": patient_id},
                    headers={"Authorization": f"Bearer {settings.FHIR_BASE_URL}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Laboratory orders fetched", patient_id=patient_id, count=len(data))
                    return data
                else:
                    logger.error("Error fetching laboratory orders", status_code=response.status_code)
                    return []
                    
        except httpx.TimeoutException:
            logger.error("Timeout fetching laboratory orders", patient_id=patient_id)
            return []
        except Exception as e:
            logger.error("Error fetching laboratory orders", error=str(e))
            return []
    
    @staticmethod
    async def fetch_imaging_orders(patient_id: str, external_system_url: str) -> List[Dict[str, Any]]:
        """
        Consultar órdenes de imágenes desde sistema externo (PACS)
        
        Args:
            patient_id: ID del paciente
            external_system_url: URL del sistema PACS
            
        Returns:
            Lista de órdenes de imágenes
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{external_system_url}/api/imaging/orders",
                    params={"patient_id": patient_id},
                    headers={"Authorization": f"Bearer {settings.FHIR_BASE_URL}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Imaging orders fetched", patient_id=patient_id, count=len(data))
                    return data
                else:
                    logger.error("Error fetching imaging orders", status_code=response.status_code)
                    return []
                    
        except httpx.TimeoutException:
            logger.error("Timeout fetching imaging orders", patient_id=patient_id)
            return []
        except Exception as e:
            logger.error("Error fetching imaging orders", error=str(e))
            return []
    
    @staticmethod
    async def fetch_referrals(patient_id: str, external_system_url: str) -> List[Dict[str, Any]]:
        """
        Consultar referencias desde sistema externo
        
        Args:
            patient_id: ID del paciente
            external_system_url: URL del sistema de referencias
            
        Returns:
            Lista de referencias
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{external_system_url}/api/referrals",
                    params={"patient_id": patient_id},
                    headers={"Authorization": f"Bearer {settings.FHIR_BASE_URL}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Referrals fetched", patient_id=patient_id, count=len(data))
                    return data
                else:
                    logger.error("Error fetching referrals", status_code=response.status_code)
                    return []
                    
        except httpx.TimeoutException:
            logger.error("Timeout fetching referrals", patient_id=patient_id)
            return []
        except Exception as e:
            logger.error("Error fetching referrals", error=str(e))
            return []
    
    @staticmethod
    async def fetch_fhir_resources(patient_id: str, resource_type: str) -> List[Dict[str, Any]]:
        """
        Consultar recursos FHIR desde servidor externo
        
        Args:
            patient_id: ID del paciente
            resource_type: Tipo de recurso FHIR (Observation, DiagnosticReport, etc.)
            
        Returns:
            Lista de recursos FHIR
        """
        try:
            if not settings.FHIR_BASE_URL:
                logger.warning("FHIR base URL not configured")
                return []
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{settings.FHIR_BASE_URL}/{resource_type}",
                    params={"patient": patient_id}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("FHIR resources fetched", resource_type=resource_type, patient_id=patient_id)
                    return data.get('entry', [])
                else:
                    logger.error("Error fetching FHIR resources", status_code=response.status_code)
                    return []
                    
        except Exception as e:
            logger.error("Error fetching FHIR resources", error=str(e))
            return []
    
    @staticmethod
    def parse_laboratory_results(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parsear resultados de laboratorio del formato externo
        
        Args:
            raw_data: Datos crudos del sistema externo
            
        Returns:
            Datos parseados en formato estándar
        """
        try:
            # Implementar lógica de parseo según el formato del sistema externo
            return {
                "orderId": raw_data.get("id"),
                "patientId": raw_data.get("patientId"),
                "orderType": raw_data.get("testType"),
                "status": raw_data.get("status"),
                "results": raw_data.get("results"),
                "orderDate": raw_data.get("orderDate"),
                "completedDate": raw_data.get("completedDate"),
            }
        except Exception as e:
            logger.error("Error parsing laboratory results", error=str(e))
            return {}
    
    @staticmethod
    def parse_imaging_results(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parsear resultados de imágenes del formato DICOM/PACS
        
        Args:
            raw_data: Datos crudos del sistema PACS
            
        Returns:
            Datos parseados en formato estándar
        """
        try:
            return {
                "orderId": raw_data.get("id"),
                "patientId": raw_data.get("patientId"),
                "imagingType": raw_data.get("modality"),
                "status": raw_data.get("status"),
                "images": raw_data.get("imageUrls"),
                "report": raw_data.get("report"),
                "orderDate": raw_data.get("studyDate"),
                "completedDate": raw_data.get("reportDate"),
            }
        except Exception as e:
            logger.error("Error parsing imaging results", error=str(e))
            return {}










