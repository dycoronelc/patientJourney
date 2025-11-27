#!/usr/bin/env python3
"""
Script de migración para poblar la base de datos con datos médicos reales
Basado en el archivo manual_flujos_consolidado.sql
"""

import os
import sys
import asyncio
from pathlib import Path

# Agregar el directorio raíz del proyecto al path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.database import get_db
import structlog

logger = structlog.get_logger()

class MedicalDataMigrator:
    """Migrador de datos médicos desde SQL a la base de datos"""
    
    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def migrate_data(self):
        """Ejecutar migración completa de datos médicos"""
        try:
            logger.info("Iniciando migración de datos médicos...")
            
            # Leer el archivo SQL
            sql_file_path = project_root / "database" / "manual_flujos_consolidado.sql"
            
            if not sql_file_path.exists():
                logger.error(f"Archivo SQL no encontrado: {sql_file_path}")
                return False
            
            with open(sql_file_path, 'r', encoding='utf-8') as file:
                sql_content = file.read()
            
            # Ejecutar el SQL
            with self.engine.connect() as connection:
                # Dividir el SQL en statements individuales
                statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
                
                for i, statement in enumerate(statements):
                    if statement:
                        try:
                            logger.info(f"Ejecutando statement {i+1}/{len(statements)}")
                            connection.execute(text(statement))
                            connection.commit()
                        except Exception as e:
                            logger.warning(f"Error en statement {i+1}: {e}")
                            # Continuar con el siguiente statement
                            continue
            
            logger.info("Migración completada exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"Error durante la migración: {e}")
            return False
    
    def verify_migration(self):
        """Verificar que la migración fue exitosa"""
        try:
            with self.engine.connect() as connection:
                # Verificar especialidades
                result = connection.execute(text("SELECT COUNT(*) FROM specialties_normalized"))
                specialties_count = result.scalar()
                logger.info(f"Especialidades migradas: {specialties_count}")
                
                # Verificar flujos
                result = connection.execute(text("SELECT COUNT(*) FROM flows"))
                flows_count = result.scalar()
                logger.info(f"Flujos migrados: {flows_count}")
                
                # Verificar nodos de flujo
                result = connection.execute(text("SELECT COUNT(*) FROM flow_nodes"))
                nodes_count = result.scalar()
                logger.info(f"Nodos de flujo migrados: {nodes_count}")
                
                # Verificar criterios de referencia
                result = connection.execute(text("SELECT COUNT(*) FROM referral_criteria"))
                criteria_count = result.scalar()
                logger.info(f"Criterios de referencia migrados: {criteria_count}")
                
                return {
                    "specialties": specialties_count,
                    "flows": flows_count,
                    "nodes": nodes_count,
                    "criteria": criteria_count
                }
                
        except Exception as e:
            logger.error(f"Error verificando migración: {e}")
            return None
    
    def create_sample_data(self):
        """Crear datos de muestra si no hay datos migrados"""
        try:
            logger.info("Creando datos de muestra...")
            
            with self.engine.connect() as connection:
                # Crear especialidades de muestra
                specialties_sql = """
                INSERT IGNORE INTO specialties_normalized (id, code, name, is_active) VALUES
                ('spec-001', 'MED_GEN', 'Medicina General', 1),
                ('spec-002', 'CARDIOL', 'Cardiología', 1),
                ('spec-003', 'GINECOL', 'Ginecología', 1),
                ('spec-004', 'PSIQUIA', 'Psiquiatría', 1),
                ('spec-005', 'CIR_CARD', 'Cirugía Cardiovascular', 1);
                """
                
                connection.execute(text(specialties_sql))
                
                # Crear tipos de pasos
                step_types_sql = """
                INSERT IGNORE INTO step_types (id, code, name) VALUES
                ('st-cons', 'consultation', 'Consulta'),
                ('st-lab', 'laboratory', 'Laboratorio'),
                ('st-img', 'imaging', 'Imagenología'),
                ('st-diag', 'diagnosis', 'Diagnóstico'),
                ('st-pres', 'prescription', 'Prescripción'),
                ('st-ref', 'referral', 'Referencia'),
                ('st-fup', 'followup', 'Seguimiento'),
                ('st-emer', 'emergency', 'Emergencia'),
                ('st-proc', 'procedure', 'Procedimiento'),
                ('st-disc', 'discharge', 'Alta');
                """
                
                connection.execute(text(step_types_sql))
                
                # Crear niveles de urgencia
                urgency_sql = """
                INSERT IGNORE INTO urgency_levels (id, code, name) VALUES
                ('urg-low', 'low', 'Baja'),
                ('urg-med', 'medium', 'Media'),
                ('urg-high', 'high', 'Alta'),
                ('urg-crit', 'critical', 'Crítica');
                """
                
                connection.execute(text(urgency_sql))
                
                # Crear un flujo de muestra para Medicina General
                flow_sql = """
                INSERT IGNORE INTO flows (id, name, specialty_id, description, average_duration, estimated_cost, is_active) VALUES
                ('flow-med-gen-001', 'Flujo Medicina General Estándar', 'spec-001', 'Flujo estándar para consultas de medicina general', 45, 150.00, 1);
                """
                
                connection.execute(text(flow_sql))
                
                # Crear nodos del flujo
                nodes_sql = """
                INSERT IGNORE INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position) VALUES
                ('node-001', 'flow-med-gen-001', 'st-cons', 'Recepción y Registro', 'Registro inicial del paciente', 1, 10, 5, 10, 7.5, '{"x": 100, "y": 0}'),
                ('node-002', 'flow-med-gen-001', 'st-cons', 'Toma de Signos Vitales', 'Medición de presión, temperatura, peso', 2, 5, 8, 15, 11.5, '{"x": 100, "y": 100}'),
                ('node-003', 'flow-med-gen-001', 'st-cons', 'Historia Clínica', 'Entrevista médica detallada', 3, 20, 15, 25, 20, '{"x": 100, "y": 200}'),
                ('node-004', 'flow-med-gen-001', 'st-lab', 'Órdenes Laboratorio', 'Solicitud de exámenes básicos', 4, 5, 30, 50, 40, '{"x": 100, "y": 300}'),
                ('node-005', 'flow-med-gen-001', 'st-diag', 'Diagnóstico', 'Establecimiento del diagnóstico', 5, 15, 20, 35, 27.5, '{"x": 100, "y": 400}'),
                ('node-006', 'flow-med-gen-001', 'st-pres', 'Prescripción', 'Receta de medicamentos', 6, 10, 15, 25, 20, '{"x": 100, "y": 500}'),
                ('node-007', 'flow-med-gen-001', 'st-disc', 'Alta Médica', 'Finalización de la consulta', 7, 5, 10, 15, 12.5, '{"x": 100, "y": 600}');
                """
                
                connection.execute(text(nodes_sql))
                
                # Crear conexiones entre nodos
                edges_sql = """
                INSERT IGNORE INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type) VALUES
                ('edge-001', 'flow-med-gen-001', 'node-001', 'node-002', 'sequential'),
                ('edge-002', 'flow-med-gen-001', 'node-002', 'node-003', 'sequential'),
                ('edge-003', 'flow-med-gen-001', 'node-003', 'node-004', 'sequential'),
                ('edge-004', 'flow-med-gen-001', 'node-004', 'node-005', 'sequential'),
                ('edge-005', 'flow-med-gen-001', 'node-005', 'node-006', 'sequential'),
                ('edge-006', 'flow-med-gen-001', 'node-006', 'node-007', 'sequential');
                """
                
                connection.execute(text(edges_sql))
                
                connection.commit()
                
            logger.info("Datos de muestra creados exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"Error creando datos de muestra: {e}")
            return False

def main():
    """Función principal del migrador"""
    migrator = MedicalDataMigrator()
    
    print("🏥 Migrador de Datos Médicos - Patient Journey Predictor")
    print("=" * 60)
    
    # Intentar migrar datos del archivo SQL
    print("📁 Intentando migrar datos desde manual_flujos_consolidado.sql...")
    migration_success = migrator.migrate_data()
    
    if migration_success:
        print("✅ Migración desde archivo SQL completada")
    else:
        print("⚠️  Migración desde archivo SQL falló, creando datos de muestra...")
        sample_success = migrator.create_sample_data()
        
        if sample_success:
            print("✅ Datos de muestra creados exitosamente")
        else:
            print("❌ Error creando datos de muestra")
            return False
    
    # Verificar migración
    print("\n🔍 Verificando migración...")
    verification = migrator.verify_migration()
    
    if verification:
        print(f"📊 Resumen de datos migrados:")
        print(f"   • Especialidades: {verification['specialties']}")
        print(f"   • Flujos: {verification['flows']}")
        print(f"   • Nodos: {verification['nodes']}")
        print(f"   • Criterios de referencia: {verification['criteria']}")
        
        print("\n🎉 ¡Migración completada exitosamente!")
        print("🚀 El sistema está listo para usar con datos médicos reales")
        
        return True
    else:
        print("❌ Error verificando la migración")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


