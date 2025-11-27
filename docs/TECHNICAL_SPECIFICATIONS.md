# Especificaciones Técnicas - Patient Journey Predictor

## Stack Tecnológico Actualizado

### Backend (Python FastAPI)
- **Framework**: FastAPI 0.104.1
- **Lenguaje**: Python 3.11
- **ORM**: SQLAlchemy 2.0.23
- **Base de Datos**: MySQL 8.0
- **Caché**: Redis 7.0
- **Autenticación**: JWT con python-jose
- **Validación**: Pydantic 2.5.0
- **WebSockets**: Soporte nativo de FastAPI
- **Tareas Asíncronas**: Celery 5.3.4

### Frontend (React TypeScript)
- **Framework**: React 18.2.0
- **Lenguaje**: TypeScript 4.9.5
- **UI Library**: Material-UI 5.15.0
- **Estado**: React Query 3.39.3
- **Routing**: React Router DOM 6.20.1
- **Visualización**: D3.js 7.8.5, Recharts 2.8.0
- **Formularios**: React Hook Form 7.48.2
- **Notificaciones**: React Hot Toast 2.4.1

### Base de Datos
- **Motor**: MySQL 8.0
- **Características**:
  - Soporte completo para JSON
  - Índices optimizados
  - Foreign Keys con CASCADE
  - Charset UTF8MB4 para emojis
  - Pool de conexiones configurado

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Proxy Reverso**: Nginx (producción)
- **Monitoreo**: Prometheus + Grafana
- **Logging**: Structured Logging con structlog
- **CI/CD**: GitHub Actions (configurable)

## Arquitectura de la Aplicación

### Estructura del Backend
```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/          # Rutas de la API
│   │       ├── websocket.py     # WebSockets
│   │       └── dependencies.py  # Dependencias
│   ├── core/
│   │   ├── config.py           # Configuración
│   │   ├── database.py         # Configuración DB
│   │   ├── redis.py            # Configuración Redis
│   │   └── logging.py          # Configuración logs
│   ├── models/                 # Modelos SQLAlchemy
│   ├── schemas/                # Esquemas Pydantic
│   ├── services/               # Lógica de negocio
│   ├── utils/                  # Utilidades
│   └── middleware/             # Middleware personalizado
├── database/
│   └── init.sql               # Script de inicialización
├── requirements.txt           # Dependencias Python
├── Dockerfile                # Imagen Docker
└── main.py                   # Punto de entrada
```

### Estructura del Frontend
```
client/
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── Layout/           # Layout principal
│   │   ├── Dashboard/        # Componentes del dashboard
│   │   └── Common/           # Componentes comunes
│   ├── pages/                # Páginas principales
│   ├── hooks/                # Custom hooks
│   ├── services/             # Servicios API
│   ├── types/                # Tipos TypeScript
│   ├── utils/                # Utilidades
│   └── App.tsx              # Componente principal
├── public/                   # Archivos estáticos
├── package.json             # Dependencias Node.js
└── Dockerfile              # Imagen Docker
```

## APIs y Endpoints

### Configuración (`/api/v1/config`)
- `GET /specialties` - Listar especialidades
- `POST /specialties` - Crear especialidad
- `PUT /specialties/{id}` - Actualizar especialidad
- `DELETE /specialties/{id}` - Eliminar especialidad
- `GET /centers` - Listar centros de salud
- `POST /centers` - Crear centro de salud
- `PUT /centers/{id}` - Actualizar centro
- `DELETE /centers/{id}` - Eliminar centro
- `GET /resources` - Listar recursos
- `POST /resources` - Crear recurso
- `GET /patient-flows` - Listar flujos de pacientes
- `POST /patient-flows` - Crear flujo

### Integración (`/api/v1/integration`)
- `POST /laboratory/sync` - Sincronizar datos de laboratorio
- `POST /imaging/sync` - Sincronizar imágenes médicas
- `GET /appointments` - Obtener citas médicas
- `POST /referrals` - Gestionar referencias
- `GET /hl7-fhir/{resource}` - Acceso a recursos FHIR

### Analítica (`/api/v1/analytics`)
- `GET /predictions` - Obtener predicciones de recursos
- `POST /analyze` - Ejecutar análisis de datos
- `GET /dashboard` - Datos para dashboard
- `GET /reports` - Generar reportes
- `GET /metrics` - Métricas en tiempo real

### Visualización (`/api/v1/visualization`)
- `GET /flows` - Datos de flujos de pacientes
- `GET /heatmap` - Datos para mapa de calor
- `GET /realtime` - Datos en tiempo real
- `WebSocket /ws/realtime` - Stream de datos en tiempo real

## Modelos de Datos

### Specialty (Especialidad)
```python
class Specialty(Base):
    id: str (UUID)
    name: str
    description: str
    common_tests: JSON
    typical_medications: JSON
    icd10_codes: JSON
    cpt_codes: JSON
    average_consultation_time: int
    resource_requirements: JSON
    patient_flow: JSON
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

### HealthCenter (Centro de Salud)
```python
class HealthCenter(Base):
    id: str (UUID)
    name: str
    type: str (hospital, clinic, policlinic)
    address: str
    city: str
    country: str
    latitude: float
    longitude: float
    capacity: JSON
    resources: JSON
    specialties: JSON
    operating_hours: JSON
    contact_info: JSON
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

### PatientInteraction (Interacción de Paciente)
```python
class PatientInteraction(Base):
    id: str (UUID)
    patient_id: str
    center_id: str
    specialty_id: str
    interaction_type: str
    timestamp: datetime
    duration: int
    resources: JSON
    data: JSON
    status: str
    cost: float
    created_at: datetime
    updated_at: datetime
```

## Seguridad

### Autenticación
- **JWT Tokens**: Access tokens (30 min) + Refresh tokens (7 días)
- **Algoritmo**: HS256
- **Middleware**: Verificación automática en rutas protegidas
- **Roles**: admin, user, viewer

### Autorización
- **RBAC**: Role-Based Access Control
- **Permisos**: Por endpoint y por recurso
- **Middleware**: Verificación de permisos

### Protección de Datos
- **Encriptación**: HTTPS/TLS en tránsito
- **Cifrado**: AES-256 para datos sensibles
- **Anonimización**: Para datos de pacientes
- **Audit Logs**: Registro de todas las operaciones

## Performance y Escalabilidad

### Base de Datos
- **Índices**: Optimizados para consultas frecuentes
- **Pool de Conexiones**: Configurado para alta concurrencia
- **Queries**: Optimizadas con SQLAlchemy
- **Caché**: Redis para consultas frecuentes

### API
- **Async/Await**: Operaciones asíncronas
- **Paginación**: En todas las listas
- **Rate Limiting**: Protección contra abuso
- **Compresión**: Gzip para respuestas grandes

### Frontend
- **Code Splitting**: Carga lazy de componentes
- **Memoización**: React.memo y useMemo
- **Virtualización**: Para listas grandes
- **CDN**: Para assets estáticos

## Monitoreo y Logging

### Logging
- **Structured Logging**: JSON format
- **Niveles**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Contexto**: Request ID, User ID, Timestamp
- **Rotación**: Archivos por día

### Métricas
- **Prometheus**: Métricas de aplicación
- **Grafana**: Dashboards de monitoreo
- **Health Checks**: Endpoints de salud
- **Alertas**: Notificaciones automáticas

### Performance
- **APM**: Application Performance Monitoring
- **Trazas**: Distributed tracing
- **Profiling**: Análisis de performance
- **Benchmarks**: Pruebas de carga

## Deployment

### Desarrollo
```bash
# Instalar dependencias
npm run install-all

# Iniciar servicios
docker-compose up -d

# Ejecutar migraciones
cd backend && alembic upgrade head

# Iniciar desarrollo
npm run dev
```

### Producción
```bash
# Build de imágenes
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Verificar salud
curl http://localhost:8000/health
```

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=mysql+pymysql://user:pass@host:3306/db
REDIS_URL=redis://host:6379/0

# Seguridad
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Aplicación
DEBUG=false
CORS_ORIGINS=["https://yourdomain.com"]
```

## Testing

### Backend (Python)
- **Framework**: pytest
- **Cobertura**: pytest-cov
- **Mocking**: unittest.mock
- **BDD**: pytest-bdd

### Frontend (React)
- **Framework**: Jest + React Testing Library
- **E2E**: Playwright
- **Cobertura**: Jest coverage
- **Visual**: Storybook

### Integración
- **API Testing**: httpx
- **Database Testing**: Test containers
- **Load Testing**: Locust
- **Security Testing**: OWASP ZAP

## Roadmap Técnico

### Fase 1: MVP (Completado)
- ✅ Backend FastAPI básico
- ✅ Frontend React básico
- ✅ Base de datos MySQL
- ✅ Autenticación JWT
- ✅ APIs de configuración

### Fase 2: Integración
- 🔄 Conectores HL7 FHIR
- 🔄 Integración DICOM
- 🔄 WebSockets en tiempo real
- 🔄 Sistema de colas Celery

### Fase 3: Analítica
- ⏳ Modelos de ML
- ⏳ Motor de predicción
- ⏳ Dashboards avanzados
- ⏳ Reportes automatizados

### Fase 4: Producción
- ⏳ Optimizaciones de performance
- ⏳ Monitoreo completo
- ⏳ CI/CD pipeline
- ⏳ Documentación completa




