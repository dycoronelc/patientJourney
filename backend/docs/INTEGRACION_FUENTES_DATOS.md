# Guía de Integración de Nuevas Fuentes de Datos

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de la Tabla Unificada](#estructura-de-la-tabla-unificada)
4. [Flujo de Integración](#flujo-de-integración)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

El sistema Patient Journey Predictor está diseñado para integrar flujos médicos de **múltiples fuentes de datos**. Actualmente soporta:

- ✅ **Flujos Normalizados** (plantillas de mejores prácticas)
- ✅ **BieniMed** (datos reales de clínicas)
- 🔄 **Minimed** (próximamente)
- 🔄 **Pacifica Salud** (próximamente)
- 🔄 **Caja del Seguro Social (CSS)** (próximamente)

Esta guía explica cómo agregar nuevas fuentes de datos manteniendo la consistencia y escalabilidad del sistema.

---

## 🏗️ Arquitectura del Sistema

### Tabla Unificada: `flows`

Todos los flujos, sin importar su origen, se almacenan en una sola tabla `flows`. Esto permite:

1. **Consultas unificadas**: Un solo punto de acceso para todos los flujos
2. **Comparaciones**: Comparar flujos de diferentes fuentes fácilmente
3. **Escalabilidad**: Agregar nuevas fuentes sin cambiar la estructura
4. **Trazabilidad**: Cada flujo mantiene su origen y metadatos

### Diagrama de Flujo de Datos

```
┌─────────────────┐
│   BieniMed DB   │
└────────┬────────┘
         │
         ├─────► Script de Extracción ────┐
         │                                  │
┌─────────────────┐                       │
│   Minimed DB    │                       │
└────────┬────────┘                       │
         │                                  │
         ├─────► Script de Extracción ────┤
         │                                  │
┌─────────────────┐                       │
│  Pacifica DB    │                       │     ┌──────────────────┐
└────────┬────────┘                       ├────►│  Tabla `flows`   │
         │                                  │     │   (Unificada)    │
         ├─────► Script de Extracción ────┤     └────────┬─────────┘
         │                                  │              │
┌─────────────────┐                       │              │
│     CSS DB      │                       │              │
└────────┬────────┘                       │              ▼
         │                                  │     ┌──────────────────┐
         └─────► Script de Extracción ────┘     │   API Backend    │
                                                  │   (FastAPI)      │
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  Frontend React  │
                                                  │  (Visualización) │
                                                  └──────────────────┘
```

---

## 📊 Estructura de la Tabla Unificada

### Campos Principales

```sql
CREATE TABLE flows (
    -- Identificación
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    
    -- Origen
    source_system VARCHAR(50) NOT NULL,  -- 'normalized', 'bienimed', 'minimed', etc.
    source_id VARCHAR(100),               -- ID en el sistema original
    is_template BOOLEAN DEFAULT FALSE,    -- TRUE para flujos normalizados
    
    -- Clasificación
    flow_type VARCHAR(50),                -- 'standard', 'emergency', 'followup', 'procedure'
    complexity_level VARCHAR(20),         -- 'low', 'medium', 'high', 'critical'
    
    -- Especialidad
    specialty_id VARCHAR(36),
    specialty_name VARCHAR(255),
    
    -- Métricas
    average_duration INT,                 -- minutos
    estimated_cost DECIMAL(10,2),
    
    -- Configuración
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Metadatos
    metadata JSON,                        -- Datos específicos de cada fuente
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    
    -- Compatibilidad
    flow_steps JSON,                      -- Para sistemas con estructura diferente
    flow_edges JSON,
    resource_requirements JSON,
    cost_breakdown JSON,
    
    -- Índices
    INDEX idx_source (source_system),
    INDEX idx_type (flow_type),
    INDEX idx_template (is_template),
    INDEX idx_specialty (specialty_id)
);
```

### Campos Clave para Integración

| Campo | Propósito | Ejemplo |
|-------|-----------|---------|
| `source_system` | Identifica la fuente de datos | `'minimed'` |
| `source_id` | ID original en el sistema fuente | `'MIN-12345'` |
| `code` | Código único del flujo | `'MINI-CARD-001'` |
| `metadata` | Datos específicos de la fuente | `{"hospital_id": 42, "department": "Cardiología"}` |

---

## 🔄 Flujo de Integración

### Paso 1: Análisis de la Fuente de Datos

Antes de integrar, responde estas preguntas:

1. **¿Cómo se estructuran los flujos en el sistema origen?**
   - ¿Tablas relacionales?
   - ¿JSON?
   - ¿API externa?

2. **¿Qué información está disponible?**
   - Especialidades
   - Pasos del flujo
   - Duraciones
   - Costos
   - Recursos requeridos

3. **¿Cómo se identifican únicamente los flujos?**
   - ID numérico
   - Código alfanumérico
   - Combinación de campos

### Paso 2: Crear Script de Extracción

Crea un archivo Python en `backend/integrations/<nombre_fuente>/`:

```python
# backend/integrations/minimed/extract_flows.py

import pymysql
import uuid
from datetime import datetime

MINIMED_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'minimed_db',
    'port': 3306,
    'charset': 'utf8mb4'
}

PATIENT_JOURNEY_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'patient_journey',
    'port': 3306,
    'charset': 'utf8mb4'
}

def extract_flows_from_minimed():
    """
    Extraer flujos desde Minimed y migrarlos a la tabla unificada
    """
    
    # Conectar a Minimed
    minimed_conn = pymysql.connect(**MINIMED_CONFIG)
    minimed_cursor = minimed_conn.cursor(pymysql.cursors.DictCursor)
    
    # Conectar a Patient Journey
    pj_conn = pymysql.connect(**PATIENT_JOURNEY_CONFIG)
    pj_cursor = pj_conn.cursor()
    
    # 1. Obtener flujos de Minimed
    minimed_cursor.execute("""
        SELECT 
            f.id,
            f.nombre,
            f.especialidad_id,
            e.nombre as especialidad_nombre,
            f.duracion_promedio,
            f.costo_estimado,
            f.tipo,
            f.descripcion
        FROM flujos f
        LEFT JOIN especialidades e ON f.especialidad_id = e.id
        WHERE f.activo = 1
    """)
    
    flujos_minimed = minimed_cursor.fetchall()
    
    print(f"Encontrados {len(flujos_minimed)} flujos en Minimed")
    
    # 2. Por cada flujo, crear entrada en tabla unificada
    for flujo in flujos_minimed:
        
        # Generar ID único
        flow_id = str(uuid.uuid4())
        
        # Determinar tipo de flujo
        flow_type = 'standard'
        if 'emergencia' in flujo['tipo'].lower():
            flow_type = 'emergency'
        elif 'seguimiento' in flujo['tipo'].lower():
            flow_type = 'followup'
        
        # Determinar complejidad
        complexity = 'low'
        if flujo['duracion_promedio'] > 120:
            complexity = 'high'
        elif flujo['duracion_promedio'] > 60:
            complexity = 'medium'
        
        # Metadatos específicos de Minimed
        metadata = {
            'original_id': flujo['id'],
            'migration_date': datetime.now().isoformat(),
            'source_table': 'flujos',
            'hospital_system': 'Minimed'
        }
        
        # Insertar en tabla unificada
        pj_cursor.execute("""
            INSERT INTO flows (
                id, name, description,
                source_system, source_id, code,
                specialty_id, specialty_name,
                average_duration, estimated_cost,
                flow_type, is_template, complexity_level,
                is_active, version, created_by, metadata,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s,
                'minimed', %s, %s,
                %s, %s,
                %s, %s,
                %s, FALSE, %s,
                TRUE, '1.0', 'minimed_migration', %s,
                NOW(), NOW()
            )
        """, (
            flow_id,
            flujo['nombre'],
            flujo['descripcion'],
            str(flujo['id']),  # source_id
            f"MINI-{flujo['id']}",  # code
            flujo['especialidad_id'],
            flujo['especialidad_nombre'],
            flujo['duracion_promedio'],
            flujo['costo_estimado'],
            flow_type,
            complexity,
            str(metadata)
        ))
        
        print(f"  ✓ Migrado: {flujo['nombre']}")
    
    pj_conn.commit()
    
    # Cerrar conexiones
    minimed_cursor.close()
    minimed_conn.close()
    pj_cursor.close()
    pj_conn.close()
    
    print(f"\n✅ Migración completada: {len(flujos_minimed)} flujos de Minimed")

if __name__ == "__main__":
    extract_flows_from_minimed()
```

### Paso 3: Extraer Pasos y Nodos

Después de crear los flujos, extrae los pasos:

```python
def extract_flow_nodes_from_minimed(flow_id_mapping):
    """
    Extraer pasos de flujos desde Minimed
    
    Args:
        flow_id_mapping: dict con mapeo {minimed_id: patient_journey_id}
    """
    
    minimed_conn = pymysql.connect(**MINIMED_CONFIG)
    minimed_cursor = minimed_conn.cursor(pymysql.cursors.DictCursor)
    
    pj_conn = pymysql.connect(**PATIENT_JOURNEY_CONFIG)
    pj_cursor = pj_conn.cursor()
    
    for minimed_id, pj_id in flow_id_mapping.items():
        
        # Obtener pasos del flujo en Minimed
        minimed_cursor.execute("""
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.tipo_paso,
                p.orden,
                p.duracion,
                p.costo
            FROM pasos_flujo p
            WHERE p.flujo_id = %s
            ORDER BY p.orden
        """, (minimed_id,))
        
        pasos = minimed_cursor.fetchall()
        
        for paso in pasos:
            node_id = f"node-{uuid.uuid4()}"
            
            # Insertar nodo
            pj_cursor.execute("""
                INSERT INTO flow_nodes (
                    id, flow_id, step_type_id,
                    label, description,
                    order_index, duration_minutes, cost_avg,
                    created_at
                ) VALUES (
                    %s, %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    NOW()
                )
            """, (
                node_id,
                pj_id,
                paso['tipo_paso'],
                paso['nombre'],
                paso['descripcion'],
                paso['orden'],
                paso['duracion'],
                paso['costo']
            ))
    
    pj_conn.commit()
    
    minimed_cursor.close()
    minimed_conn.close()
    pj_cursor.close()
    pj_conn.close()
```

### Paso 4: Validación

Crea un script de validación:

```python
def validate_minimed_integration():
    """
    Validar que la integración de Minimed sea correcta
    """
    
    conn = pymysql.connect(**PATIENT_JOURNEY_CONFIG)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Verificar conteo
    cursor.execute("""
        SELECT COUNT(*) as total 
        FROM flows 
        WHERE source_system = 'minimed'
    """)
    total = cursor.fetchone()['total']
    
    print(f"✓ Total flujos Minimed: {total}")
    
    # Verificar nodos
    cursor.execute("""
        SELECT f.name, COUNT(fn.id) as node_count
        FROM flows f
        LEFT JOIN flow_nodes fn ON f.id = fn.flow_id
        WHERE f.source_system = 'minimed'
        GROUP BY f.id, f.name
    """)
    
    flows_with_nodes = cursor.fetchall()
    
    print(f"\n✓ Flujos con nodos:")
    for flow in flows_with_nodes:
        print(f"  - {flow['name']}: {flow['node_count']} nodos")
    
    cursor.close()
    conn.close()
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Integrar Pacifica Salud

```python
# backend/integrations/pacifica_salud/extract_flows.py

def extract_pacifica_flows():
    """
    Extraer flujos desde Pacifica Salud
    """
    
    # ... conexión a BD ...
    
    # Pacifica tiene un sistema más complejo con hospitales múltiples
    cursor.execute("""
        SELECT 
            f.id,
            f.nombre_flujo,
            f.codigo_hospital,
            h.nombre as hospital_nombre,
            f.duracion_total,
            f.costo_total,
            f.nivel_complejidad
        FROM procedimientos_medicos f
        INNER JOIN hospitales h ON f.codigo_hospital = h.codigo
        WHERE f.estado = 'ACTIVO'
    """)
    
    flujos = cursor.fetchall()
    
    for flujo in flujos:
        
        # Metadatos específicos de Pacifica
        metadata = {
            'hospital_code': flujo['codigo_hospital'],
            'hospital_name': flujo['hospital_nombre'],
            'complexity': flujo['nivel_complejidad'],
            'migration_date': datetime.now().isoformat()
        }
        
        # Insertar con source_system = 'pacifica_salud'
        pj_cursor.execute("""
            INSERT INTO flows (
                id, name,
                source_system, source_id, code,
                average_duration, estimated_cost,
                complexity_level,
                metadata,
                created_at, updated_at
            ) VALUES (
                %s, %s,
                'pacifica_salud', %s, %s,
                %s, %s,
                %s,
                %s,
                NOW(), NOW()
            )
        """, (
            str(uuid.uuid4()),
            flujo['nombre_flujo'],
            str(flujo['id']),
            f"PACI-{flujo['id']}",
            flujo['duracion_total'],
            flujo['costo_total'],
            flujo['nivel_complejidad'],
            json.dumps(metadata)
        ))
```

### Ejemplo 2: Integrar CSS (Caja del Seguro Social)

```python
# backend/integrations/css/extract_flows.py

def extract_css_flows():
    """
    Extraer flujos desde CSS
    """
    
    # CSS podría tener datos en archivos Excel o CSV
    import pandas as pd
    
    # Leer archivo
    df = pd.read_excel('css_flows_2024.xlsx')
    
    for _, row in df.iterrows():
        
        # Metadatos específicos de CSS
        metadata = {
            'region': row['region'],
            'polyclinic': row['policlinica'],
            'patient_count': row['cantidad_pacientes'],
            'year': 2024
        }
        
        # Insertar con source_system = 'css'
        pj_cursor.execute("""
            INSERT INTO flows (
                id, name,
                source_system, code,
                specialty_name,
                average_duration, estimated_cost,
                metadata,
                created_at, updated_at
            ) VALUES (
                %s, %s,
                'css', %s,
                %s,
                %s, %s,
                %s,
                NOW(), NOW()
            )
        """, (
            str(uuid.uuid4()),
            row['nombre_procedimiento'],
            f"CSS-{row['codigo']}",
            row['especialidad'],
            row['tiempo_promedio'],
            row['costo_estimado'],
            json.dumps(metadata)
        ))
```

---

## 🎯 Mejores Prácticas

### 1. Códigos Únicos

Siempre usa un prefijo único por fuente:

```
NORM-xxx   → Flujos normalizados
BIENI-xxx  → BieniMed
MINI-xxx   → Minimed
PACI-xxx   → Pacifica Salud
CSS-xxx    → Caja del Seguro Social
```

### 2. Metadatos Estructurados

Mantén un esquema consistente en `metadata`:

```json
{
    "migration_date": "2024-01-15T10:30:00",
    "source_table": "procedures",
    "original_id": "12345",
    "hospital_id": 42,
    "department": "Cardiología",
    "notes": "Migrado desde sistema legacy"
}
```

### 3. Manejo de Errores

Siempre incluye manejo de errores robusto:

```python
try:
    # Insertar flujo
    pj_cursor.execute(insert_query, values)
    pj_conn.commit()
    print(f"✓ {flujo['nombre']}")
except Exception as e:
    print(f"✗ Error en {flujo['nombre']}: {str(e)}")
    pj_conn.rollback()
    # Log del error
    with open('migration_errors.log', 'a') as f:
        f.write(f"{datetime.now()} - {flujo['id']} - {str(e)}\n")
```

### 4. Validación Post-Migración

Siempre valida después de migrar:

```python
def post_migration_checks():
    """
    Verificaciones después de la migración
    """
    
    checks = [
        {
            'name': 'Flujos sin especialidad',
            'query': "SELECT COUNT(*) FROM flows WHERE specialty_id IS NULL AND specialty_name IS NULL"
        },
        {
            'name': 'Flujos sin nodos',
            'query': """
                SELECT COUNT(*) 
                FROM flows f 
                LEFT JOIN flow_nodes fn ON f.id = fn.flow_id 
                WHERE fn.id IS NULL
            """
        },
        {
            'name': 'Costos negativos',
            'query': "SELECT COUNT(*) FROM flows WHERE estimated_cost < 0"
        }
    ]
    
    for check in checks:
        cursor.execute(check['query'])
        count = cursor.fetchone()[0]
        status = "✓" if count == 0 else "✗"
        print(f"{status} {check['name']}: {count}")
```

### 5. Documentación

Documenta cada integración:

```markdown
# Integración Minimed

## Fecha: 2024-01-15
## Responsable: [Nombre]

### Resumen
- Flujos migrados: 142
- Con nodos completos: 138
- Con metadatos: 142
- Errores: 4 (ver migration_errors.log)

### Notas
- La especialidad "Cirugía Pediátrica" no tenía equivalente, se creó nueva
- 4 flujos tenían costos en 0, se estimaron basados en promedio
```

---

## 📚 Recursos Adicionales

### Scripts de Utilidad

- `backend/execute_migration_python.py` - Script base de migración
- `backend/integrations/bienimed/` - Ejemplo de integración completa

### Consultas Útiles

```sql
-- Ver distribución por fuente
SELECT source_system, COUNT(*) as total
FROM flows
GROUP BY source_system;

-- Ver flujos sin nodos
SELECT f.id, f.name, f.source_system
FROM flows f
LEFT JOIN flow_nodes fn ON f.id = fn.flow_id
WHERE fn.id IS NULL;

-- Comparar métricas por fuente
SELECT 
    source_system,
    AVG(average_duration) as avg_duration,
    AVG(estimated_cost) as avg_cost,
    COUNT(*) as total_flows
FROM flows
GROUP BY source_system;
```

---

## 🔄 Próximos Pasos

1. ✅ Implementar integración con Minimed
2. ✅ Implementar integración con Pacifica Salud
3. ✅ Implementar integración con CSS
4. 🔄 Crear dashboard de comparación entre fuentes
5. 🔄 Implementar sincronización automática

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0  
**Mantenedor**: Equipo Patient Journey





