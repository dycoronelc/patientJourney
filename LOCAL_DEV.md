# Guía de Desarrollo Local (sin Docker)

Esta guía explica cómo ejecutar el backend (FastAPI + MySQL) y el frontend (React) localmente sin usar Docker ni GitHub.

## 1) Prerrequisitos

- Node.js 18+
- Python 3.11+
- MySQL 8 (local) con un usuario con permisos
- Redis 7 (local)
  - Windows: usa WSL (redis-server) o Memurai Community

## 2) Backend (FastAPI)

### 2.1 Crear y activar entorno virtual
```bash
cd backend
python -m venv venv

# Windows PowerShell
./venv/Scripts/Activate.ps1

# macOS/Linux (bash/zsh)
source venv/bin/activate
```

Si tienes restricción de ejecución en PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2.2 Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2.3 Configurar variables de entorno
Crear archivo `backend/.env` con el siguiente contenido (ajusta credenciales):
```bash
# Base de datos (MySQL local)
DATABASE_URL=mysql+pymysql://patient_user:patient_password@localhost:3306/patient_journey

# Redis local
REDIS_URL=redis://localhost:6379/0

# Seguridad
SECRET_KEY=tu-clave-secreta
JWT_SECRET_KEY=tu-clave-jwt

# App
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

Tip: Si prefieres evitar MySQL durante el desarrollo inicial, puedes usar SQLite temporalmente:
```bash
DATABASE_URL=sqlite:///./dev.db
```
En ese caso no necesitas ejecutar el script SQL y las tablas se crean al iniciar.

### 2.4 Inicializar base de datos (solo si usas MySQL)
Importa el esquema y datos de ejemplo:
```bash
# Con usuario root
mysql -u root -p < backend/database/init.sql

# O contra una base específica
mysql -u patient_user -p patient_journey < backend/database/init.sql
```

Asegúrate de que el servicio MySQL esté ejecutándose y escuchando en `localhost:3306`.

### 2.5 Iniciar el backend
```bash
# Desde la carpeta backend (con el venv activo)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints útiles:
- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs

## 3) Redis local

- Windows con WSL:
```bash
wsl --install               # si no tienes WSL
sudo apt update && sudo apt install -y redis-server
sudo service redis-server start
```
- Alternativa Windows nativa: instalar Memurai Community en el puerto 6379.
- macOS: `brew install redis` y `brew services start redis`.
- Linux: `sudo apt install redis-server` y `sudo systemctl start redis`.

## 4) Frontend (React)

### 4.1 Instalar dependencias
```bash
cd client
npm install
```

### 4.2 Variables de entorno
Crear `client/.env`:
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

### 4.3 Iniciar el frontend
```bash
npm start
```

La app estará en http://localhost:3000

## 5) Verificación rápida

1. Backend responde en http://localhost:8000/health y muestra docs en http://localhost:8000/docs
2. Frontend carga en http://localhost:3000
3. El frontend puede consumir el backend (revisar la consola del navegador)

## 6) Problemas comunes y soluciones

- Puerto ocupado (8000/3000/3306/6379):
  - Windows: `netstat -ano | findstr :8000` y `taskkill /PID <PID> /F`
  - macOS/Linux: `lsof -i :8000` y `kill -9 <PID>`

- MySQL no conecta:
  - Verifica usuario/clave/puerto
  - Confirma que el servicio esté corriendo
  - Comprueba que `DATABASE_URL` es correcta

- Redis no disponible:
  - Asegura que corre en 6379
  - En Windows, usar WSL o Memurai

- Módulos Python faltantes:
  - Asegúrate de tener el venv activo
  - `pip install -r requirements.txt --force-reinstall`

- Dependencias Node.js:
  - `npm cache clean --force`
  - Eliminar `node_modules` y `package-lock.json` y luego `npm install`

## 7) Scripts útiles (raíz del proyecto)

```bash
# Instalar dependencias del frontend y backend (venv manual)
npm run install-all

# Ejecutar frontend y backend en paralelo (requiere tener backend manual corriendo)
npm run dev

# Sólo frontend
npm run client

# Tests frontend
cd client && npm test
```

## 8) Notas

- No expongas secretos reales en `.env`
- Usa SQLite en desarrollo inicial si quieres simplificar
- Para datos reales, usa MySQL local y el script `backend/database/init.sql`



