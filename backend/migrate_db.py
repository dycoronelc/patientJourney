#!/usr/bin/env python3
"""
Script para ejecutar migraciones de base de datos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from sqlalchemy import text

def run_migration():
    """Ejecutar migración para agregar columnas faltantes"""
    try:
        with engine.connect() as connection:
            migrations_applied = []
            
            # Lista de columnas a agregar
            columns_to_add = [
                {
                    'name': 'flow_edges',
                    'sql': "ADD COLUMN flow_edges JSON NULL COMMENT 'Conexiones entre pasos (edges del diagrama)'"
                },
                {
                    'name': 'estimated_cost',
                    'sql': "ADD COLUMN estimated_cost FLOAT DEFAULT 0.0 COMMENT 'Costo estimado total del flujo'"
                },
                {
                    'name': 'cost_breakdown',
                    'sql': "ADD COLUMN cost_breakdown JSON NULL COMMENT 'Desglose de costos por paso'"
                }
            ]
            
            for column_info in columns_to_add:
                col_name = column_info['name']
                
                # Verificar si la columna ya existe
                check_sql = f"""
                SELECT COUNT(*) as count
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'patient_flows' 
                AND COLUMN_NAME = '{col_name}'
                """
                
                result = connection.execute(text(check_sql))
                row = result.fetchone()
                
                if row and row[0] > 0:
                    print(f"Columna '{col_name}' ya existe, saltando...")
                    continue
                
                # Agregar columna
                migration_sql = f"ALTER TABLE patient_flows {column_info['sql']}"
                
                connection.execute(text(migration_sql))
                connection.commit()
                migrations_applied.append(col_name)
                print(f"   - Columna '{col_name}' agregada a 'patient_flows'")
            
            if migrations_applied:
                print(f"\nMigracion ejecutada exitosamente. Columnas agregadas: {', '.join(migrations_applied)}")
            else:
                print("\nNo se requirieron migraciones, todas las columnas ya existen.")
            
    except Exception as e:
        print(f"Error ejecutando migracion: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    print("Ejecutando migraciones de base de datos...")
    run_migration()
    print("\nMigraciones completadas!")

