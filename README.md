# Patient Journey Predictor Platform

## Descripción

Plataforma inteligente para la predicción de recursos médicos basada en el análisis de interacciones de pacientes en sistemas de salud. La plataforma permite:

- **Configuración Parametrizable**: Adaptable a diferentes tipos de centros de salud
- **Integración con Sistemas Hospitalarios**: Conexión con APIs de laboratorios, imágenes, citas y referencias
- **Visualización Interactiva**: Gráficos dinámicos de flujos de pacientes y recursos
- **Analítica Predictiva**: Ciencia de datos para planificación óptima de recursos

## Arquitectura

```
patient-journey-predictor/
├── client/                 # Frontend React + TypeScript
├── backend/                # Backend Python + FastAPI
├── shared/                 # Código compartido y tipos
├── docs/                   # Documentación
└── data/                   # Datos de ejemplo y configuraciones
```

## Características Principales

### 1. Módulo de Configuración
- Parametrización por especialidad médica
- Configuración de recursos por centro
- Definición de flujos de pacientes
- Códigos ICD-10 y CPT personalizables

### 2. Backend de Integración
- APIs RESTful para sistemas hospitalarios
- Conectores para laboratorios, imágenes, citas
- Gestión de referencias a especialistas
- Sincronización de datos en tiempo real

### 3. Motor de Visualización
- Gráficos de flujos de pacientes
- Mapas de calor de recursos
- Dashboards interactivos
- Reportes en tiempo real

### 4. Motor de Analítica
- Machine Learning para predicción de recursos
- Análisis de patrones de pacientes
- Optimización de capacidades
- Alertas proactivas

## Tecnologías

### Frontend
- React 18 + TypeScript
- Material-UI / Ant Design
- D3.js / Chart.js para visualizaciones
- React Query para gestión de estado

### Backend
- Python + FastAPI
- SQLAlchemy ORM
- MySQL
- Redis para caché
- JWT para autenticación

### Analítica (Integrada en Backend)
- Pandas, NumPy, Scikit-learn
- TensorFlow/PyTorch para ML
- Jupyter Notebooks

## Instalación

```bash
# Instalar dependencias
npm run install-all

# Configurar variables de entorno
cp .env.example .env

# Iniciar desarrollo
npm run dev
```

## Uso

1. **Configurar Centro de Salud**: Definir especialidades y recursos disponibles
2. **Conectar Sistemas**: Integrar APIs de laboratorios, imágenes, etc.
3. **Visualizar Flujos**: Ver interacciones de pacientes en tiempo real
4. **Analizar Datos**: Obtener predicciones de necesidades de recursos
5. **Planificar**: Usar insights para optimizar la prestación de servicios

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.
"# patientJourney" 
