-- ============================================================================
-- MIGRACIÓN: UNIFICACIÓN DE TABLAS DE FLUJOS
-- ============================================================================
-- Objetivo: Consolidar 'flows' y 'patient_flows' en una sola tabla 'flows'
-- con soporte para múltiples fuentes de datos (Bienimed, Minimed, Pacifica, CSS)
-- ============================================================================

USE patient_journey;

-- Paso 1: Respaldar tablas existentes
-- ============================================================================
DROP TABLE IF EXISTS flows_backup;
CREATE TABLE flows_backup AS SELECT * FROM flows;

DROP TABLE IF EXISTS patient_flows_backup;
CREATE TABLE patient_flows_backup AS SELECT * FROM patient_flows;

SELECT 'Respaldo completado' AS status,
       (SELECT COUNT(*) FROM flows_backup) AS flows_respaldados,
       (SELECT COUNT(*) FROM patient_flows_backup) AS patient_flows_respaldados;

-- Paso 2: Agregar nuevas columnas a la tabla 'flows'
-- ============================================================================

-- Verificar y agregar columnas una por una
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'source_system') = 0,
    'ALTER TABLE flows ADD COLUMN source_system VARCHAR(50) NOT NULL DEFAULT ''normalized'' COMMENT ''Sistema origen''',
    'SELECT ''source_system already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'source_id') = 0,
    'ALTER TABLE flows ADD COLUMN source_id VARCHAR(100) NULL',
    'SELECT ''source_id already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'flow_type') = 0,
    'ALTER TABLE flows ADD COLUMN flow_type VARCHAR(50) NULL',
    'SELECT ''flow_type already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'is_template') = 0,
    'ALTER TABLE flows ADD COLUMN is_template BOOLEAN DEFAULT FALSE',
    'SELECT ''is_template already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'code') = 0,
    'ALTER TABLE flows ADD COLUMN code VARCHAR(50) NULL',
    'SELECT ''code already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'specialty_name') = 0,
    'ALTER TABLE flows ADD COLUMN specialty_name VARCHAR(255) NULL',
    'SELECT ''specialty_name already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'complexity_level') = 0,
    'ALTER TABLE flows ADD COLUMN complexity_level VARCHAR(20) NULL',
    'SELECT ''complexity_level already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'is_public') = 0,
    'ALTER TABLE flows ADD COLUMN is_public BOOLEAN DEFAULT TRUE',
    'SELECT ''is_public already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'version') = 0,
    'ALTER TABLE flows ADD COLUMN version VARCHAR(20) DEFAULT ''1.0''',
    'SELECT ''version already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'created_by') = 0,
    'ALTER TABLE flows ADD COLUMN created_by VARCHAR(100) NULL',
    'SELECT ''created_by already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'metadata') = 0,
    'ALTER TABLE flows ADD COLUMN metadata JSON NULL',
    'SELECT ''metadata already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'flow_steps') = 0,
    'ALTER TABLE flows ADD COLUMN flow_steps JSON NULL',
    'SELECT ''flow_steps already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'flow_edges') = 0,
    'ALTER TABLE flows ADD COLUMN flow_edges JSON NULL',
    'SELECT ''flow_edges already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'resource_requirements') = 0,
    'ALTER TABLE flows ADD COLUMN resource_requirements JSON NULL',
    'SELECT ''resource_requirements already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND column_name = 'cost_breakdown') = 0,
    'ALTER TABLE flows ADD COLUMN cost_breakdown JSON NULL',
    'SELECT ''cost_breakdown already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Columnas agregadas exitosamente' AS status;

-- Paso 3: Crear índices para optimización
-- ============================================================================

-- Crear índices solo si no existen
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND index_name = 'idx_flows_source') = 0,
    'CREATE INDEX idx_flows_source ON flows(source_system)',
    'SELECT ''idx_flows_source already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND index_name = 'idx_flows_type') = 0,
    'CREATE INDEX idx_flows_type ON flows(flow_type)',
    'SELECT ''idx_flows_type already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND index_name = 'idx_flows_template') = 0,
    'CREATE INDEX idx_flows_template ON flows(is_template)',
    'SELECT ''idx_flows_template already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND index_name = 'idx_flows_code') = 0,
    'CREATE INDEX idx_flows_code ON flows(code)',
    'SELECT ''idx_flows_code already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'patient_journey' AND table_name = 'flows' AND index_name = 'idx_flows_specialty_name') = 0,
    'CREATE INDEX idx_flows_specialty_name ON flows(specialty_name)',
    'SELECT ''idx_flows_specialty_name already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Índices creados exitosamente' AS status;

-- Paso 4: Actualizar flujos normalizados existentes
-- ============================================================================

UPDATE flows 
SET 
    source_system = 'normalized',
    is_template = TRUE,
    flow_type = 'standard',
    code = CONCAT('NORM-', SUBSTRING(id, 6)),  -- flow-ap -> NORM-ap
    version = '1.0',
    created_by = 'system_migration',
    metadata = JSON_OBJECT(
        'migration_date', NOW(),
        'original_table', 'flows',
        'is_best_practice', TRUE
    )
WHERE source_system = 'normalized'  -- Solo actualizar los que ya existían
   OR id LIKE 'flow-%';  -- O los que tienen el formato flow-*

SELECT 'Flujos normalizados actualizados' AS status,
       ROW_COUNT() AS registros_actualizados;

-- Paso 5: Migrar datos de patient_flows a flows
-- ============================================================================

INSERT INTO flows (
    id,
    name,
    description,
    specialty_id,
    specialty_name,
    average_duration,
    estimated_cost,
    is_active,
    created_at,
    updated_at,
    source_system,
    source_id,
    flow_type,
    is_template,
    code,
    flow_steps,
    flow_edges,
    resource_requirements,
    cost_breakdown,
    complexity_level,
    version,
    created_by,
    metadata
)
SELECT 
    pf.id,
    pf.name,
    pf.description,
    pf.specialty_id,
    -- Obtener nombre de especialidad si existe
    (SELECT name FROM specialties_normalized WHERE id = pf.specialty_id) AS specialty_name,
    pf.average_duration,
    pf.estimated_cost,
    pf.is_active,
    pf.created_at,
    pf.updated_at,
    'bienimed' AS source_system,
    pf.id AS source_id,
    -- Determinar tipo de flujo basado en el nombre
    CASE 
        WHEN pf.name LIKE '%Urgente%' OR pf.name LIKE '%Emergencia%' THEN 'emergency'
        WHEN pf.name LIKE '%Seguimiento%' THEN 'followup'
        WHEN pf.name LIKE '%Procedimiento%' THEN 'procedure'
        ELSE 'standard'
    END AS flow_type,
    FALSE AS is_template,
    CONCAT('BIENI-', SUBSTRING(pf.id, 1, 8)) AS code,
    pf.flow_steps,
    pf.flow_edges,
    pf.resource_requirements,
    pf.cost_breakdown,
    -- Determinar complejidad basada en duración y costo
    CASE 
        WHEN pf.average_duration > 120 OR pf.estimated_cost > 300 THEN 'high'
        WHEN pf.average_duration > 60 OR pf.estimated_cost > 150 THEN 'medium'
        ELSE 'low'
    END AS complexity_level,
    '1.0' AS version,
    'bienimed_migration' AS created_by,
    JSON_OBJECT(
        'migration_date', NOW(),
        'original_table', 'patient_flows',
        'original_id', pf.id,
        'has_steps', IF(pf.flow_steps IS NOT NULL, TRUE, FALSE),
        'has_edges', IF(pf.flow_edges IS NOT NULL, TRUE, FALSE)
    ) AS metadata
FROM patient_flows pf
WHERE NOT EXISTS (
    SELECT 1 FROM flows f WHERE f.id = pf.id
);

SELECT 'Flujos de Bienimed migrados' AS status,
       ROW_COUNT() AS registros_migrados;

-- Paso 6: Verificación de migración
-- ============================================================================

SELECT 'VERIFICACIÓN DE MIGRACIÓN' AS titulo;

SELECT 
    source_system AS 'Sistema Origen',
    is_template AS 'Es Plantilla',
    COUNT(*) AS 'Total Flujos',
    AVG(average_duration) AS 'Duración Promedio (min)',
    AVG(estimated_cost) AS 'Costo Promedio',
    COUNT(DISTINCT specialty_id) AS 'Especialidades'
FROM flows
GROUP BY source_system, is_template
ORDER BY source_system, is_template;

SELECT 
    flow_type AS 'Tipo de Flujo',
    COUNT(*) AS 'Cantidad',
    AVG(average_duration) AS 'Duración Promedio',
    AVG(estimated_cost) AS 'Costo Promedio'
FROM flows
GROUP BY flow_type
ORDER BY COUNT(*) DESC;

SELECT 
    complexity_level AS 'Nivel Complejidad',
    COUNT(*) AS 'Cantidad',
    AVG(average_duration) AS 'Duración Promedio',
    AVG(estimated_cost) AS 'Costo Promedio'
FROM flows
GROUP BY complexity_level
ORDER BY 
    CASE complexity_level
        WHEN 'low' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'high' THEN 3
        WHEN 'critical' THEN 4
    END;

-- Resumen final
SELECT 
    'MIGRACIÓN COMPLETADA' AS status,
    (SELECT COUNT(*) FROM flows) AS total_flows_unificados,
    (SELECT COUNT(*) FROM flows WHERE source_system = 'normalized') AS flujos_normalizados,
    (SELECT COUNT(*) FROM flows WHERE source_system = 'bienimed') AS flujos_bienimed,
    (SELECT COUNT(*) FROM flows WHERE is_template = TRUE) AS plantillas,
    (SELECT COUNT(*) FROM flows WHERE is_template = FALSE) AS flujos_reales;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. La tabla 'patient_flows' NO se elimina todavía (mantener como respaldo)
-- 2. Los flujos normalizados tienen is_template = TRUE
-- 3. Los flujos de Bienimed tienen is_template = FALSE
-- 4. Nuevas fuentes seguirán el mismo patrón:
--    - source_system: 'minimed', 'pacifica_salud', 'css', etc.
--    - code: 'MINI-xxx', 'PACI-xxx', 'CSS-xxx'
-- 5. El campo 'metadata' permite almacenar datos específicos de cada fuente
-- ============================================================================

