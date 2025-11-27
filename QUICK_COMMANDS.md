# Comandos Rápidos - Patient Journey Predictor

## 🚀 Inicio Rápido

### Windows
```bash
# Ejecutar script de inicio automático
start.bat
```

### Linux/Mac
```bash
# Ejecutar script de inicio automático
./start.sh
```

### Manual
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📊 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Base de Datos**: localhost:3306
- **Redis**: localhost:6379

## 🔧 Comandos de Desarrollo

### Docker
```bash
# Ver estado de contenedores
docker-compose ps

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql

# Ver logs de un servicio
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Ejecutar comandos dentro de contenedores
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -p
docker-compose exec frontend sh

# Reconstruir imágenes
docker-compose build --no-cache

# Limpiar todo (CUIDADO: elimina datos)
docker-compose down -v
docker system prune -a
```

### Backend (Python)
```bash
# Acceder al contenedor backend
docker-compose exec backend bash

# Instalar nuevas dependencias
docker-compose exec backend pip install nueva-dependencia

# Ejecutar tests
docker-compose exec backend pytest

# Ver logs del backend
docker-compose logs -f backend
```

### Frontend (React)
```bash
# Acceder al contenedor frontend
docker-compose exec frontend sh

# Instalar nuevas dependencias
docker-compose exec frontend npm install nueva-dependencia

# Ejecutar tests
docker-compose exec frontend npm test

# Build para producción
docker-compose exec frontend npm run build
```

### Base de Datos (MySQL)
```bash
# Conectar a MySQL
docker-compose exec mysql mysql -u root -p

# Backup de la base de datos
docker-compose exec mysql mysqldump -u root -p patient_journey > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -p patient_journey < backup.sql

# Ver tablas
docker-compose exec mysql mysql -u root -p -e "USE patient_journey; SHOW TABLES;"
```

## 🧪 Testing

### Backend
```bash
# Ejecutar todos los tests
docker-compose exec backend pytest

# Tests con cobertura
docker-compose exec backend pytest --cov=app

# Tests específicos
docker-compose exec backend pytest tests/test_specialty.py
```

### Frontend
```bash
# Ejecutar tests
docker-compose exec frontend npm test

# Tests en modo watch
docker-compose exec frontend npm test -- --watch
```

## 🔍 Debugging

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f mysql
```

### Acceder a Contenedores
```bash
# Backend (Python)
docker-compose exec backend bash

# Frontend (Node.js)
docker-compose exec frontend sh

# Base de datos
docker-compose exec mysql bash
```

### Verificar Servicios
```bash
# Health check del backend
curl http://localhost:8000/health

# Verificar API
curl http://localhost:8000/api/v1/config/specialties

# Verificar frontend
curl http://localhost:3000
```

## 🗄️ Base de Datos

### Comandos MySQL
```sql
-- Conectar
mysql -u root -p

-- Usar base de datos
USE patient_journey;

-- Ver tablas
SHOW TABLES;

-- Ver estructura de tabla
DESCRIBE specialties;

-- Insertar datos de prueba
INSERT INTO specialties (id, name, description) VALUES 
('test-001', 'Cardiología', 'Especialidad del corazón');

-- Ver datos
SELECT * FROM specialties;
```

### Backup y Restore
```bash
# Backup completo
docker-compose exec mysql mysqldump -u root -p --all-databases > full_backup.sql

# Backup de una base de datos
docker-compose exec mysql mysqldump -u root -p patient_journey > patient_journey_backup.sql

# Restore
docker-compose exec -T mysql mysql -u root -p < backup.sql
```

## 🚀 Producción

### Build para Producción
```bash
# Frontend
docker-compose exec frontend npm run build

# Backend (ya está optimizado)
docker-compose build backend
```

### Variables de Entorno de Producción
```bash
# Crear archivo .env.prod
cp .env .env.prod

# Editar para producción
nano .env.prod
```

### Deploy
```bash
# Usar docker-compose de producción
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Mantenimiento

### Limpiar Docker
```bash
# Eliminar contenedores parados
docker container prune

# Eliminar imágenes no usadas
docker image prune

# Eliminar volúmenes no usados
docker volume prune

# Limpieza completa (CUIDADO)
docker system prune -a --volumes
```

### Actualizar Dependencias
```bash
# Backend
docker-compose exec backend pip list --outdated
docker-compose exec backend pip install --upgrade package-name

# Frontend
docker-compose exec frontend npm outdated
docker-compose exec frontend npm update
```

## 🆘 Solución de Problemas

### Puerto Ocupado
```bash
# Ver qué usa el puerto
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Matar proceso
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### Contenedor No Inicia
```bash
# Ver logs detallados
docker-compose logs backend

# Reconstruir imagen
docker-compose build --no-cache backend

# Reiniciar servicio
docker-compose restart backend
```

### Base de Datos No Conecta
```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar MySQL
docker-compose restart mysql
```

### Frontend No Carga
```bash
# Verificar que el contenedor esté corriendo
docker-compose ps frontend

# Ver logs del frontend
docker-compose logs frontend

# Reinstalar dependencias
docker-compose exec frontend npm install
```

## 📝 Notas Importantes

1. **Primera Ejecución**: Puede tomar varios minutos construir las imágenes
2. **Puertos**: Asegúrate de que los puertos 3000, 8000, 3306, 6379 estén libres
3. **Memoria**: Docker necesita al menos 4GB de RAM disponible
4. **Espacio**: Las imágenes Docker ocupan varios GB de espacio
5. **Firewall**: Asegúrate de que el firewall no bloquee los puertos

## 🎯 Comandos Más Usados

```bash
# Iniciar proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener proyecto
docker-compose down

# Reiniciar backend
docker-compose restart backend

# Acceder a base de datos
docker-compose exec mysql mysql -u root -p

# Ver estado
docker-compose ps
```

¡Estos comandos te ayudarán a trabajar eficientemente con el proyecto! 🚀




