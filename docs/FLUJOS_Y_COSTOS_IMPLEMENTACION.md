# Implementación de Flujos de Pacientes y Análisis de Costos

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo para rastrear flujos de pacientes y analizar costos, que incluye:

1. **Diagrama Visual de Flujos** - Visualización interactiva con React Flow
2. **Sistema de Costos** - Análisis detallado y calculadora
3. **Integración con Sistemas Externos** - Consulta de órdenes y referencias
4. **Panel de Análisis** - Métricas y reportes en tiempo real

## 🎯 Componentes Implementados

### Backend (Python FastAPI)

#### 1. Modelos de Base de Datos

**PatientJourney** - Recorrido completo del paciente
- Seguimiento desde consulta inicial hasta alta
- Referencias a especialistas
- Órdenes de laboratorio e imágenes
- Costos acumulados
- Tiempos de espera

**CostItem** - Catálogo de costos
- Consultas, laboratorios, imágenes
- Precios base y duración estimada
- Códigos ICD-10 y CPT
- Cobertura de seguro

**LaboratoryOrder** - Órdenes de laboratorio
- Consultadas de sistemas LIS externos
- Estado y resultados
- Costos asociados

**ImagingOrder** - Órdenes de imágenes
- Consultadas de sistemas PACS externos
- Modalidades (X-RAY, CT, MRI, etc.)
- Costos asociados

**Referral** - Referencias a especialistas
- Consultadas de sistemas de referencias
- Urgencia y estado
- Costos estimados

#### 2. APIs Implementadas

**Gestión de Costos** (`/api/v1/costs`)
- CRUD de items de costo
- Análisis de costos por período/especialidad
- Dashboard de costos
- Calculadora de costos por flujo

**Patient Journey** (`/api/v1/patient-journey`)
- Gestión de recorridos de pacientes
- Sincronización con sistemas externos
- Diagrama de flujo
- Timeline del recorrido
- Resumen de costos

#### 3. Servicios

**CostService**
- Gestión de items de costo
- Análisis financiero
- Cálculos de costos
- Dashboard de costos

**PatientJourneyService**
- CRUD de recorridos
- Sincronización de datos
- Generación de diagramas
- Cálculo de métricas

**ExternalSystemsService**
- Consulta a sistemas LIS
- Consulta a sistemas PACS
- Consulta a sistemas de referencias
- Parseo de datos HL7 FHIR

### Frontend (React + TypeScript)

#### 1. Páginas

**PatientFlowPage**
- Tab 1: Diagrama de Flujo Interactivo
- Tab 2: Análisis de Costos
- Tab 3: Calculadora de Costos
- Tab 4: Reportes

#### 2. Componentes

**PatientFlowDiagram**
- Visualización con React Flow
- Nodos interactivos con costos
- Animaciones de flujo
- Indicadores de tiempo y costo
- Mini mapa y controles

**CostAnalysisPanel**
- Resumen de costos totales
- Gráficos de distribución
- Tendencias de costos
- Top items de mayor costo
- Cobertura de seguro

**CostCalculator**
- Catálogo de servicios
- Cálculo automático
- Desglose de seguros
- Generación de cotizaciones

#### 3. Servicios de API

**patientJourneyService**
- CRUD de recorridos
- Consulta de órdenes
- Sincronización con externos
- Obtención de diagramas

**costService**
- CRUD de items de costo
- Análisis financiero
- Cálculos y proyecciones
- Dashboard de costos

## 💰 Ejemplo de Flujo con Costos

### Caso Real: Paciente Cardíaco

```javascript
{
  "patientId": "PAT-12345",
  "journeySteps": [
    {
      "order": 1,
      "step": "Consulta General",
      "duration": 20,
      "cost": 35.00,
      "status": "completed"
    },
    {
      "order": 2,
      "step": "Órdenes de Laboratorio",
      "items": [
        { "name": "Perfil Lipídico", "cost": 25.50 },
        { "name": "Glucosa", "cost": 12.00 }
      ],
      "totalCost": 37.50,
      "status": "completed",
      "sourceSystem": "LabSystem Pro"
    },
    {
      "order": 3,
      "step": "Órdenes de Imágenes",
      "items": [
        { "name": "ECG", "cost": 35.00 },
        { "name": "Ecocardiograma", "cost": 120.00 }
      ],
      "totalCost": 155.00,
      "status": "completed",
      "sourceSystem": "PACS Medical"
    },
    {
      "order": 4,
      "step": "Referencia a Cardiología",
      "cost": 75.00,
      "status": "scheduled",
      "appointmentDate": "2024-01-20"
    }
  ],
  "costSummary": {
    "subtotal": 302.50,
    "insuranceCoverage": 235.95,    // 78%
    "patientResponsibility": 66.55,  // 22%
    "totalDuration": 95
  }
}
```

## 📊 Análisis de Costos

### Métricas Clave

1. **Costo Total**: Suma de todos los servicios
2. **Costo Promedio por Paciente**: Total / Número de pacientes
3. **Distribución por Categoría**: Consultas, Laboratorios, Imágenes
4. **Distribución por Especialidad**: Cardiología, Endocrinología, etc.
5. **Tendencias**: Evolución temporal de costos
6. **Top Items**: Servicios de mayor costo

### Gráficos Implementados

1. **Pie Chart** - Distribución de costos por categoría
2. **Bar Chart** - Costos por especialidad
3. **Line Chart** - Tendencia de costos en el tiempo
4. **Table** - Top items de mayor costo

## 🔗 Integración con Sistemas Externos

### Protocolo de Integración

```python
# 1. Consultar sistema externo
orders = await ExternalSystemsService.fetch_laboratory_orders(
    patient_id="PAT-12345",
    external_system_url="https://lis-system.com/api"
)

# 2. Parsear datos al formato estándar
parsed_orders = [
    ExternalSystemsService.parse_laboratory_results(order)
    for order in orders
]

# 3. Guardar en base de datos local
for order in parsed_orders:
    db_order = LaboratoryOrder(**order)
    db.add(db_order)
    
db.commit()

# 4. Actualizar costos del recorrido
await CostService.update_journey_costs(db, journey_id)
```

### Sistemas Soportados

1. **LIS (Laboratory Information System)**
   - Órdenes de laboratorio
   - Resultados
   - Costos

2. **PACS (Picture Archiving and Communication System)**
   - Órdenes de imágenes
   - Imágenes DICOM
   - Reportes radiológicos

3. **Sistema de Referencias**
   - Referencias entre especialidades
   - Citas programadas
   - Estado de referencias

4. **HL7 FHIR**
   - Recursos estándar (Observation, DiagnosticReport, etc.)
   - Interoperabilidad
   - Sincronización bidireccional

## 🚀 Beneficios Implementados

### Para Gestión
✅ Visibilidad completa del recorrido del paciente
✅ Análisis de costos en tiempo real
✅ Identificación de ineficiencias
✅ Predicción de costos futuros
✅ Reportes automatizados

### Para Operaciones
✅ Monitoreo de flujos en tiempo real
✅ Alertas de cuellos de botella
✅ Optimización de recursos
✅ Coordinación entre servicios
✅ Gestión de capacidad

### Para Finanzas
✅ Control de costos por paciente
✅ Análisis de rentabilidad
✅ Cobertura de seguros
✅ Proyecciones presupuestarias
✅ Optimización de precios

## 📱 Cómo Usar

### 1. Acceder a Flujos y Costos
- Ir a http://localhost:3000
- Navegar a "Flujos y Costos" en el menú lateral

### 2. Ver Diagrama de Flujo
- Tab "Diagrama de Flujo"
- Visualizar el recorrido completo
- Ver costos por paso
- Interactuar con el diagrama (zoom, pan)

### 3. Analizar Costos
- Tab "Análisis de Costos"
- Ver métricas generales
- Analizar distribuciones
- Revisar tendencias
- Identificar top items

### 4. Calcular Costos
- Tab "Calculadora de Costos"
- Seleccionar servicios del catálogo
- Agregar cantidades
- Ver desglose automático
- Generar cotización

### 5. Consultar Sistemas Externos
- Las órdenes y referencias se consultan automáticamente
- Sincronización periódica
- Datos en tiempo real

## 🔧 Configuración

### Variables de Entorno

```bash
# Backend (backend/.env)
FHIR_BASE_URL=https://fhir-server.com/api
DICOM_STORAGE_PATH=./storage/dicom
HL7_FHIR_ENABLED=true

# URLs de sistemas externos (configurables por centro)
EXTERNAL_LIS_URL=https://lis-system.com/api
EXTERNAL_PACS_URL=https://pacs-system.com/api
EXTERNAL_REFERRAL_URL=https://referral-system.com/api
```

### Catálogo de Costos

Los costos se cargan desde `backend/database/init.sql`:
- Consultas: $35 - $75
- Laboratorios: $12 - $45
- Imágenes: $35 - $120

## 🎨 Visualización

### Diagrama de Flujo

```
[Consulta General] ($35)
        │
        ├─→ [Lab: Perfil Lipídico] ($25.50)
        ├─→ [Lab: Glucosa] ($12.00)
        ├─→ [Img: ECG] ($35.00)
        ├─→ [Img: Ecocardiograma] ($120.00)
        │
        ▼
[Referencia Cardiología] ($75.00)
        │
        ▼
[Alta del Paciente]
Total: $302.50
```

## 📈 Próximos Pasos

1. ✅ **Modelos de BD** - Completado
2. ✅ **APIs de Costos** - Completado
3. ✅ **APIs de Patient Journey** - Completado
4. ✅ **Componente Visual** - Completado
5. ✅ **Panel de Análisis** - Completado
6. ✅ **Calculadora** - Completado
7. ✅ **Conectores Externos** - Completado

### Mejoras Futuras

- Machine Learning para predicción de costos
- Optimización automática de flujos
- Alertas inteligentes de costos anormales
- Benchmarking con otros centros
- Integración con sistemas ERP/contables

## 🎉 Conclusión

El sistema de flujos y costos está completamente implementado y listo para usar. Proporciona visibilidad completa del recorrido del paciente y análisis financiero detallado, permitiendo optimizar recursos y mejorar la eficiencia operativa.










