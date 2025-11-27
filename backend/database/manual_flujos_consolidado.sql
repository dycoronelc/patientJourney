
-- =========================================================
-- Manual de Flujos de Pacientes Óptimos (Consolidado)
-- Estructura normalizada + datos para 20 especialidades
-- Mantiene compatibilidad con patient_flows (legacy JSON)
-- =========================================================

CREATE TABLE IF NOT EXISTS specialties (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS step_types (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS urgency_levels (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flows (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty_id VARCHAR(36),
  description TEXT,
  average_duration INT,
  estimated_cost DECIMAL(10,2),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (specialty_id) REFERENCES specialties(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flow_nodes (
  id VARCHAR(36) PRIMARY KEY,
  flow_id VARCHAR(36) NOT NULL,
  step_type_id VARCHAR(36) NOT NULL,
  label VARCHAR(150) NOT NULL,
  description TEXT,
  order_index INT,
  duration_minutes INT,
  cost_min DECIMAL(10,2),
  cost_max DECIMAL(10,2),
  cost_avg DECIMAL(10,2),
  position_x INT,
  position_y INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flow_id) REFERENCES flows(id),
  FOREIGN KEY (step_type_id) REFERENCES step_types(id),
  INDEX idx_flow_nodes_flow (flow_id),
  INDEX idx_flow_nodes_order (flow_id, order_index)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flow_edges_rel (
  id VARCHAR(36) PRIMARY KEY,
  flow_id VARCHAR(36) NOT NULL,
  source_node_id VARCHAR(36) NOT NULL,
  target_node_id VARCHAR(36) NOT NULL,
  edge_type VARCHAR(30) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flow_id) REFERENCES flows(id),
  FOREIGN KEY (source_node_id) REFERENCES flow_nodes(id),
  FOREIGN KEY (target_node_id) REFERENCES flow_nodes(id),
  INDEX idx_edges_flow (flow_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS referral_criteria (
  id VARCHAR(36) PRIMARY KEY,
  diagnosis VARCHAR(200) NOT NULL,
  criterion TEXT NOT NULL,
  target_specialty_id VARCHAR(36) NOT NULL,
  urgency_id VARCHAR(36) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_specialty_id) REFERENCES specialties(id),
  FOREIGN KEY (urgency_id) REFERENCES urgency_levels(id),
  INDEX idx_ref_diag (diagnosis)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS node_resources (
  id VARCHAR(36) PRIMARY KEY,
  node_id VARCHAR(36) NOT NULL,
  resource_code VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 1,
  FOREIGN KEY (node_id) REFERENCES flow_nodes(id),
  INDEX idx_nr_node (node_id)
) ENGINE=InnoDB;

INSERT INTO specialties (id, code, name) VALUES
('sp-ap','AP','Consulta General (Atención Primaria)'),
('sp-card','CARD','Cardiología'),
('sp-endo','ENDO','Endocrinología'),
('sp-geri','GERI','Geriatría'),
('sp-nefro','NEFRO','Nefrología'),
('sp-neumo','NEUMO','Neumología'),
('sp-neuro','NEURO','Neurología'),
('sp-gi','GI','Gastroenterología'),
('sp-reuma','REUMA','Reumatología'),
('sp-ofta','OFTA','Oftalmología'),
('sp-gine','GINE','Gineco-Obstetricia'),
('sp-derm','DERM','Dermatología'),
('sp-orl','ORL','Otorrinolaringología'),
('sp-uro','URO','Urología'),
('sp-psiq','PSIQ','Psiquiatría'),
('sp-fisia','FISIA','Fisiatría'),
('sp-cxg','CXG','Cirugía General'),
('sp-ped','PED','Pediatría'),
('sp-onco','ONCO','Oncología'),
('sp-palia','PALIA','Cuidados Paliativos')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO step_types (id, code, name) VALUES
('st-cons','consultation','Consulta'),
('st-lab','laboratory','Laboratorio'),
('st-img','imaging','Imagenología'),
('st-dx','diagnosis','Diagnóstico'),
('st-rx','prescription','Prescripción/Tratamiento'),
('st-ref','referral','Referencia'),
('st-fu','followup','Seguimiento'),
('st-emg','emergency','Emergencia/Triage'),
('st-proc','procedure','Procedimiento'),
('st-disc','discharge','Alta')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO urgency_levels (id, code, name) VALUES
('urg-immed','IMMEDIATE','Inmediata'),
('urg-prio','PRIORITY','Prioritaria'),
('urg-prog','SCHEDULED','Programada')
ON DUPLICATE KEY UPDATE name=VALUES(name);

CREATE TABLE IF NOT EXISTS patient_flows (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty_id VARCHAR(36),
  description TEXT,
  flow_steps JSON,
  flow_edges JSON,
  average_duration INT,
  estimated_cost DECIMAL(10,2),
  cost_breakdown JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== CARGA DE 20 FLUJOS (NODOS + ARISTAS) =====
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-ap', 'Consulta General (Atención Primaria)', 'sp-ap', 'Flujo estándar de atención primaria con criterios de referencia.', 45, 67.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ap-1', 'flow-ap', 'st-cons', 'Registro y triage', 1, 10, 0, 5, 2.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ap-2', 'flow-ap', 'st-cons', 'Historia clínica y examen', 2, 15, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ap-3', 'flow-ap', 'st-lab', 'Laboratorios básicos', 3, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ap-4', 'flow-ap', 'st-rx', 'Educación y plan de manejo', 4, 5, 0, 10, 5.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ap-5', 'flow-ap', 'st-ref', 'Referencia a especialista (si aplica)', 5, 5, 0, 10, 5.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ap-e1','flow-ap','ap-1','ap-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ap-e2','flow-ap','ap-2','ap-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ap-e3','flow-ap','ap-3','ap-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ap-e4','flow-ap','ap-4','ap-5') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-ap', 'Consulta General (Atención Primaria)', 'sp-ap', 'Flujo estándar de atención primaria con criterios de referencia.',
        [{"id": "ap-1", "type": "consultation", "label": "Registro y triage", "duration": 10, "cost": 2.5, "position": {"x": 200, "y": 100}}, {"id": "ap-2", "type": "consultation", "label": "Historia clínica y examen", "duration": 15, "cost": 27.5, "position": {"x": 200, "y": 200}}, {"id": "ap-3", "type": "laboratory", "label": "Laboratorios básicos", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 300}}, {"id": "ap-4", "type": "prescription", "label": "Educación y plan de manejo", "duration": 5, "cost": 5.0, "position": {"x": 200, "y": 400}}, {"id": "ap-5", "type": "referral", "label": "Referencia a especialista (si aplica)", "duration": 5, "cost": 5.0, "position": {"x": 200, "y": 500}}],
        [{"id": "ap-e1", "type": "default", "source": "ap-1", "target": "ap-2"}, {"id": "ap-e2", "type": "default", "source": "ap-2", "target": "ap-3"}, {"id": "ap-e3", "type": "default", "source": "ap-3", "target": "ap-4"}, {"id": "ap-e4", "type": "default", "source": "ap-4", "target": "ap-5"}],
        45, 67.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-card', 'Cardiología (Dolor torácico estable)', 'sp-card', 'Ruta ambulatoria con ECG y prueba funcional/CCTA según riesgo.', 75, 257.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('card-1', 'flow-card', 'st-img', 'ECG', 1, 10, 10, 30, 20.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('card-2', 'flow-card', 'st-dx', 'Estratificación de riesgo', 2, 15, 0, 25, 12.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('card-3', 'flow-card', 'st-img', 'Prueba funcional o CCTA', 3, 30, 80, 300, 190.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('card-4', 'flow-card', 'st-rx', 'Plan terapéutico', 4, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('card-5', 'flow-card', 'st-fu', 'Seguimiento', 5, 10, 0, 15, 7.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('card-e1','flow-card','card-1','card-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('card-e2','flow-card','card-2','card-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('card-e3','flow-card','card-3','card-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('card-e4','flow-card','card-4','card-5') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-card', 'Cardiología (Dolor torácico estable)', 'sp-card', 'Ruta ambulatoria con ECG y prueba funcional/CCTA según riesgo.',
        [{"id": "card-1", "type": "imaging", "label": "ECG", "duration": 10, "cost": 20.0, "position": {"x": 200, "y": 100}}, {"id": "card-2", "type": "diagnosis", "label": "Estratificación de riesgo", "duration": 15, "cost": 12.5, "position": {"x": 200, "y": 200}}, {"id": "card-3", "type": "imaging", "label": "Prueba funcional o CCTA", "duration": 30, "cost": 190.0, "position": {"x": 200, "y": 300}}, {"id": "card-4", "type": "prescription", "label": "Plan terapéutico", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 400}}, {"id": "card-5", "type": "followup", "label": "Seguimiento", "duration": 10, "cost": 7.5, "position": {"x": 200, "y": 500}}],
        [{"id": "card-e1", "type": "default", "source": "card-1", "target": "card-2"}, {"id": "card-e2", "type": "default", "source": "card-2", "target": "card-3"}, {"id": "card-e3", "type": "default", "source": "card-3", "target": "card-4"}, {"id": "card-e4", "type": "default", "source": "card-4", "target": "card-5"}],
        75, 257.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-endo', 'Endocrinología (Diabetes tipo 2 – control inicial)', 'sp-endo', 'Confirmación diagnóstica, perfil inicial cardio-renal y plan terapéutico.', 90, 165.0) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('endo-1', 'flow-endo', 'st-lab', 'Confirmación A1c/glucosa', 1, 15, 25, 60, 42.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('endo-2', 'flow-endo', 'st-lab', 'Perfil inicial (eGFR/ACR/lípidos)', 2, 15, 20, 50, 35.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('endo-3', 'flow-endo', 'st-cons', 'Consulta y educación', 3, 30, 25, 80, 52.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('endo-4', 'flow-endo', 'st-rx', 'Nutrición/actividad física', 4, 30, 20, 50, 35.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('endo-e1','flow-endo','endo-1','endo-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('endo-e2','flow-endo','endo-2','endo-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('endo-e3','flow-endo','endo-3','endo-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-endo', 'Endocrinología (Diabetes tipo 2 – control inicial)', 'sp-endo', 'Confirmación diagnóstica, perfil inicial cardio-renal y plan terapéutico.',
        [{"id": "endo-1", "type": "laboratory", "label": "Confirmación A1c/glucosa", "duration": 15, "cost": 42.5, "position": {"x": 200, "y": 100}}, {"id": "endo-2", "type": "laboratory", "label": "Perfil inicial (eGFR/ACR/lípidos)", "duration": 15, "cost": 35.0, "position": {"x": 200, "y": 200}}, {"id": "endo-3", "type": "consultation", "label": "Consulta y educación", "duration": 30, "cost": 52.5, "position": {"x": 200, "y": 300}}, {"id": "endo-4", "type": "prescription", "label": "Nutrición/actividad física", "duration": 30, "cost": 35.0, "position": {"x": 200, "y": 400}}],
        [{"id": "endo-e1", "type": "default", "source": "endo-1", "target": "endo-2"}, {"id": "endo-e2", "type": "default", "source": "endo-2", "target": "endo-3"}, {"id": "endo-e3", "type": "default", "source": "endo-3", "target": "endo-4"}],
        90, 165.0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-geri', 'Geriatría (Evaluación Geriátrica Integral)', 'sp-geri', 'CGA: función, cognición/ánimo, medicación y plan interdisciplinario.', 55, 32.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('geri-1', 'flow-geri', 'st-cons', 'Funcional (ADL/IADL/TUG)', 1, 15, 0, 20, 10.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('geri-2', 'flow-geri', 'st-cons', 'Cognición/Ánimo (MoCA/GDS)', 2, 20, 0, 25, 12.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('geri-3', 'flow-geri', 'st-cons', 'Revisión de medicación (Beers)', 3, 10, 0, 10, 5.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('geri-4', 'flow-geri', 'st-rx', 'Plan interdisciplinario', 4, 10, 0, 10, 5.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('geri-e1','flow-geri','geri-1','geri-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('geri-e2','flow-geri','geri-2','geri-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('geri-e3','flow-geri','geri-3','geri-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-geri', 'Geriatría (Evaluación Geriátrica Integral)', 'sp-geri', 'CGA: función, cognición/ánimo, medicación y plan interdisciplinario.',
        [{"id": "geri-1", "type": "consultation", "label": "Funcional (ADL/IADL/TUG)", "duration": 15, "cost": 10.0, "position": {"x": 200, "y": 100}}, {"id": "geri-2", "type": "consultation", "label": "Cognición/Ánimo (MoCA/GDS)", "duration": 20, "cost": 12.5, "position": {"x": 200, "y": 200}}, {"id": "geri-3", "type": "consultation", "label": "Revisión de medicación (Beers)", "duration": 10, "cost": 5.0, "position": {"x": 200, "y": 300}}, {"id": "geri-4", "type": "prescription", "label": "Plan interdisciplinario", "duration": 10, "cost": 5.0, "position": {"x": 200, "y": 400}}],
        [{"id": "geri-e1", "type": "default", "source": "geri-1", "target": "geri-2"}, {"id": "geri-e2", "type": "default", "source": "geri-2", "target": "geri-3"}, {"id": "geri-e3", "type": "default", "source": "geri-3", "target": "geri-4"}],
        55, 32.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-nefro', 'Nefrología (ERC – evaluación inicial)', 'sp-nefro', 'Clasificación KDIGO con eGFR/ACR, ecografía renal y plan.', 70, 190.0) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('nefro-1', 'flow-nefro', 'st-lab', 'Labs (eGFR/ACR)', 1, 15, 25, 60, 42.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('nefro-2', 'flow-nefro', 'st-cons', 'TA/medicación', 2, 15, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('nefro-3', 'flow-nefro', 'st-img', 'Ecografía renal', 3, 15, 50, 120, 85.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('nefro-4', 'flow-nefro', 'st-rx', 'Consejería nutricional', 4, 25, 20, 50, 35.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('nefro-e1','flow-nefro','nefro-1','nefro-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('nefro-e2','flow-nefro','nefro-2','nefro-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('nefro-e3','flow-nefro','nefro-3','nefro-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-nefro', 'Nefrología (ERC – evaluación inicial)', 'sp-nefro', 'Clasificación KDIGO con eGFR/ACR, ecografía renal y plan.',
        [{"id": "nefro-1", "type": "laboratory", "label": "Labs (eGFR/ACR)", "duration": 15, "cost": 42.5, "position": {"x": 200, "y": 100}}, {"id": "nefro-2", "type": "consultation", "label": "TA/medicación", "duration": 15, "cost": 27.5, "position": {"x": 200, "y": 200}}, {"id": "nefro-3", "type": "imaging", "label": "Ecografía renal", "duration": 15, "cost": 85.0, "position": {"x": 200, "y": 300}}, {"id": "nefro-4", "type": "prescription", "label": "Consejería nutricional", "duration": 25, "cost": 35.0, "position": {"x": 200, "y": 400}}],
        [{"id": "nefro-e1", "type": "default", "source": "nefro-1", "target": "nefro-2"}, {"id": "nefro-e2", "type": "default", "source": "nefro-2", "target": "nefro-3"}, {"id": "nefro-e3", "type": "default", "source": "nefro-3", "target": "nefro-4"}],
        70, 190.0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-neumo', 'Neumología (EPOC estable)', 'sp-neumo', 'Espirometría y plan terapéutico con rehabilitación y plan de exacerbación.', 55, 107.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neumo-1', 'flow-neumo', 'st-dx', 'Espirometría + oximetría', 1, 25, 30, 80, 55.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neumo-2', 'flow-neumo', 'st-cons', 'Revisión de inhaladores', 2, 10, 0, 20, 10.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neumo-3', 'flow-neumo', 'st-rx', 'Vacunas + Rehabilitación', 3, 10, 0, 30, 15.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neumo-4', 'flow-neumo', 'st-rx', 'Plan de exacerbación', 4, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('neumo-e1','flow-neumo','neumo-1','neumo-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('neumo-e2','flow-neumo','neumo-2','neumo-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('neumo-e3','flow-neumo','neumo-3','neumo-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-neumo', 'Neumología (EPOC estable)', 'sp-neumo', 'Espirometría y plan terapéutico con rehabilitación y plan de exacerbación.',
        [{"id": "neumo-1", "type": "diagnosis", "label": "Espirometría + oximetría", "duration": 25, "cost": 55.0, "position": {"x": 200, "y": 100}}, {"id": "neumo-2", "type": "consultation", "label": "Revisión de inhaladores", "duration": 10, "cost": 10.0, "position": {"x": 200, "y": 200}}, {"id": "neumo-3", "type": "prescription", "label": "Vacunas + Rehabilitación", "duration": 10, "cost": 15.0, "position": {"x": 200, "y": 300}}, {"id": "neumo-4", "type": "prescription", "label": "Plan de exacerbación", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 400}}],
        [{"id": "neumo-e1", "type": "default", "source": "neumo-1", "target": "neumo-2"}, {"id": "neumo-e2", "type": "default", "source": "neumo-2", "target": "neumo-3"}, {"id": "neumo-e3", "type": "default", "source": "neumo-3", "target": "neumo-4"}],
        55, 107.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-neuro', 'Neurología (TIA – clínica rápida)', 'sp-neuro', 'Evaluación rápida, cardio-vascular, neuroimagen y tratamiento.', 65, 385.0) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neuro-1', 'flow-neuro', 'st-cons', 'ABCD2 + examen', 1, 15, 15, 50, 32.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neuro-2', 'flow-neuro', 'st-img', 'ECG ± Holter; Doppler', 2, 20, 60, 180, 120.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neuro-3', 'flow-neuro', 'st-img', 'TC/RM', 3, 20, 100, 300, 200.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('neuro-4', 'flow-neuro', 'st-rx', 'Antiplaquetarios/ACO', 4, 10, 15, 50, 32.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('neuro-e1','flow-neuro','neuro-1','neuro-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('neuro-e2','flow-neuro','neuro-2','neuro-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('neuro-e3','flow-neuro','neuro-3','neuro-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-neuro', 'Neurología (TIA – clínica rápida)', 'sp-neuro', 'Evaluación rápida, cardio-vascular, neuroimagen y tratamiento.',
        [{"id": "neuro-1", "type": "consultation", "label": "ABCD2 + examen", "duration": 15, "cost": 32.5, "position": {"x": 200, "y": 100}}, {"id": "neuro-2", "type": "imaging", "label": "ECG ± Holter; Doppler", "duration": 20, "cost": 120.0, "position": {"x": 200, "y": 200}}, {"id": "neuro-3", "type": "imaging", "label": "TC/RM", "duration": 20, "cost": 200.0, "position": {"x": 200, "y": 300}}, {"id": "neuro-4", "type": "prescription", "label": "Antiplaquetarios/ACO", "duration": 10, "cost": 32.5, "position": {"x": 200, "y": 400}}],
        [{"id": "neuro-e1", "type": "default", "source": "neuro-1", "target": "neuro-2"}, {"id": "neuro-e2", "type": "default", "source": "neuro-2", "target": "neuro-3"}, {"id": "neuro-e3", "type": "default", "source": "neuro-3", "target": "neuro-4"}],
        65, 385.0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-gi', 'Gastroenterología (Dispepsia <60 sin alarmas)', 'sp-gi', 'Tamizaje H. pylori, erradicación o prueba-IBP y revaluación.', 30, 172.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gi-1', 'flow-gi', 'st-lab', 'Prueba H. pylori', 1, 10, 20, 60, 40.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gi-2', 'flow-gi', 'st-rx', 'Erradicación o prueba IBP', 2, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gi-3', 'flow-gi', 'st-cons', 'Revaluación ± endoscopia', 3, 10, 60, 150, 105.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('gi-e1','flow-gi','gi-1','gi-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('gi-e2','flow-gi','gi-2','gi-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-gi', 'Gastroenterología (Dispepsia <60 sin alarmas)', 'sp-gi', 'Tamizaje H. pylori, erradicación o prueba-IBP y revaluación.',
        [{"id": "gi-1", "type": "laboratory", "label": "Prueba H. pylori", "duration": 10, "cost": 40.0, "position": {"x": 200, "y": 100}}, {"id": "gi-2", "type": "prescription", "label": "Erradicación o prueba IBP", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 200}}, {"id": "gi-3", "type": "consultation", "label": "Revaluación ± endoscopia", "duration": 10, "cost": 105.0, "position": {"x": 200, "y": 300}}],
        [{"id": "gi-e1", "type": "default", "source": "gi-1", "target": "gi-2"}, {"id": "gi-e2", "type": "default", "source": "gi-2", "target": "gi-3"}],
        30, 172.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-reuma', 'Reumatología (Osteoartritis de rodilla)', 'sp-reuma', 'Imagen inicial, manejo conservador, infiltración y seguimiento.', 45, 197.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('reuma-1', 'flow-reuma', 'st-img', 'Radiografías', 1, 10, 30, 80, 55.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('reuma-2', 'flow-reuma', 'st-rx', 'FT + peso + tópicos', 2, 20, 15, 60, 37.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('reuma-3', 'flow-reuma', 'st-proc', 'Infiltración si refractario', 3, 15, 60, 150, 105.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('reuma-e1','flow-reuma','reuma-1','reuma-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('reuma-e2','flow-reuma','reuma-2','reuma-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-reuma', 'Reumatología (Osteoartritis de rodilla)', 'sp-reuma', 'Imagen inicial, manejo conservador, infiltración y seguimiento.',
        [{"id": "reuma-1", "type": "imaging", "label": "Radiografías", "duration": 10, "cost": 55.0, "position": {"x": 200, "y": 100}}, {"id": "reuma-2", "type": "prescription", "label": "FT + peso + tópicos", "duration": 20, "cost": 37.5, "position": {"x": 200, "y": 200}}, {"id": "reuma-3", "type": "procedure", "label": "Infiltración si refractario", "duration": 15, "cost": 105.0, "position": {"x": 200, "y": 300}}],
        [{"id": "reuma-e1", "type": "default", "source": "reuma-1", "target": "reuma-2"}, {"id": "reuma-e2", "type": "default", "source": "reuma-2", "target": "reuma-3"}],
        45, 197.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-ofta', 'Oftalmología (Tamizaje retinopatía diabética)', 'sp-ofta', 'Retinografía, clasificación y plan (seguimiento/derivación).', 20, 67.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ofta-1', 'flow-ofta', 'st-img', 'Retinografía', 1, 10, 20, 60, 40.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ofta-2', 'flow-ofta', 'st-cons', 'Clasificación + plan', 2, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ofta-e1','flow-ofta','ofta-1','ofta-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-ofta', 'Oftalmología (Tamizaje retinopatía diabética)', 'sp-ofta', 'Retinografía, clasificación y plan (seguimiento/derivación).',
        [{"id": "ofta-1", "type": "imaging", "label": "Retinografía", "duration": 10, "cost": 40.0, "position": {"x": 200, "y": 100}}, {"id": "ofta-2", "type": "consultation", "label": "Clasificación + plan", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 200}}],
        [{"id": "ofta-e1", "type": "default", "source": "ofta-1", "target": "ofta-2"}],
        20, 67.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-gine', 'Gineco-Obstetricia (Control prenatal inicial)', 'sp-gine', 'Historia, labs iniciales, ecografía obstétrica y educación.', 60, 220.0) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gine-1', 'flow-gine', 'st-cons', 'Historia/EG/TA/IMC', 1, 20, 20, 60, 40.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gine-2', 'flow-gine', 'st-lab', 'Labs iniciales + urocultivo', 2, 15, 30, 80, 55.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gine-3', 'flow-gine', 'st-img', 'Eco obstétrica', 3, 15, 60, 150, 105.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('gine-4', 'flow-gine', 'st-rx', 'Suplementación + educación', 4, 10, 10, 30, 20.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('gine-e1','flow-gine','gine-1','gine-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('gine-e2','flow-gine','gine-2','gine-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('gine-e3','flow-gine','gine-3','gine-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-gine', 'Gineco-Obstetricia (Control prenatal inicial)', 'sp-gine', 'Historia, labs iniciales, ecografía obstétrica y educación.',
        [{"id": "gine-1", "type": "consultation", "label": "Historia/EG/TA/IMC", "duration": 20, "cost": 40.0, "position": {"x": 200, "y": 100}}, {"id": "gine-2", "type": "laboratory", "label": "Labs iniciales + urocultivo", "duration": 15, "cost": 55.0, "position": {"x": 200, "y": 200}}, {"id": "gine-3", "type": "imaging", "label": "Eco obstétrica", "duration": 15, "cost": 105.0, "position": {"x": 200, "y": 300}}, {"id": "gine-4", "type": "prescription", "label": "Suplementación + educación", "duration": 10, "cost": 20.0, "position": {"x": 200, "y": 400}}],
        [{"id": "gine-e1", "type": "default", "source": "gine-1", "target": "gine-2"}, {"id": "gine-e2", "type": "default", "source": "gine-2", "target": "gine-3"}, {"id": "gine-e3", "type": "default", "source": "gine-3", "target": "gine-4"}],
        60, 220.0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-derm', 'Dermatología', 'sp-derm', 'Evaluación, biopsia/tratamiento y control.', 45, 120.0) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('derm-1', 'flow-derm', 'st-cons', 'Evaluación de lesiones', 1, 15, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('derm-2', 'flow-derm', 'st-proc', 'Biopsia/tratamiento', 2, 20, 40, 100, 70.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('derm-3', 'flow-derm', 'st-fu', 'Control', 3, 10, 15, 30, 22.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('derm-e1','flow-derm','derm-1','derm-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('derm-e2','flow-derm','derm-2','derm-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-derm', 'Dermatología', 'sp-derm', 'Evaluación, biopsia/tratamiento y control.',
        [{"id": "derm-1", "type": "consultation", "label": "Evaluación de lesiones", "duration": 15, "cost": 27.5, "position": {"x": 200, "y": 100}}, {"id": "derm-2", "type": "procedure", "label": "Biopsia/tratamiento", "duration": 20, "cost": 70.0, "position": {"x": 200, "y": 200}}, {"id": "derm-3", "type": "followup", "label": "Control", "duration": 10, "cost": 22.5, "position": {"x": 200, "y": 300}}],
        [{"id": "derm-e1", "type": "default", "source": "derm-1", "target": "derm-2"}, {"id": "derm-e2", "type": "default", "source": "derm-2", "target": "derm-3"}],
        45, 120.0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-orl', 'Otorrinolaringología', 'sp-orl', 'Evaluación, pruebas (audiometría/nasofibro) y tratamiento.', 45, 117.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('orl-1', 'flow-orl', 'st-cons', 'Evaluación ORL', 1, 15, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('orl-2', 'flow-orl', 'st-dx', 'Audiometría/nasofibro', 2, 20, 30, 80, 55.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('orl-3', 'flow-orl', 'st-rx', 'Tratamiento/derivación', 3, 10, 20, 50, 35.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('orl-e1','flow-orl','orl-1','orl-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('orl-e2','flow-orl','orl-2','orl-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-orl', 'Otorrinolaringología', 'sp-orl', 'Evaluación, pruebas (audiometría/nasofibro) y tratamiento.',
        [{"id": "orl-1", "type": "consultation", "label": "Evaluación ORL", "duration": 15, "cost": 27.5, "position": {"x": 200, "y": 100}}, {"id": "orl-2", "type": "diagnosis", "label": "Audiometría/nasofibro", "duration": 20, "cost": 55.0, "position": {"x": 200, "y": 200}}, {"id": "orl-3", "type": "prescription", "label": "Tratamiento/derivación", "duration": 10, "cost": 35.0, "position": {"x": 200, "y": 300}}],
        [{"id": "orl-e1", "type": "default", "source": "orl-1", "target": "orl-2"}, {"id": "orl-e2", "type": "default", "source": "orl-2", "target": "orl-3"}],
        45, 117.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-uro', 'Urología', 'sp-uro', 'Exploración, PSA/labs, ecografía y plan terapéutico.', 55, 167.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('uro-1', 'flow-uro', 'st-cons', 'Exploración urológica', 1, 15, 20, 50, 35.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('uro-2', 'flow-uro', 'st-lab', 'PSA/Labs', 2, 15, 20, 40, 30.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('uro-3', 'flow-uro', 'st-img', 'Ecografía prostática/renal', 3, 15, 50, 100, 75.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('uro-4', 'flow-uro', 'st-rx', 'Plan terapéutico', 4, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('uro-e1','flow-uro','uro-1','uro-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('uro-e2','flow-uro','uro-2','uro-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('uro-e3','flow-uro','uro-3','uro-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-uro', 'Urología', 'sp-uro', 'Exploración, PSA/labs, ecografía y plan terapéutico.',
        [{"id": "uro-1", "type": "consultation", "label": "Exploración urológica", "duration": 15, "cost": 35.0, "position": {"x": 200, "y": 100}}, {"id": "uro-2", "type": "laboratory", "label": "PSA/Labs", "duration": 15, "cost": 30.0, "position": {"x": 200, "y": 200}}, {"id": "uro-3", "type": "imaging", "label": "Ecografía prostática/renal", "duration": 15, "cost": 75.0, "position": {"x": 200, "y": 300}}, {"id": "uro-4", "type": "prescription", "label": "Plan terapéutico", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 400}}],
        [{"id": "uro-e1", "type": "default", "source": "uro-1", "target": "uro-2"}, {"id": "uro-e2", "type": "default", "source": "uro-2", "target": "uro-3"}, {"id": "uro-e3", "type": "default", "source": "uro-3", "target": "uro-4"}],
        55, 167.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-psiq', 'Psiquiatría', 'sp-psiq', 'Tamizaje, evaluación, psicoterapia/seguimiento.', 65, 107.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('psiq-1', 'flow-psiq', 'st-dx', 'Tamiz (PHQ-9/GAD-7)', 1, 10, 0, 10, 5.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('psiq-2', 'flow-psiq', 'st-cons', 'Evaluación', 2, 25, 30, 80, 55.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('psiq-3', 'flow-psiq', 'st-rx', 'Psicoterapia/seguimiento', 3, 30, 25, 70, 47.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('psiq-e1','flow-psiq','psiq-1','psiq-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('psiq-e2','flow-psiq','psiq-2','psiq-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-psiq', 'Psiquiatría', 'sp-psiq', 'Tamizaje, evaluación, psicoterapia/seguimiento.',
        [{"id": "psiq-1", "type": "diagnosis", "label": "Tamiz (PHQ-9/GAD-7)", "duration": 10, "cost": 5.0, "position": {"x": 200, "y": 100}}, {"id": "psiq-2", "type": "consultation", "label": "Evaluación", "duration": 25, "cost": 55.0, "position": {"x": 200, "y": 200}}, {"id": "psiq-3", "type": "prescription", "label": "Psicoterapia/seguimiento", "duration": 30, "cost": 47.5, "position": {"x": 200, "y": 300}}],
        [{"id": "psiq-e1", "type": "default", "source": "psiq-1", "target": "psiq-2"}, {"id": "psiq-e2", "type": "default", "source": "psiq-2", "target": "psiq-3"}],
        65, 107.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-fisia', 'Fisiatría', 'sp-fisia', 'Evaluación funcional, plan terapéutico, reevaluación.', 40, 70.0) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('fisia-1', 'flow-fisia', 'st-cons', 'Evaluación funcional', 1, 20, 20, 50, 35.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('fisia-2', 'flow-fisia', 'st-rx', 'Plan terapéutico', 2, 10, 10, 30, 20.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('fisia-3', 'flow-fisia', 'st-fu', 'Reevaluación', 3, 10, 10, 20, 15.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('fisia-e1','flow-fisia','fisia-1','fisia-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('fisia-e2','flow-fisia','fisia-2','fisia-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-fisia', 'Fisiatría', 'sp-fisia', 'Evaluación funcional, plan terapéutico, reevaluación.',
        [{"id": "fisia-1", "type": "consultation", "label": "Evaluación funcional", "duration": 20, "cost": 35.0, "position": {"x": 200, "y": 100}}, {"id": "fisia-2", "type": "prescription", "label": "Plan terapéutico", "duration": 10, "cost": 20.0, "position": {"x": 200, "y": 200}}, {"id": "fisia-3", "type": "followup", "label": "Reevaluación", "duration": 10, "cost": 15.0, "position": {"x": 200, "y": 300}}],
        [{"id": "fisia-e1", "type": "default", "source": "fisia-1", "target": "fisia-2"}, {"id": "fisia-e2", "type": "default", "source": "fisia-2", "target": "fisia-3"}],
        40, 70.0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-cxg', 'Cirugía General', 'sp-cxg', 'Evaluación, preoperatorio, cirugía ambulatoria y control.', 120, 647.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('cxg-1', 'flow-cxg', 'st-cons', 'Evaluación quirúrgica', 1, 15, 20, 60, 40.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('cxg-2', 'flow-cxg', 'st-dx', 'Preoperatorio (labs/imágenes)', 2, 20, 40, 120, 80.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('cxg-3', 'flow-cxg', 'st-proc', 'Cirugía ambulatoria', 3, 75, 200, 800, 500.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('cxg-4', 'flow-cxg', 'st-fu', 'Control postoperatorio', 4, 10, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('cxg-e1','flow-cxg','cxg-1','cxg-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('cxg-e2','flow-cxg','cxg-2','cxg-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('cxg-e3','flow-cxg','cxg-3','cxg-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-cxg', 'Cirugía General', 'sp-cxg', 'Evaluación, preoperatorio, cirugía ambulatoria y control.',
        [{"id": "cxg-1", "type": "consultation", "label": "Evaluación quirúrgica", "duration": 15, "cost": 40.0, "position": {"x": 200, "y": 100}}, {"id": "cxg-2", "type": "diagnosis", "label": "Preoperatorio (labs/imágenes)", "duration": 20, "cost": 80.0, "position": {"x": 200, "y": 200}}, {"id": "cxg-3", "type": "procedure", "label": "Cirugía ambulatoria", "duration": 75, "cost": 500.0, "position": {"x": 200, "y": 300}}, {"id": "cxg-4", "type": "followup", "label": "Control postoperatorio", "duration": 10, "cost": 27.5, "position": {"x": 200, "y": 400}}],
        [{"id": "cxg-e1", "type": "default", "source": "cxg-1", "target": "cxg-2"}, {"id": "cxg-e2", "type": "default", "source": "cxg-2", "target": "cxg-3"}, {"id": "cxg-e3", "type": "default", "source": "cxg-3", "target": "cxg-4"}],
        120, 647.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-ped', 'Pediatría', 'sp-ped', 'Historia/examen, vacunación/orientación y seguimiento.', 35, 57.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ped-1', 'flow-ped', 'st-cons', 'Historia/examen', 1, 15, 15, 40, 27.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ped-2', 'flow-ped', 'st-rx', 'Vacunación/orientación', 2, 10, 0, 20, 10.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('ped-3', 'flow-ped', 'st-fu', 'Seguimiento', 3, 10, 10, 30, 20.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ped-e1','flow-ped','ped-1','ped-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('ped-e2','flow-ped','ped-2','ped-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-ped', 'Pediatría', 'sp-ped', 'Historia/examen, vacunación/orientación y seguimiento.',
        [{"id": "ped-1", "type": "consultation", "label": "Historia/examen", "duration": 15, "cost": 27.5, "position": {"x": 200, "y": 100}}, {"id": "ped-2", "type": "prescription", "label": "Vacunación/orientación", "duration": 10, "cost": 10.0, "position": {"x": 200, "y": 200}}, {"id": "ped-3", "type": "followup", "label": "Seguimiento", "duration": 10, "cost": 20.0, "position": {"x": 200, "y": 300}}],
        [{"id": "ped-e1", "type": "default", "source": "ped-1", "target": "ped-2"}, {"id": "ped-e2", "type": "default", "source": "ped-2", "target": "ped-3"}],
        35, 57.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-onco', 'Oncología', 'sp-onco', 'Evaluación/diagnóstico, estadificación, tratamiento y seguimiento.', 155, 1302.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('onco-1', 'flow-onco', 'st-cons', 'Evaluación/diagnóstico', 1, 20, 40, 100, 70.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('onco-2', 'flow-onco', 'st-dx', 'Estadificación', 2, 30, 100, 300, 200.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('onco-3', 'flow-onco', 'st-proc', 'Tratamiento (por ciclo)', 3, 90, 500, 1500, 1000.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('onco-4', 'flow-onco', 'st-fu', 'Seguimiento/soporte', 4, 15, 15, 50, 32.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('onco-e1','flow-onco','onco-1','onco-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('onco-e2','flow-onco','onco-2','onco-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('onco-e3','flow-onco','onco-3','onco-4') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-onco', 'Oncología', 'sp-onco', 'Evaluación/diagnóstico, estadificación, tratamiento y seguimiento.',
        [{"id": "onco-1", "type": "consultation", "label": "Evaluación/diagnóstico", "duration": 20, "cost": 70.0, "position": {"x": 200, "y": 100}}, {"id": "onco-2", "type": "diagnosis", "label": "Estadificación", "duration": 30, "cost": 200.0, "position": {"x": 200, "y": 200}}, {"id": "onco-3", "type": "procedure", "label": "Tratamiento (por ciclo)", "duration": 90, "cost": 1000.0, "position": {"x": 200, "y": 300}}, {"id": "onco-4", "type": "followup", "label": "Seguimiento/soporte", "duration": 15, "cost": 32.5, "position": {"x": 200, "y": 400}}],
        [{"id": "onco-e1", "type": "default", "source": "onco-1", "target": "onco-2"}, {"id": "onco-e2", "type": "default", "source": "onco-2", "target": "onco-3"}, {"id": "onco-e3", "type": "default", "source": "onco-3", "target": "onco-4"}],
        155, 1302.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost) VALUES ('flow-palia', 'Cuidados Paliativos', 'sp-palia', 'Evaluación del dolor, ajuste farmacológico y apoyo psicoespiritual.', 45, 52.5) ON DUPLICATE KEY UPDATE description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('palia-1', 'flow-palia', 'st-cons', 'Evaluación del dolor', 1, 15, 15, 30, 22.5) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('palia-2', 'flow-palia', 'st-rx', 'Ajuste farmacológico', 2, 10, 10, 20, 15.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg) VALUES ('palia-3', 'flow-palia', 'st-rx', 'Apoyo psicológico/espiritual', 3, 20, 0, 30, 15.0) ON DUPLICATE KEY UPDATE label=VALUES(label), duration_minutes=VALUES(duration_minutes), cost_min=VALUES(cost_min), cost_max=VALUES(cost_max), cost_avg=VALUES(cost_avg);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('palia-e1','flow-palia','palia-1','palia-2') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id) VALUES ('palia-e2','flow-palia','palia-2','palia-3') ON DUPLICATE KEY UPDATE target_node_id=VALUES(target_node_id);
INSERT INTO patient_flows (id, name, specialty_id, description, flow_steps, flow_edges, average_duration, estimated_cost, is_active)
VALUES ('flow-palia', 'Cuidados Paliativos', 'sp-palia', 'Evaluación del dolor, ajuste farmacológico y apoyo psicoespiritual.',
        [{"id": "palia-1", "type": "consultation", "label": "Evaluación del dolor", "duration": 15, "cost": 22.5, "position": {"x": 200, "y": 100}}, {"id": "palia-2", "type": "prescription", "label": "Ajuste farmacológico", "duration": 10, "cost": 15.0, "position": {"x": 200, "y": 200}}, {"id": "palia-3", "type": "prescription", "label": "Apoyo psicológico/espiritual", "duration": 20, "cost": 15.0, "position": {"x": 200, "y": 300}}],
        [{"id": "palia-e1", "type": "default", "source": "palia-1", "target": "palia-2"}, {"id": "palia-e2", "type": "default", "source": "palia-2", "target": "palia-3"}],
        45, 52.5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), flow_steps=VALUES(flow_steps), flow_edges=VALUES(flow_edges), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);
-- ===== Anexo 1: Criterios de referencia (resumen) =====
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-dolor-toracico','Dolor torácico','ECG anormal o troponina elevada','sp-card','urg-immed') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-disnea','Disnea persistente','SatO2 < 92% o signos de insuficiencia respiratoria','sp-neumo','urg-prio') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-a1c','Diabetes descontrolada','A1c > 9% o hipoglucemias graves','sp-endo','urg-prio') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-hematuria','Hematuria persistente','≥2 muestras positivas o macroscópica','sp-uro','urg-prio') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-tia','Déficit neurológico agudo/TIA','Síntomas focales o TIA/ACV sospecha','sp-neuro','urg-immed') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-dispepsia','Dispepsia refractaria/<60 sin alarmas','Falla a IBP 4–8 semanas o signos de alarma','sp-gi','urg-prio') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-oa-rodilla','Dolor articular inflamatorio','Derrame articular o rigidez matutina >30 min','sp-reuma','urg-prog') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-vision','Pérdida visual súbita/dolor ocular','Sospecha glaucoma/retinopatía aguda','sp-ofta','urg-immed') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-prenatal','Embarazo con riesgo','HTA/DM/sangrado/dolor abdominal','sp-gine','urg-prio') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-derm','Lesión pigmentada cambiante','Asimetría, bordes irregulares, color variado','sp-derm','urg-prio') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);
INSERT INTO referral_criteria (id, diagnosis, criterion, target_specialty_id, urgency_id) VALUES ('rc-saludmental','Depresión severa/ideación suicida','PHQ-9 ≥20 o riesgo suicida','sp-psiq','urg-immed') ON DUPLICATE KEY UPDATE criterion=VALUES(criterion), target_specialty_id=VALUES(target_specialty_id), urgency_id=VALUES(urgency_id);

-- =========================================================
-- BACKFILL: patient_flows JSON -> modelo relacional
-- =========================================================
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost, is_active, created_at, updated_at)
SELECT pf.id, pf.name, pf.specialty_id, pf.description, pf.average_duration, pf.estimated_cost, pf.is_active, pf.created_at, pf.updated_at
FROM patient_flows pf
WHERE pf.id NOT IN (SELECT id FROM flows)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), average_duration=VALUES(average_duration), estimated_cost=VALUES(estimated_cost), is_active=VALUES(is_active);

INSERT INTO flow_nodes (id, flow_id, step_type_id, label, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
SELECT
  jt.id, pf.id,
  CASE jt.type
    WHEN 'consultation' THEN 'st-cons'
    WHEN 'laboratory'   THEN 'st-lab'
    WHEN 'imaging'      THEN 'st-img'
    WHEN 'diagnosis'    THEN 'st-dx'
    WHEN 'prescription' THEN 'st-rx'
    WHEN 'referral'     THEN 'st-ref'
    WHEN 'followup'     THEN 'st-fu'
    WHEN 'emergency'    THEN 'st-emg'
    WHEN 'procedure'    THEN 'st-proc'
    WHEN 'discharge'    THEN 'st-disc'
    ELSE 'st-cons'
  END AS step_type_id,
  jt.label,
  ROW_NUMBER() OVER (PARTITION BY pf.id ORDER BY CAST(jt.position->>'$.y' AS UNSIGNED), CAST(jt.position->>'$.x' AS UNSIGNED)) AS order_index,
  COALESCE(jt.duration, NULL) AS duration_minutes,
  NULL AS cost_min, NULL AS cost_max, jt.cost AS cost_avg,
  CAST(jt.position->>'$.x' AS SIGNED), CAST(jt.position->>'$.y' AS SIGNED)
FROM patient_flows pf
JOIN JSON_TABLE(pf.flow_steps,
  '$[*]' COLUMNS(
    id         VARCHAR(64) PATH '$.id',
    type       VARCHAR(32) PATH '$.type',
    label      VARCHAR(150) PATH '$.label',
    duration   INT PATH '$.duration',
    cost       DECIMAL(10,2) PATH '$.cost',
    position   JSON PATH '$.position'
  )
) AS jt
WHERE NOT EXISTS (SELECT 1 FROM flow_nodes n WHERE n.id = jt.id);

INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
SELECT
  je.id, pf.id, je.source, je.target, COALESCE(je.type,'default')
FROM patient_flows pf
JOIN JSON_TABLE(pf.flow_edges,
  '$[*]' COLUMNS(
    id     VARCHAR(64) PATH '$.id',
    type   VARCHAR(32) PATH '$.type',
    source VARCHAR(64) PATH '$.source',
    target VARCHAR(64) PATH '$.target'
  )
) AS je
WHERE NOT EXISTS (SELECT 1 FROM flow_edges_rel e WHERE e.id = je.id);
