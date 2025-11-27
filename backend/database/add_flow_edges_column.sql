-- Agregar columna flow_edges a la tabla patient_flows
ALTER TABLE patient_flows ADD COLUMN IF NOT EXISTS flow_edges JSON NULL COMMENT 'Conexiones entre pasos (edges del diagrama)';









