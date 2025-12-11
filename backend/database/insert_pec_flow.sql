-- Script para insertar el flujo PEC (Programa de Educación al Paciente) en la base de datos
-- Ejecutar este script después de que las tablas flows, flow_nodes y flow_edges_rel estén creadas

USE patient_journey;

-- Insertar el flujo PEC
INSERT INTO flows (id, name, specialty_id, description, average_duration, estimated_cost, is_active) 
VALUES (
    'flow-pec',
    'Programa de Prevención de Enfermedades Crónicas no Transmisibles (PEC)',
    NULL,
    'Flujo de atención para pacientes con enfermedades crónicas, especialmente diabetes, en el Programa de Educación al Paciente',
    185,  -- Duración total en minutos (15+10+30+45+30+30+15+10)
    140.00,  -- Costo total estimado (0+0+45+25+20+50+0+0)
    1
) ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    average_duration = VALUES(average_duration),
    estimated_cost = VALUES(estimated_cost),
    is_active = VALUES(is_active);

-- Insertar nodos del flujo PEC
-- Nodo 1: REGES (Inicio)
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-1',
    'flow-pec',
    'st-cons',
    'REGES',
    'Registro y agendamiento de citas. Agendar las citas de los pacientes según corresponda su control con el médico. Programar siguiente cita según indicación médica.',
    0,
    15,
    0.00,
    0.00,
    0.00,
    300,
    50
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 2: Atención al Asegurado
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-2',
    'flow-pec',
    'st-cons',
    'Atención al Asegurado',
    'Identificación y orientación del paciente. Identificar al paciente del PEC. Orientarlo a los diferentes departamentos mencionados en el flujograma.',
    1,
    10,
    0.00,
    0.00,
    0.00,
    300,
    230
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 3: Laboratorio
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-3',
    'flow-pec',
    'st-lab',
    'Laboratorio',
    'Toma de muestras y análisis. Tomar muestra de sangre al paciente a las 8 am del día de la cita. Procesar el mismo día de la cita para su control con el médico asignado. Laboratorios: BHC, glicemia, HbA1c, creatinina con TFG, nitrógeno de urea, ácido úrico y urinálisis con relación albumina/creatinina en orina.',
    2,
    30,
    40.00,
    50.00,
    45.00,
    300,
    410
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 4: Enfermería
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-4',
    'flow-pec',
    'st-cons',
    'Enfermería',
    'Evaluación primaria y educación del paciente. Evaluación primaria de historia clínica, signos vitales, peso y talla. Proceso de educación personalizada con miras a mejorar la adherencia al tratamiento. Revisión de antecedentes patológicos personales. Medición de perímetro abdominal, peso, talla, IMC. Medición de presión arterial y FC. Revisión y exploración de los pies (si es diabético). Evaluación de zonas de punción si utiliza tratamiento con insulina. Búsqueda de signos y síntomas de hiperglicemia e hipertensión prolongada. Revisión de exámenes de laboratorios. Educación del paciente y su familia sobre la enfermedad y su tratamiento. Revisión de tarjeta de vacunación.',
    3,
    45,
    20.00,
    30.00,
    25.00,
    300,
    590
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 5: Referencias Multidisciplinarias
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-5',
    'flow-pec',
    'st-ref',
    'Referencias Multidisciplinarias',
    'Evaluación integral según necesidad del paciente. La enfermera del programa referirá al paciente según la necesidad actual. Mantener la atención el mismo día de la evaluación. Opciones: Trabajo Social, Salud Mental, Nutrición.',
    4,
    30,
    15.00,
    25.00,
    20.00,
    300,
    770
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 6: Atención Médica
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-6',
    'flow-pec',
    'st-cons',
    'Atención Médica',
    'Consulta y evaluación con el médico. Una vez listos los resultados de laboratorios, el paciente asistirá a la evaluación con el médico. Proporcionar acceso fácil a la atención integral y continua. Identificar y resolver problemas de salud de manera puntual. Atender al individuo en el contexto de la familia. Proporcionar coordinación de diferentes especialistas y tratamientos de apoyo. 15 pacientes por día (5 días a la semana).',
    5,
    30,
    40.00,
    60.00,
    50.00,
    300,
    950
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 7: Farmacia
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-7',
    'flow-pec',
    'st-rx',
    'Farmacia',
    'Dispensación de medicamentos. Proporcionar los medicamentos indicados por el médico.',
    6,
    15,
    0.00,
    0.00,
    0.00,
    300,
    1130
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Nodo 8: REGES (Programación) - Finalización
INSERT INTO flow_nodes (id, flow_id, step_type_id, label, description, order_index, duration_minutes, cost_min, cost_max, cost_avg, position_x, position_y)
VALUES (
    'pec-node-8',
    'flow-pec',
    'st-fu',
    'REGES (Programación)',
    'Programación de siguiente cita. Programar próxima cita según indicación médica.',
    7,
    10,
    0.00,
    0.00,
    0.00,
    300,
    1310
) ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    order_index = VALUES(order_index),
    duration_minutes = VALUES(duration_minutes),
    cost_avg = VALUES(cost_avg);

-- Insertar edges (conexiones) del flujo PEC
-- Edge 1: REGES -> Atención al Asegurado
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-1',
    'flow-pec',
    'pec-node-1',
    'pec-node-2',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

-- Edge 2: Atención al Asegurado -> Laboratorio
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-2',
    'flow-pec',
    'pec-node-2',
    'pec-node-3',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

-- Edge 3: Laboratorio -> Enfermería
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-3',
    'flow-pec',
    'pec-node-3',
    'pec-node-4',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

-- Edge 4: Enfermería -> Referencias Multidisciplinarias
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-4',
    'flow-pec',
    'pec-node-4',
    'pec-node-5',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

-- Edge 5: Referencias Multidisciplinarias -> Atención Médica
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-5',
    'flow-pec',
    'pec-node-5',
    'pec-node-6',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

-- Edge 6: Atención Médica -> Farmacia
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-6',
    'flow-pec',
    'pec-node-6',
    'pec-node-7',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

-- Edge 7: Farmacia -> REGES (Programación)
INSERT INTO flow_edges_rel (id, flow_id, source_node_id, target_node_id, edge_type)
VALUES (
    'pec-edge-7',
    'flow-pec',
    'pec-node-7',
    'pec-node-8',
    'default'
) ON DUPLICATE KEY UPDATE
    source_node_id = VALUES(source_node_id),
    target_node_id = VALUES(target_node_id);

