-- Script de inicialización de la base de datos MySQL
-- Patient Journey Predictor Database

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS patient_journey;
USE patient_journey;

-- Configurar charset y collation
ALTER DATABASE patient_journey CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de especialidades médicas
CREATE TABLE IF NOT EXISTS specialties (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    common_tests JSON,
    typical_medications JSON,
    icd10_codes JSON,
    cpt_codes JSON,
    average_consultation_time INT DEFAULT 30,
    resource_requirements JSON,
    patient_flow JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_specialty_name (name),
    INDEX idx_specialty_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de centros de salud
CREATE TABLE IF NOT EXISTS health_centers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(255),
    country VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity JSON,
    resources JSON,
    specialties JSON,
    operating_hours JSON,
    contact_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_center_name (name),
    INDEX idx_center_type (type),
    INDEX idx_center_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de recursos
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    availability VARCHAR(50) DEFAULT 'available',
    capacity INT DEFAULT 1,
    current_utilization INT DEFAULT 0,
    cost_per_hour DECIMAL(10, 2) DEFAULT 0.00,
    location VARCHAR(255),
    specifications JSON,
    health_center_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resource_name (name),
    INDEX idx_resource_type (type),
    INDEX idx_resource_center (health_center_id),
    INDEX idx_resource_active (is_active),
    FOREIGN KEY (health_center_id) REFERENCES health_centers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de flujos de pacientes
CREATE TABLE IF NOT EXISTS patient_flows (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    specialty_id VARCHAR(36),
    flow_steps JSON,
    average_duration INT,
    resource_requirements JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_flow_name (name),
    INDEX idx_flow_specialty (specialty_id),
    INDEX idx_flow_active (is_active),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de interacciones de pacientes
CREATE TABLE IF NOT EXISTS patient_interactions (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    center_id VARCHAR(36),
    specialty_id VARCHAR(36),
    interaction_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INT,
    resources JSON,
    data JSON,
    status VARCHAR(50) DEFAULT 'scheduled',
    cost DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_interaction_patient (patient_id),
    INDEX idx_interaction_center (center_id),
    INDEX idx_interaction_specialty (specialty_id),
    INDEX idx_interaction_type (interaction_type),
    INDEX idx_interaction_timestamp (timestamp),
    INDEX idx_interaction_status (status),
    FOREIGN KEY (center_id) REFERENCES health_centers(id) ON DELETE SET NULL,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de relación centro-especialidad
CREATE TABLE IF NOT EXISTS center_specialties (
    center_id VARCHAR(36),
    specialty_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (center_id, specialty_id),
    FOREIGN KEY (center_id) REFERENCES health_centers(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios (para autenticación)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo
INSERT INTO specialties (id, name, description, common_tests, typical_medications, icd10_codes, cpt_codes, average_consultation_time) VALUES
('cardiology-001', 'Cardiología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del corazón y del sistema cardiovascular', 
 '["Perfil Lipídico", "ECG", "Ecocardiograma"]', 
 '["Atorvastatina", "Metoprolol"]', 
 '["I10", "I11", "I20", "I25"]', 
 '["93000", "93010", "93306"]', 
 30),
('endocrinology-001', 'Endocrinología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades relacionadas con las hormonas',
 '["TSH, T3, T4", "Glucosa en Ayunas", "Hemoglobina A1c"]',
 '["Metformina", "Levotiroxina"]',
 '["E11", "E03", "E05"]',
 '["99213", "99214"]',
 25),
('geriatrics-001', 'Geriatría', 'Especialidad médica que se encarga del cuidado de la salud de las personas mayores',
 '["Perfil Metabólico Completo", "Densitometría Ósea"]',
 '["Alendronato"]',
 '["I10", "E11.9", "M81.0"]',
 '["99213", "99337"]',
 45);

-- Insertar centro de salud de ejemplo
INSERT INTO health_centers (id, name, type, address, city, country, capacity, specialties) VALUES
('center-001', 'Hospital General Central', 'hospital', 'Av. Principal 123', 'Ciudad Capital', 'País', 
 '{"beds": 500, "doctors": 150, "nurses": 300}',
 '["cardiology-001", "endocrinology-001", "geriatrics-001"]');

-- Tabla de flujos de pacientes detallados
CREATE TABLE IF NOT EXISTS patient_journeys (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    health_center_id VARCHAR(36),
    specialty_id VARCHAR(36),
    flow_id VARCHAR(36),
    status VARCHAR(50) DEFAULT 'in_progress',
    current_step VARCHAR(255),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    completed_steps JSON,
    laboratory_orders JSON,
    imaging_orders JSON,
    referrals JSON,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    cost_details JSON,
    total_duration INT,
    wait_times JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_journey_patient (patient_id),
    INDEX idx_journey_center (health_center_id),
    INDEX idx_journey_specialty (specialty_id),
    INDEX idx_journey_status (status),
    FOREIGN KEY (health_center_id) REFERENCES health_centers(id) ON DELETE SET NULL,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL,
    FOREIGN KEY (flow_id) REFERENCES patient_flows(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items de costo
CREATE TABLE IF NOT EXISTS cost_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_type VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    base_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    estimated_duration INT,
    specialty_id VARCHAR(36),
    icd10_code VARCHAR(20),
    cpt_code VARCHAR(20),
    requires_authorization BOOLEAN DEFAULT FALSE,
    is_covered_by_insurance BOOLEAN DEFAULT TRUE,
    insurance_coverage_percentage DECIMAL(5, 2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cost_name (name),
    INDEX idx_cost_type (cost_type),
    INDEX idx_cost_category (category),
    INDEX idx_cost_specialty (specialty_id),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de costos por paciente
CREATE TABLE IF NOT EXISTS patient_costs (
    id VARCHAR(36) PRIMARY KEY,
    patient_journey_id VARCHAR(36) NOT NULL,
    cost_item_id VARCHAR(36) NOT NULL,
    quantity INT DEFAULT 1,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    insurance_coverage DECIMAL(10, 2) DEFAULT 0.00,
    patient_responsibility DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    service_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_cost_journey (patient_journey_id),
    INDEX idx_patient_cost_item (cost_item_id),
    FOREIGN KEY (patient_journey_id) REFERENCES patient_journeys(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_item_id) REFERENCES cost_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de órdenes de laboratorio
CREATE TABLE IF NOT EXISTS laboratory_orders (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    patient_journey_id VARCHAR(36),
    patient_id VARCHAR(255) NOT NULL,
    order_type VARCHAR(100) NOT NULL,
    tests JSON,
    order_date TIMESTAMP NOT NULL,
    scheduled_date TIMESTAMP NULL,
    completed_date TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'routine',
    results JSON,
    results_available BOOLEAN DEFAULT FALSE,
    ordering_doctor_id VARCHAR(255),
    ordering_doctor_name VARCHAR(255),
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    actual_cost DECIMAL(10, 2),
    source_system VARCHAR(100),
    sync_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lab_patient (patient_id),
    INDEX idx_lab_journey (patient_journey_id),
    INDEX idx_lab_status (status),
    INDEX idx_lab_external (external_id),
    FOREIGN KEY (patient_journey_id) REFERENCES patient_journeys(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de órdenes de imágenes
CREATE TABLE IF NOT EXISTS imaging_orders (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    patient_journey_id VARCHAR(36),
    patient_id VARCHAR(255) NOT NULL,
    imaging_type VARCHAR(100) NOT NULL,
    body_part VARCHAR(100),
    modality VARCHAR(50),
    order_date TIMESTAMP NOT NULL,
    scheduled_date TIMESTAMP NULL,
    completed_date TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'routine',
    images JSON,
    report TEXT,
    interpretation TEXT,
    results_available BOOLEAN DEFAULT FALSE,
    ordering_doctor_id VARCHAR(255),
    ordering_doctor_name VARCHAR(255),
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    actual_cost DECIMAL(10, 2),
    source_system VARCHAR(100),
    dicom_study_uid VARCHAR(255),
    sync_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_img_patient (patient_id),
    INDEX idx_img_journey (patient_journey_id),
    INDEX idx_img_status (status),
    INDEX idx_img_external (external_id),
    FOREIGN KEY (patient_journey_id) REFERENCES patient_journeys(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de referencias a especialistas
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    patient_journey_id VARCHAR(36),
    patient_id VARCHAR(255) NOT NULL,
    from_specialty_id VARCHAR(36),
    to_specialty_id VARCHAR(36),
    referring_doctor_id VARCHAR(255),
    referring_doctor_name VARCHAR(255),
    reason TEXT NOT NULL,
    clinical_notes TEXT,
    urgency VARCHAR(50) DEFAULT 'routine',
    referral_date TIMESTAMP NOT NULL,
    appointment_date TIMESTAMP NULL,
    completion_date TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'pending',
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    actual_cost DECIMAL(10, 2),
    source_system VARCHAR(100),
    sync_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ref_patient (patient_id),
    INDEX idx_ref_journey (patient_journey_id),
    INDEX idx_ref_status (status),
    INDEX idx_ref_from (from_specialty_id),
    INDEX idx_ref_to (to_specialty_id),
    FOREIGN KEY (patient_journey_id) REFERENCES patient_journeys(id) ON DELETE SET NULL,
    FOREIGN KEY (from_specialty_id) REFERENCES specialties(id) ON DELETE SET NULL,
    FOREIGN KEY (to_specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo de costos
INSERT INTO cost_items (id, name, description, cost_type, category, base_cost, estimated_duration) VALUES
('cost-consult-general', 'Consulta Medicina General', 'Consulta médica general', 'consultation', 'Medicina General', 35.00, 20),
('cost-consult-cardio', 'Consulta Cardiología', 'Consulta con cardiólogo', 'consultation', 'Cardiología', 75.00, 30),
('cost-consult-endo', 'Consulta Endocrinología', 'Consulta con endocrinólogo', 'consultation', 'Endocrinología', 70.00, 25),
('cost-lab-lipid', 'Perfil Lipídico', 'Análisis de lípidos en sangre', 'laboratory', 'Laboratorio', 25.50, 15),
('cost-lab-glucose', 'Glucosa en Ayunas', 'Medición de glucosa', 'laboratory', 'Laboratorio', 12.00, 10),
('cost-lab-hba1c', 'Hemoglobina A1c', 'Control de diabetes', 'laboratory', 'Laboratorio', 18.50, 10),
('cost-img-ecg', 'Electrocardiograma', 'ECG estándar', 'imaging', 'Cardiología', 35.00, 10),
('cost-img-echo', 'Ecocardiograma', 'Ultrasonido cardíaco', 'imaging', 'Cardiología', 120.00, 45),
('cost-img-xray', 'Rayos X', 'Radiografía estándar', 'imaging', 'Imagenología', 45.00, 15);

-- Tabla de pasos configurables
CREATE TABLE IF NOT EXISTS steps (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    step_type VARCHAR(50) NOT NULL,
    base_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cost_unit VARCHAR(20) DEFAULT 'USD',
    duration_minutes INT,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT '#1976d2',
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(50),
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_step_type (step_type),
    INDEX idx_step_category (category),
    INDEX idx_step_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla intermedia para relacionar flujos con pasos
CREATE TABLE IF NOT EXISTS flow_steps (
    id VARCHAR(36) PRIMARY KEY,
    flow_id VARCHAR(36) NOT NULL,
    step_id VARCHAR(36) NOT NULL,
    order_index INT NOT NULL,
    custom_name VARCHAR(100),
    custom_cost DECIMAL(10,2),
    custom_description TEXT,
    next_step_ids TEXT,
    previous_step_ids TEXT,
    position_x INT DEFAULT 250,
    position_y INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_flow_steps_flow (flow_id),
    INDEX idx_flow_steps_step (step_id),
    INDEX idx_flow_steps_order (flow_id, order_index),
    FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear usuario administrador por defecto
INSERT INTO users (id, username, email, hashed_password, full_name, role) VALUES
('admin-001', 'admin', 'admin@hospital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8f8K5K5K5K', 'Administrador del Sistema', 'admin');
