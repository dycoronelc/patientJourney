"""
Migración de unificación de flujos - Versión Python
"""

import pymysql
import json
from datetime import datetime

PATIENT_JOURNEY_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'patient_journey',
    'port': 3306,
    'charset': 'utf8mb4'
}

def column_exists(cursor, table, column):
    """Verificar si una columna existe"""
    cursor.execute(f"""
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = 'patient_journey' 
        AND table_name = '{table}' 
        AND column_name = '{column}'
    """)
    return cursor.fetchone()['count'] > 0

def index_exists(cursor, table, index_name):
    """Verificar si un índice existe"""
    cursor.execute(f"""
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE table_schema = 'patient_journey' 
        AND table_name = '{table}' 
        AND index_name = '{index_name}'
    """)
    return cursor.fetchone()['count'] > 0

def execute_migration():
    """Ejecutar migración completa"""
    
    print("\n" + "=" * 100)
    print(" MIGRACION: UNIFICACION DE FLUJOS ")
    print("=" * 100)
    
    conn = pymysql.connect(**PATIENT_JOURNEY_CONFIG)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        # Paso 1: Respaldo
        print("\nPaso 1: Creando respaldos...")
        cursor.execute("DROP TABLE IF EXISTS flows_backup")
        cursor.execute("CREATE TABLE flows_backup AS SELECT * FROM flows")
        cursor.execute("DROP TABLE IF EXISTS patient_flows_backup")
        cursor.execute("CREATE TABLE patient_flows_backup AS SELECT * FROM patient_flows")
        conn.commit()
        print("[OK] Respaldos creados")
        
        # Paso 2: Agregar columnas
        print("\nPaso 2: Agregando columnas...")
        columns_to_add = [
            ('source_system', "VARCHAR(50) NOT NULL DEFAULT 'normalized'"),
            ('source_id', "VARCHAR(100) NULL"),
            ('flow_type', "VARCHAR(50) NULL"),
            ('is_template', "BOOLEAN DEFAULT FALSE"),
            ('code', "VARCHAR(50) NULL"),
            ('specialty_name', "VARCHAR(255) NULL"),
            ('complexity_level', "VARCHAR(20) NULL"),
            ('is_public', "BOOLEAN DEFAULT TRUE"),
            ('version', "VARCHAR(20) DEFAULT '1.0'"),
            ('created_by', "VARCHAR(100) NULL"),
            ('metadata', "JSON NULL"),
            ('flow_steps', "JSON NULL"),
            ('flow_edges', "JSON NULL"),
            ('resource_requirements', "JSON NULL"),
            ('cost_breakdown', "JSON NULL")
        ]
        
        for col_name, col_def in columns_to_add:
            if not column_exists(cursor, 'flows', col_name):
                cursor.execute(f"ALTER TABLE flows ADD COLUMN {col_name} {col_def}")
                print(f"  [+] {col_name}")
            else:
                print(f"  [SKIP] {col_name} ya existe")
        
        conn.commit()
        print("[OK] Columnas agregadas")
        
        # Paso 3: Crear índices
        print("\nPaso 3: Creando indices...")
        indexes = [
            ('idx_flows_source', 'source_system'),
            ('idx_flows_type', 'flow_type'),
            ('idx_flows_template', 'is_template'),
            ('idx_flows_code', 'code'),
            ('idx_flows_specialty_name', 'specialty_name')
        ]
        
        for idx_name, idx_col in indexes:
            if not index_exists(cursor, 'flows', idx_name):
                cursor.execute(f"CREATE INDEX {idx_name} ON flows({idx_col})")
                print(f"  [+] {idx_name}")
            else:
                print(f"  [SKIP] {idx_name} ya existe")
        
        conn.commit()
        print("[OK] Indices creados")
        
        # Paso 4: Actualizar flujos normalizados
        print("\nPaso 4: Actualizando flujos normalizados...")
        cursor.execute("""
            UPDATE flows 
            SET 
                source_system = 'normalized',
                is_template = TRUE,
                flow_type = 'standard',
                code = CONCAT('NORM-', SUBSTRING(id, 6)),
                version = '1.0',
                created_by = 'system_migration',
                metadata = JSON_OBJECT(
                    'migration_date', NOW(),
                    'original_table', 'flows',
                    'is_best_practice', TRUE
                )
            WHERE id LIKE 'flow-%'
        """)
        updated = cursor.rowcount
        conn.commit()
        print(f"[OK] {updated} flujos normalizados actualizados")
        
        # Paso 5: Migrar flujos de patient_flows
        print("\nPaso 5: Migrando flujos de Bienimed...")
        
        cursor.execute("SELECT * FROM patient_flows")
        patient_flows = cursor.fetchall()
        
        migrated = 0
        skipped = 0
        
        for pf in patient_flows:
            # Verificar si ya existe
            cursor.execute("SELECT COUNT(*) as count FROM flows WHERE id = %s", (pf['id'],))
            if cursor.fetchone()['count'] > 0:
                skipped += 1
                continue
            
            # Determinar tipo de flujo
            flow_type = 'standard'
            if 'Urgente' in pf['name'] or 'Emergencia' in pf['name']:
                flow_type = 'emergency'
            elif 'Seguimiento' in pf['name']:
                flow_type = 'followup'
            elif 'Procedimiento' in pf['name']:
                flow_type = 'procedure'
            
            # Determinar complejidad
            complexity = 'low'
            if pf['average_duration'] and pf['estimated_cost']:
                if pf['average_duration'] > 120 or pf['estimated_cost'] > 300:
                    complexity = 'high'
                elif pf['average_duration'] > 60 or pf['estimated_cost'] > 150:
                    complexity = 'medium'
            
            # Obtener nombre de especialidad
            specialty_name = None
            if pf['specialty_id']:
                cursor.execute("SELECT name FROM specialties_normalized WHERE id = %s", (pf['specialty_id'],))
                result = cursor.fetchone()
                if result:
                    specialty_name = result['name']
            
            # Metadata
            metadata = {
                'migration_date': datetime.now().isoformat(),
                'original_table': 'patient_flows',
                'original_id': pf['id'],
                'has_steps': pf.get('flow_steps') is not None,
                'has_edges': pf.get('flow_edges') is not None
            }
            
            # Insertar en flows
            cursor.execute("""
                INSERT INTO flows (
                    id, name, description, specialty_id, specialty_name,
                    average_duration, estimated_cost, is_active,
                    created_at, updated_at, source_system, source_id,
                    flow_type, is_template, code, flow_steps, flow_edges,
                    resource_requirements, cost_breakdown, complexity_level,
                    version, created_by, metadata
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    'bienimed', %s, %s, FALSE, %s, %s, %s, %s, %s, %s,
                    '1.0', 'bienimed_migration', %s
                )
            """, (
                pf['id'], pf['name'], pf['description'],
                pf['specialty_id'], specialty_name,
                pf['average_duration'], pf['estimated_cost'], pf['is_active'],
                pf['created_at'], pf['updated_at'],
                pf['id'],  # source_id
                flow_type,
                f"BIENI-{str(pf['id'])[:8]}",  # code
                json.dumps(pf['flow_steps']) if pf.get('flow_steps') else None,
                json.dumps(pf['flow_edges']) if pf.get('flow_edges') else None,
                json.dumps(pf['resource_requirements']) if pf.get('resource_requirements') else None,
                json.dumps(pf['cost_breakdown']) if pf.get('cost_breakdown') else None,
                complexity,
                json.dumps(metadata)
            ))
            migrated += 1
        
        conn.commit()
        print(f"[OK] {migrated} flujos migrados, {skipped} omitidos (ya existen)")
        
        # Paso 6: Verificación
        print("\nPaso 6: Verificacion...")
        cursor.execute("SELECT COUNT(*) as total FROM flows")
        total = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM flows WHERE source_system = 'normalized'")
        normalized = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM flows WHERE source_system = 'bienimed'")
        bienimed = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM flows WHERE is_template = TRUE")
        templates = cursor.fetchone()['total']
        
        print("\n" + "=" * 100)
        print(" MIGRACION COMPLETADA EXITOSAMENTE ")
        print("=" * 100)
        print(f"\nTotal de flujos unificados: {total}")
        print(f"  - Flujos normalizados (plantillas): {normalized}")
        print(f"  - Flujos Bienimed (reales): {bienimed}")
        print(f"  - Total plantillas: {templates}")
        print(f"  - Total flujos reales: {total - templates}")
        
        # Estadísticas por tipo
        print("\nFlujos por tipo:")
        cursor.execute("""
            SELECT flow_type, COUNT(*) as count
            FROM flows
            WHERE flow_type IS NOT NULL
            GROUP BY flow_type
            ORDER BY count DESC
        """)
        for row in cursor.fetchall():
            print(f"  - {row['flow_type']}: {row['count']}")
        
        print("\n" + "=" * 100 + "\n")
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    execute_migration()




