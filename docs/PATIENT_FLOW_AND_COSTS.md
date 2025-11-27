# Sistema de Flujos de Pacientes y Análisis de Costos

## Visión General

El sistema de flujos de pacientes y análisis de costos es el componente central de la plataforma Patient Journey Predictor. Permite rastrear el recorrido completo de cada paciente, calcular costos en tiempo real y consultar información de sistemas externos.

## Características Principales

### 1. Flujo Completo del Paciente

#### Desde Consulta General
```
┌─────────────────────┐
│ Consulta General    │
│ Duración: 20 min    │
│ Costo: $35.00       │
└──────────┬──────────┘
           │
           ├─────────────────────┬─────────────────────┐
           ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Órdenes Lab     │   │ Órdenes Imagen  │   │ Referencias     │
│ - Perfil Lipíd. │   │ - ECG           │   │ - Cardiólogo    │
│ - Glucosa       │   │ - Ecocardiogr.  │   │ - Endocrinólogo │
│ $37.50          │   │ $155.00         │   │ $75.00          │
└─────────────────┘   └─────────────────┘   └─────────────────┘
           │                     │                     │
           └─────────────────────┴─────────────────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │ Alta del Paciente   │
                      │ Total: $302.50      │
                      └─────────────────────┘
```

### 2. Integración con Sistemas Externos

#### Sistemas Soportados:
- **LIS (Laboratory Information System)**: Órdenes de laboratorio
- **PACS (Picture Archiving and Communication System)**: Imágenes médicas
- **Sistema de Referencias**: Derivaciones a especialistas
- **HL7 FHIR**: Interoperabilidad estándar

#### Flujo de Integración:
1. **Consulta automática**: El sistema consulta periódicamente los sistemas externos
2. **Sincronización**: Los datos se sincronizan con la base de datos local
3. **Parseo**: Los datos se convierten al formato estándar
4. **Visualización**: Los datos se muestran en el diagrama de flujo

### 3. Sistema de Costos

#### Tipos de Costos:
- **Consultas**: Consulta general, especializada
- **Laboratorios**: Análisis de sangre, orina, etc.
- **Imágenes**: Rayos X, ECG, Ecocardiograma, CT, MRI
- **Medicamentos**: Prescripciones
- **Procedimientos**: Intervenciones médicas
- **Recursos**: Uso de personal y equipos

#### Cálculo de Costos:
```python
# Costo total del recorrido
total_cost = sum([
    consultation_cost,
    laboratory_costs,
    imaging_costs,
    medication_costs,
    procedure_costs,
    resource_costs
])

# Cobertura de seguro
insurance_coverage = total_cost * insurance_percentage

# Responsabilidad del paciente
patient_responsibility = total_cost - insurance_coverage
```

## Modelos de Base de Datos

### PatientJourney
```sql
CREATE TABLE patient_journeys (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    health_center_id VARCHAR(36),
    specialty_id VARCHAR(36),
    flow_id VARCHAR(36),
    status VARCHAR(50),
    current_step VARCHAR(255),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    completed_steps JSON,
    laboratory_orders JSON,
    imaging_orders JSON,
    referrals JSON,
    total_cost DECIMAL(10, 2),
    cost_details JSON,
    total_duration INT,
    wait_times JSON
);
```

### CostItem
```sql
CREATE TABLE cost_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost_type VARCHAR(50),
    category VARCHAR(255),
    base_cost DECIMAL(10, 2),
    estimated_duration INT,
    specialty_id VARCHAR(36),
    icd10_code VARCHAR(20),
    cpt_code VARCHAR(20),
    requires_authorization BOOLEAN,
    is_covered_by_insurance BOOLEAN,
    insurance_coverage_percentage DECIMAL(5, 2)
);
```

### LaboratoryOrder (consultada de sistema externo)
```sql
CREATE TABLE laboratory_orders (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    patient_journey_id VARCHAR(36),
    patient_id VARCHAR(255),
    order_type VARCHAR(100),
    tests JSON,
    order_date TIMESTAMP,
    status VARCHAR(50),
    results JSON,
    estimated_cost DECIMAL(10, 2),
    source_system VARCHAR(100)
);
```

### ImagingOrder (consultada de sistema externo)
```sql
CREATE TABLE imaging_orders (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    patient_journey_id VARCHAR(36),
    patient_id VARCHAR(255),
    imaging_type VARCHAR(100),
    modality VARCHAR(50),
    order_date TIMESTAMP,
    status VARCHAR(50),
    images JSON,
    estimated_cost DECIMAL(10, 2),
    source_system VARCHAR(100)
);
```

### Referral (consultada de sistema externo)
```sql
CREATE TABLE referrals (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    patient_journey_id VARCHAR(36),
    patient_id VARCHAR(255),
    from_specialty_id VARCHAR(36),
    to_specialty_id VARCHAR(36),
    reason TEXT,
    urgency VARCHAR(50),
    status VARCHAR(50),
    estimated_cost DECIMAL(10, 2),
    source_system VARCHAR(100)
);
```

## APIs

### Patient Journey APIs

#### Gestión de Recorridos
- `GET /api/v1/patient-journey/journeys` - Listar recorridos
- `GET /api/v1/patient-journey/journeys/{id}` - Detalle de recorrido
- `POST /api/v1/patient-journey/journeys` - Crear recorrido
- `PUT /api/v1/patient-journey/journeys/{id}` - Actualizar recorrido

#### Órdenes de Laboratorio
- `GET /api/v1/patient-journey/journeys/{id}/laboratory-orders` - Obtener órdenes
- `POST /api/v1/patient-journey/journeys/{id}/sync-laboratory-orders` - Sincronizar desde sistema externo

#### Órdenes de Imágenes
- `GET /api/v1/patient-journey/journeys/{id}/imaging-orders` - Obtener órdenes
- `POST /api/v1/patient-journey/journeys/{id}/sync-imaging-orders` - Sincronizar desde PACS

#### Referencias
- `GET /api/v1/patient-journey/journeys/{id}/referrals` - Obtener referencias
- `POST /api/v1/patient-journey/journeys/{id}/sync-referrals` - Sincronizar referencias

#### Visualización
- `GET /api/v1/patient-journey/journeys/{id}/flow-diagram` - Datos para diagrama
- `GET /api/v1/patient-journey/journeys/{id}/timeline` - Timeline del recorrido
- `GET /api/v1/patient-journey/journeys/{id}/cost-summary` - Resumen de costos

### Cost APIs

#### Gestión de Items de Costo
- `GET /api/v1/costs/items` - Listar items de costo
- `GET /api/v1/costs/items/{id}` - Detalle de item
- `POST /api/v1/costs/items` - Crear item
- `PUT /api/v1/costs/items/{id}` - Actualizar item
- `DELETE /api/v1/costs/items/{id}` - Eliminar item

#### Análisis de Costos
- `POST /api/v1/costs/analysis` - Analizar costos
- `GET /api/v1/costs/patient-journey/{id}/costs` - Costos de un recorrido
- `GET /api/v1/costs/calculate/flow/{id}` - Calcular costo de flujo
- `GET /api/v1/costs/calculate/specialty/{id}` - Costo promedio por especialidad
- `GET /api/v1/costs/dashboard` - Dashboard de costos

## Componentes de Frontend

### 1. PatientFlowDiagram
Diagrama interactivo del flujo del paciente usando React Flow.

**Características:**
- Visualización de pasos del flujo
- Indicadores de costo por paso
- Duración estimada por actividad
- Estados de cada orden/referencia
- Interactividad (zoom, pan)

### 2. CostAnalysisPanel
Panel de análisis de costos con gráficos y métricas.

**Incluye:**
- Costo total y promedio por paciente
- Distribución de costos por categoría
- Costos por especialidad
- Tendencias de costos
- Top items de mayor costo
- Cobertura de seguro vs responsabilidad del paciente

### 3. CostCalculator
Calculadora interactiva de costos.

**Funciones:**
- Selección de servicios del catálogo
- Cálculo automático de totales
- Desglose de cobertura de seguro
- Generación de cotizaciones
- Exportación de presupuestos

## Ejemplo de Flujo Completo

### Caso: Paciente con Sospecha Cardíaca

```javascript
{
  "journeyId": "journey-001",
  "patientId": "patient-12345",
  "steps": [
    {
      "step": "Consulta General",
      "duration": 20,
      "cost": 35.00,
      "status": "completed",
      "timestamp": "2024-01-15T09:00:00Z"
    },
    {
      "step": "Orden Laboratorio - Perfil Lipídico",
      "duration": 15,
      "cost": 25.50,
      "status": "completed",
      "timestamp": "2024-01-15T10:00:00Z",
      "externalSystemId": "LIS-00123",
      "sourceSystem": "LabSystem Pro"
    },
    {
      "step": "Orden Imagen - ECG",
      "duration": 10,
      "cost": 35.00,
      "status": "completed",
      "timestamp": "2024-01-15T11:00:00Z",
      "externalSystemId": "PACS-00456",
      "sourceSystem": "PACS Medical"
    },
    {
      "step": "Referencia a Cardiología",
      "duration": 30,
      "cost": 75.00,
      "status": "scheduled",
      "timestamp": "2024-01-16T14:00:00Z",
      "externalSystemId": "REF-00789",
      "sourceSystem": "ReferralNet"
    }
  ],
  "totalCost": 170.50,
  "totalDuration": 75,
  "insuranceCoverage": 132.99,
  "patientResponsibility": 37.51
}
```

## Beneficios del Sistema

### Para Administradores
- **Visibilidad completa** del recorrido del paciente
- **Análisis de costos** en tiempo real
- **Identificación de cuellos de botella**
- **Optimización de recursos**
- **Proyecciones financieras**

### Para Planificación
- **Predicción de demanda** por especialidad
- **Estimación de costos** futuros
- **Análisis de tendencias**
- **Identificación de servicios de alto costo**
- **ROI de inversiones**

### Para Operaciones
- **Monitoreo en tiempo real**
- **Alertas de retrasos**
- **Gestión de capacidad**
- **Eficiencia de flujos**
- **Coordinación entre departamentos**

## Próximos Desarrollos

1. **Machine Learning para Predicción de Costos**
   - Predicción de costo total basada en diagnóstico inicial
   - Identificación de patrones de costos anormales
   - Optimización de rutas de pacientes

2. **Integración Avanzada**
   - Soporte para más estándares (HL7 v2, DICOM, IHE)
   - Sincronización bidireccional
   - Webhooks para actualizaciones en tiempo real

3. **Análisis Financiero Avanzado**
   - Análisis de rentabilidad por servicio
   - Comparativas con benchmarks
   - Simulaciones de escenarios
   - Optimización de precios

4. **Dashboard Ejecutivo**
   - KPIs financieros
   - Alertas de desviaciones presupuestarias
   - Reportes automatizados
   - Exportación a sistemas contables

## Implementación

### Backend
- **Modelos**: PatientJourney, CostItem, PatientCost, LaboratoryOrder, ImagingOrder, Referral
- **Servicios**: PatientJourneyService, CostService, ExternalSystemsService
- **APIs**: RESTful endpoints para gestión y consulta

### Frontend
- **Páginas**: PatientFlowPage con tabs para flujo, costos y reportes
- **Componentes**: PatientFlowDiagram, CostAnalysisPanel, CostCalculator
- **Servicios**: APIs para conectar con backend

### Base de Datos
- **MySQL**: 7 tablas nuevas para flujos y costos
- **Índices**: Optimizados para consultas frecuentes
- **JSON**: Para flexibilidad en estructura de datos

## Conclusión

Este sistema proporciona una visibilidad completa del recorrido del paciente y sus costos asociados, permitiendo a las entidades de salud:

- **Optimizar** la prestación de servicios
- **Reducir** costos operativos
- **Mejorar** la experiencia del paciente
- **Planificar** mejor los recursos
- **Tomar decisiones** basadas en datos

Es un componente crítico para la predicción de recursos y la planificación financiera de las entidades de salud.










