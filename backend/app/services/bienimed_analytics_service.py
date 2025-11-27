"""
Servicio de Analytics usando datos de Bienimed
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

# Importar servicios de Bienimed
from app.integrations.bienimed.services.patient_service import PatientService
from app.integrations.bienimed.services.doctor_service import DoctorService
from app.integrations.bienimed.services.diagnosis_service import DiagnosisService
from app.integrations.bienimed.services.procedure_service import ProcedureService
from app.integrations.bienimed.services.referral_service import ReferralService
from app.integrations.bienimed.services.prescription_service import PrescriptionService
from app.integrations.bienimed.services.laboratory_order_service import LaboratoryOrderService
from app.integrations.bienimed.services.imaging_order_service import ImagingOrderService
from app.integrations.bienimed.services.invoice_service import InvoiceService

class BienimedAnalyticsService:
    def __init__(self):
        self.patient_service = PatientService()
        self.doctor_service = DoctorService()
        self.diagnosis_service = DiagnosisService()
        self.procedure_service = ProcedureService()
        self.referral_service = ReferralService()
        self.prescription_service = PrescriptionService()
        self.laboratory_service = LaboratoryOrderService()
        self.imaging_service = ImagingOrderService()
        self.invoice_service = InvoiceService()
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas para el dashboard"""
        try:
            # Contar totales
            total_patients = self.patient_service.count_patients()
            total_doctors = self.doctor_service.count_doctors()
            total_diagnoses = self.diagnosis_service.count_diagnoses()
            total_procedures = self.procedure_service.count_procedures()
            total_referrals = self.referral_service.count_referrals()
            total_prescriptions = self.prescription_service.count_prescriptions()
            total_lab_orders = self.laboratory_service.count_laboratory_orders()
            total_imaging_orders = self.imaging_service.count_imaging_orders()
            total_invoices = self.invoice_service.count_invoices()
            
            # Calcular totales financieros
            invoices = self.invoice_service.get_invoices(limit=1000)
            total_revenue = sum(float(invoice.total) for invoice in invoices if invoice.total)
            avg_invoice = total_revenue / len(invoices) if invoices else 0
            
            return {
                "total_patients": total_patients,
                "total_doctors": total_doctors,
                "total_diagnoses": total_diagnoses,
                "total_procedures": total_procedures,
                "total_referrals": total_referrals,
                "total_prescriptions": total_prescriptions,
                "total_lab_orders": total_lab_orders,
                "total_imaging_orders": total_imaging_orders,
                "total_invoices": total_invoices,
                "total_revenue": round(total_revenue, 2),
                "avg_invoice": round(avg_invoice, 2),
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error getting dashboard stats: {e}")
            return {}
        finally:
            self._close_services()
    
    def get_patient_flow_analytics(self) -> Dict[str, Any]:
        """Analizar flujos de pacientes basados en datos reales"""
        try:
            # Obtener diagnósticos más comunes
            diagnoses = self.diagnosis_service.get_diagnoses(limit=100)
            diagnosis_counts = {}
            for diagnosis in diagnoses:
                diag_id = diagnosis.iddiagnostico
                diagnosis_counts[diag_id] = diagnosis_counts.get(diag_id, 0) + 1
            
            # Obtener procedimientos más comunes
            procedures = self.procedure_service.get_procedures(limit=100)
            procedure_counts = {}
            for procedure in procedures:
                proc_id = procedure.idprocedimiento
                if proc_id:
                    procedure_counts[proc_id] = procedure_counts.get(proc_id, 0) + 1
            
            # Obtener referencias más comunes
            referrals = self.referral_service.get_referrals(limit=100)
            referral_counts = {}
            for referral in referrals:
                spec_id = referral.idespecialidad
                referral_counts[spec_id] = referral_counts.get(spec_id, 0) + 1
            
            # Obtener órdenes de laboratorio
            lab_orders = self.laboratory_service.get_laboratory_orders(limit=100)
            lab_count = len(lab_orders)
            
            # Obtener órdenes de imagenología
            imaging_orders = self.imaging_service.get_imaging_orders(limit=100)
            imaging_count = len(imaging_orders)
            
            return {
                "most_common_diagnoses": dict(sorted(diagnosis_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
                "most_common_procedures": dict(sorted(procedure_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
                "most_common_referrals": dict(sorted(referral_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
                "lab_orders_count": lab_count,
                "imaging_orders_count": imaging_count,
                "total_consultations": len(diagnoses),
                "analysis_date": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error getting patient flow analytics: {e}")
            return {}
        finally:
            self._close_services()
    
    def get_revenue_analytics(self) -> Dict[str, Any]:
        """Analizar datos de facturación"""
        try:
            invoices = self.invoice_service.get_invoices(limit=1000)
            
            # Análisis por mes (simulado)
            monthly_revenue = {}
            for invoice in invoices:
                if invoice.created_date:
                    month_key = invoice.created_date.strftime("%Y-%m")
                    monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + float(invoice.total or 0)
            
            # Análisis por paciente
            patient_revenue = {}
            for invoice in invoices:
                if invoice.id_patient:
                    patient_revenue[invoice.id_patient] = patient_revenue.get(invoice.id_patient, 0) + float(invoice.total or 0)
            
            # Top pacientes por facturación
            top_patients = dict(sorted(patient_revenue.items(), key=lambda x: x[1], reverse=True)[:10])
            
            return {
                "monthly_revenue": monthly_revenue,
                "top_patients_by_revenue": top_patients,
                "total_invoices_analyzed": len(invoices),
                "analysis_date": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error getting revenue analytics: {e}")
            return {}
        finally:
            self._close_services()
    
    def get_doctor_performance(self) -> Dict[str, Any]:
        """Analizar rendimiento de doctores"""
        try:
            doctors = self.doctor_service.get_doctors(limit=50)
            doctor_stats = {}
            
            for doctor in doctors:
                # Contar diagnósticos por doctor
                diagnoses = self.diagnosis_service.get_diagnoses(limit=1000)
                doctor_diagnoses = [d for d in diagnoses if d.idusuario == doctor.idusuario]
                
                # Contar procedimientos por doctor
                procedures = self.procedure_service.get_procedures(limit=1000)
                doctor_procedures = [p for p in procedures if p.idusuario == doctor.idusuario]
                
                # Contar recetas por doctor
                prescriptions = self.prescription_service.get_prescriptions(limit=1000)
                doctor_prescriptions = [pr for pr in prescriptions if pr.iddiagnostico in [d.iddiagnostico for d in doctor_diagnoses]]
                
                doctor_stats[doctor.id] = {
                    "name": f"Dr. {doctor.primernombre} {doctor.apellidopaterno}",
                    "specialty_id": doctor.idespecialidad,
                    "total_diagnoses": len(doctor_diagnoses),
                    "total_procedures": len(doctor_procedures),
                    "total_prescriptions": len(doctor_prescriptions),
                    "total_consultations": len(doctor_diagnoses) + len(doctor_procedures)
                }
            
            return {
                "doctor_performance": doctor_stats,
                "total_doctors_analyzed": len(doctors),
                "analysis_date": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error getting doctor performance: {e}")
            return {}
        finally:
            self._close_services()
    
    def generate_flow_recommendations(self) -> List[Dict[str, Any]]:
        """Generar recomendaciones de flujos basadas en datos reales"""
        try:
            analytics = self.get_patient_flow_analytics()
            recommendations = []
            
            # Flujo basado en diagnósticos más comunes
            if analytics.get("most_common_diagnoses"):
                top_diagnosis = list(analytics["most_common_diagnoses"].keys())[0]
                recommendations.append({
                    "type": "diagnosis_based",
                    "name": f"Flujo para Diagnóstico {top_diagnosis}",
                    "description": f"Flujo optimizado basado en el diagnóstico más común (ID: {top_diagnosis})",
                    "steps": [
                        {"type": "consultation", "name": "Consulta Inicial", "cost": 35.0, "duration": 20},
                        {"type": "laboratory", "name": "Exámenes de Laboratorio", "cost": 30.0, "duration": 15},
                        {"type": "diagnosis", "name": "Diagnóstico", "cost": 0.0, "duration": 10},
                        {"type": "prescription", "name": "Prescripción", "cost": 0.0, "duration": 5}
                    ],
                    "estimated_cost": 65.0,
                    "estimated_duration": 50,
                    "frequency": analytics["most_common_diagnoses"][top_diagnosis]
                })
            
            # Flujo basado en procedimientos más comunes
            if analytics.get("most_common_procedures"):
                top_procedure = list(analytics["most_common_procedures"].keys())[0]
                recommendations.append({
                    "type": "procedure_based",
                    "name": f"Flujo para Procedimiento {top_procedure}",
                    "description": f"Flujo optimizado basado en el procedimiento más común (ID: {top_procedure})",
                    "steps": [
                        {"type": "consultation", "name": "Consulta Pre-Procedimiento", "cost": 35.0, "duration": 20},
                        {"type": "laboratory", "name": "Exámenes Pre-Operatorios", "cost": 45.0, "duration": 20},
                        {"type": "procedure", "name": "Procedimiento", "cost": 120.0, "duration": 60},
                        {"type": "followup", "name": "Seguimiento", "cost": 25.0, "duration": 15}
                    ],
                    "estimated_cost": 225.0,
                    "estimated_duration": 115,
                    "frequency": analytics["most_common_procedures"][top_procedure]
                })
            
            # Flujo basado en referencias más comunes
            if analytics.get("most_common_referrals"):
                top_referral = list(analytics["most_common_referrals"].keys())[0]
                recommendations.append({
                    "type": "referral_based",
                    "name": f"Flujo de Referencia a Especialidad {top_referral}",
                    "description": f"Flujo optimizado para referencias a especialidad {top_referral}",
                    "steps": [
                        {"type": "consultation", "name": "Consulta General", "cost": 35.0, "duration": 20},
                        {"type": "referral", "name": "Referencia Especializada", "cost": 0.0, "duration": 10},
                        {"type": "specialist", "name": "Consulta Especialista", "cost": 80.0, "duration": 30},
                        {"type": "followup", "name": "Seguimiento", "cost": 25.0, "duration": 15}
                    ],
                    "estimated_cost": 140.0,
                    "estimated_duration": 75,
                    "frequency": analytics["most_common_referrals"][top_referral]
                })
            
            return recommendations
        except Exception as e:
            print(f"Error generating flow recommendations: {e}")
            return []
        finally:
            self._close_services()
    
    def _close_services(self):
        """Cerrar todas las conexiones de servicios"""
        try:
            self.patient_service.close()
            self.doctor_service.close()
            self.diagnosis_service.close()
            self.procedure_service.close()
            self.referral_service.close()
            self.prescription_service.close()
            self.laboratory_service.close()
            self.imaging_service.close()
            self.invoice_service.close()
        except:
            pass



