# Guía de Configuración - Basada en Experiencia Real

Esta guía está basada en la experiencia real de configuración del proyecto, incluyendo todos los problemas que encontramos y sus soluciones.

## 📋 Prerrequisitos

- **Node.js** 18+ - [Descargar aquí](https://nodejs.org/)
- **Python** 3.11+ - [Descargar aquí](https://www.python.org/downloads/)
- **MySQL** 8.0 - [Descargar aquí](https://dev.mysql.com/downloads/mysql/)
- **Redis** 7.0 - [Descargar aquí](https://redis.io/download) o usar WSL

## 🚀 Configuración Paso a Paso

### 1. Configurar Backend (Python FastAPI)

#### 1.1 Crear y activar entorno virtual
```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Si tienes restricción de ejecución:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 1.2 Instalar dependencias básicas (PASO CRÍTICO)
**IMPORTANTE**: Instalar en este orden específico para evitar errores de compilación:

```bash
# 1. Primero, instalar pydantic precompilado
pip install --only-binary=:all: "pydantic>=2.0,<3.0"

# 2. Instalar dependencias básicas
pip install fastapi uvicorn sqlalchemy pymysql python-dotenv redis

# 3. Instalar dependencias mínimas
pip install -r requirements-minimal.txt

# 4. Instalar pydantic-settings
pip install pydantic-settings==2.1.0

# 5. Instalar dependencias restantes una por una
pip install python-jose[cryptography] passlib[bcrypt] httpx aiofiles python-dateutil
pip install pytest pytest-asyncio flake8 black isort
pip install python-multipart
pip install alembic cryptography
pip install structlog
pip install websockets
```

#### 1.3 Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
copy env.example .env

# Editar .env con tus credenciales:
DATABASE_URL=mysql+pymysql://patient_user:patient_password@localhost:3306/patient_journey
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=tu-clave-secreta-aqui
JWT_SECRET_KEY=tu-clave-jwt-aqui
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

#### 1.4 Inicializar base de datos MySQL
```bash
# Crear base de datos
mysql -u root -p < database/init.sql

# O ejecutar manualmente:
mysql -u root -p
CREATE DATABASE patient_journey;
CREATE USER 'patient_user'@'localhost' IDENTIFIED BY 'patient_password';
GRANT ALL PRIVILEGES ON patient_journey.* TO 'patient_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 1.5 Iniciar el backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Configurar Frontend (React)

#### 2.1 Instalar dependencias
```bash
cd client
npm install
```

#### 2.2 Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
copy env.example .env

# Editar .env:
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

#### 2.3 Solucionar problemas de compilación (EXPERIENCIA REAL)

**Problema 1**: Errores de módulos no encontrados
```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Problema 2**: Errores de TypeScript
```bash
# Crear tsconfig.json si no existe
# El archivo ya está creado en el proyecto
```

**Problema 3**: Errores de imports
```bash
# Usar App.js en lugar de App.tsx inicialmente
# Luego migrar gradualmente a TypeScript
```

#### 2.4 Iniciar el frontend
```bash
npm start
```

### 3. Configurar Redis (Opcional para desarrollo)

#### 3.1 Windows con WSL
```bash
wsl --install
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### 3.2 Windows nativo
- Instalar Memurai Community
- Configurar en puerto 6379

## 🔧 Solución de Problemas Comunes

### Backend

**Error**: `ModuleNotFoundError: No module named 'pydantic_settings'`
```bash
pip install pydantic-settings==2.1.0
```

**Error**: `ModuleNotFoundError: No module named 'app.core.redis'`
- El archivo `app/core/redis.py` ya está creado

**Error**: Errores de compilación con NumPy/Pandas
```bash
# Usar requirements-core.txt en lugar de requirements.txt
pip install -r requirements-core.txt
```

**Error**: Puerto ocupado
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend

**Error**: `Module not found: Error: Can't resolve './App'`
```bash
# Verificar que App.js existe
ls src/App*

# Si no existe, crear App.js básico
```

**Error**: Errores de TypeScript
```bash
# Crear tsconfig.json
# Usar .js en lugar de .tsx inicialmente
```

**Error**: Warnings de React Router
```bash
# Agregar future flags en Router
<Router
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
```

**Error**: DOM nesting warnings
```bash
# Usar component="div" en Typography
<Typography component="div">
```

## 🎯 Verificación Final

### 1. Backend funcionando
- http://localhost:8000/health
- http://localhost:8000/docs

### 2. Frontend funcionando
- http://localhost:3000
- Debe mostrar la aplicación completa

### 3. Base de datos
```bash
mysql -u patient_user -p patient_journey
SHOW TABLES;
```

## 📝 Notas Importantes

1. **Orden de instalación**: Es crítico instalar las dependencias en el orden especificado
2. **Versiones**: Usar las versiones exactas especificadas en requirements.txt
3. **Entorno virtual**: Siempre usar venv para Python
4. **Caché**: Limpiar caché de npm si hay problemas
5. **Puertos**: Verificar que 3000, 8000, 3306, 6379 estén libres

## 🚀 Comandos Rápidos

```bash
# Iniciar backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Iniciar frontend
cd client
npm start

# Verificar servicios
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

## 🆘 Si Algo No Funciona

1. **Verificar logs**: Revisar consola del navegador y terminal
2. **Limpiar caché**: npm cache clean --force
3. **Reinstalar dependencias**: Eliminar node_modules y reinstalar
4. **Verificar puertos**: Asegurar que no estén ocupados
5. **Revisar archivos**: Verificar que todos los archivos estén creados

## ✅ Checklist Final

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Base de datos MySQL funcionando
- [ ] Redis funcionando (opcional)
- [ ] Sin errores en consola
- [ ] Navegación funcionando
- [ ] Dashboard cargando correctamente

¡Esta guía está basada en nuestra experiencia real y debería funcionar sin problemas!


