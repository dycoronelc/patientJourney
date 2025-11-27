# Guía de Configuración y Ejecución - Patient Journey Predictor

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **Python** (versión 3.11 o superior) - [Descargar aquí](https://www.python.org/downloads/)
- **Docker Desktop** - [Descargar aquí](https://www.docker.com/products/docker-desktop/)
- **Git** - [Descargar aquí](https://git-scm.com/downloads)

## 🚀 Opción 1: Ejecución con Docker (Recomendado)

### Paso 1: Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd patient_journey
```

### Paso 2: Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```bash
# Base de datos MySQL
DATABASE_URL=mysql+pymysql://patient_user:patient_password@mysql:3306/patient_journey
MYSQL_ROOT_PASSWORD=root_password

# Redis
REDIS_URL=redis://redis:6379/0

# Seguridad
SECRET_KEY=tu-clave-secreta-aqui-cambiar-en-produccion
JWT_SECRET_KEY=tu-clave-jwt-secreta-aqui

# Aplicación
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

### Paso 3: Ejecutar con Docker Compose
```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado de los contenedores
docker-compose ps
```

### Paso 4: Verificar que Todo Funciona
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Base de datos MySQL**: localhost:3306

### Paso 5: Comandos Útiles de Docker
```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -p
```

## 🛠️ Opción 2: Ejecución Manual (Desarrollo)

### Paso 1: Configurar Backend (Python)

#### 1.1 Crear entorno virtual
```bash
cd backend
python -m venv venv

# En Windows
venv\Scripts\activate

# En Linux/Mac
source venv/bin/activate
```

#### 1.2 Instalar dependencias
```bash
pip install -r requirements.txt
```

#### 1.3 Configurar base de datos MySQL
```bash
# Instalar MySQL localmente o usar Docker solo para MySQL
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=root_password -e MYSQL_DATABASE=patient_journey -e MYSQL_USER=patient_user -e MYSQL_PASSWORD=patient_password -p 3306:3306 -d mysql:8.0
```

#### 1.4 Configurar variables de entorno
Crear archivo `backend/.env`:
```bash
DATABASE_URL=mysql+pymysql://patient_user:patient_password@localhost:3306/patient_journey
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=tu-clave-secreta-aqui
JWT_SECRET_KEY=tu-clave-jwt-secreta-aqui
DEBUG=true
```

#### 1.5 Ejecutar migraciones (si usas Alembic)
```bash
# Instalar Alembic si no está incluido
pip install alembic

# Crear migración inicial
alembic init alembic

# Ejecutar migraciones
alembic upgrade head
```

#### 1.6 Iniciar el servidor backend
```bash
# Desde el directorio backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Paso 2: Configurar Frontend (React)

#### 2.1 Instalar dependencias
```bash
cd client
npm install
```

#### 2.2 Configurar variables de entorno
Crear archivo `client/.env`:
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

#### 2.3 Iniciar el servidor de desarrollo
```bash
npm start
```

### Paso 3: Configurar Redis (Opcional para desarrollo)
```bash
# Con Docker
docker run --name redis-dev -p 6379:6379 -d redis:7-alpine

# O instalar Redis localmente
# Windows: https://github.com/microsoftarchive/redis/releases
# Linux: sudo apt-get install redis-server
# Mac: brew install redis
```

## 🔧 Comandos de Desarrollo

### Scripts Disponibles
```bash
# Instalar todas las dependencias
npm run install-all

# Ejecutar frontend y backend simultáneamente
npm run dev

# Solo backend
npm run backend

# Solo frontend
npm run client

# Ejecutar tests
npm run test

# Linting
npm run lint
```

### Comandos Backend (Python)
```bash
cd backend

# Ejecutar servidor de desarrollo
uvicorn main:app --reload

# Ejecutar tests
pytest

# Linting
flake8 .
black .
isort .

# Type checking
mypy .
```

### Comandos Frontend (React)
```bash
cd client

# Servidor de desarrollo
npm start

# Build para producción
npm run build

# Tests
npm test

# Linting
npm run lint
```

## 🗄️ Configuración de Base de Datos

### Acceder a MySQL
```bash
# Con Docker
docker-compose exec mysql mysql -u root -p

# Local
mysql -u root -p
```

### Comandos SQL Útiles
```sql
-- Ver bases de datos
SHOW DATABASES;

-- Usar la base de datos del proyecto
USE patient_journey;

-- Ver tablas
SHOW TABLES;

-- Ver estructura de una tabla
DESCRIBE specialties;

-- Insertar datos de ejemplo
INSERT INTO specialties (id, name, description) VALUES 
('test-001', 'Cardiología', 'Especialidad del corazón');
```

## 🐛 Solución de Problemas Comunes

### Error: Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Matar proceso
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### Error: No se puede conectar a MySQL
```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar MySQL
docker-compose restart mysql
```

### Error: Módulos Python no encontrados
```bash
# Verificar que el entorno virtual esté activado
which python  # Debe mostrar la ruta del venv

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Error: Dependencias Node.js
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Verificar que Todo Funciona

### 1. Backend API
```bash
# Health check
curl http://localhost:8000/health

# Documentación
curl http://localhost:8000/docs
```

### 2. Frontend
- Abrir http://localhost:3000
- Debe cargar la aplicación React
- No debe haber errores en la consola del navegador

### 3. Base de Datos
```bash
# Conectar y verificar tablas
docker-compose exec mysql mysql -u root -p patient_journey
SHOW TABLES;
```

### 4. APIs Funcionando
```bash
# Probar endpoint de especialidades
curl http://localhost:8000/api/v1/config/specialties

# Debe devolver JSON con las especialidades
```

## 🚀 Comandos de Producción

### Build para Producción
```bash
# Frontend
cd client
npm run build

# Backend (crear imagen Docker)
cd backend
docker build -t patient-journey-backend .
```

### Deploy con Docker
```bash
# Usar docker-compose para producción
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Notas Importantes

1. **Puertos por Defecto**:
   - Frontend: 3000
   - Backend: 8000
   - MySQL: 3306
   - Redis: 6379

2. **Variables de Entorno**:
   - Nunca commitees archivos `.env` con datos reales
   - Usa diferentes valores para desarrollo y producción

3. **Base de Datos**:
   - Los datos se persisten en volúmenes de Docker
   - Para desarrollo, puedes usar SQLite como alternativa

4. **Logs**:
   - Backend: Se muestran en la consola
   - Frontend: Se muestran en el navegador (F12)
   - Docker: `docker-compose logs -f`

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. **Verificar logs**: `docker-compose logs -f`
2. **Revisar documentación**: `docs/` folder
3. **Verificar puertos**: Asegúrate de que no estén ocupados
4. **Reiniciar servicios**: `docker-compose restart`

## ✅ Checklist de Verificación

- [ ] Docker Desktop instalado y corriendo
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] `docker-compose up -d` ejecutado sin errores
- [ ] Frontend accesible en http://localhost:3000
- [ ] Backend accesible en http://localhost:8000
- [ ] API docs accesibles en http://localhost:8000/docs
- [ ] Base de datos MySQL funcionando
- [ ] No hay errores en los logs

¡Listo! Tu proyecto Patient Journey Predictor debería estar funcionando correctamente. 🎉
