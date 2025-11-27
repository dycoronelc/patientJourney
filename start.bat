@echo off
echo ========================================
echo  Patient Journey Predictor - Setup
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado o no esta corriendo
    echo Por favor instala Docker Desktop y asegurate de que este corriendo
    pause
    exit /b 1
)

echo Docker encontrado ✓
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado ✓
echo.

echo Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado
    echo Por favor instala Python desde https://www.python.org/
    pause
    exit /b 1
)

echo Python encontrado ✓
echo.

echo Iniciando servicios con Docker Compose...
echo.

REM Crear archivo .env si no existe
if not exist .env (
    echo Creando archivo .env...
    echo # Base de datos MySQL > .env
    echo DATABASE_URL=mysql+pymysql://patient_user:patient_password@mysql:3306/patient_journey >> .env
    echo MYSQL_ROOT_PASSWORD=root_password >> .env
    echo. >> .env
    echo # Redis >> .env
    echo REDIS_URL=redis://redis:6379/0 >> .env
    echo. >> .env
    echo # Seguridad >> .env
    echo SECRET_KEY=tu-clave-secreta-aqui-cambiar-en-produccion >> .env
    echo JWT_SECRET_KEY=tu-clave-jwt-secreta-aqui >> .env
    echo. >> .env
    echo # Aplicacion >> .env
    echo DEBUG=true >> .env
    echo CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"] >> .env
    echo Archivo .env creado ✓
    echo.
)

echo Construyendo e iniciando contenedores...
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo ERROR: No se pudieron iniciar los contenedores
    echo Verifica que Docker este corriendo y que no haya conflictos de puertos
    pause
    exit /b 1
)

echo.
echo Esperando a que los servicios esten listos...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  Servicios Iniciados Exitosamente!
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo MySQL:     localhost:3306
echo.
echo Para ver los logs:
echo   docker-compose logs -f
echo.
echo Para detener los servicios:
echo   docker-compose down
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

REM Abrir navegador
start http://localhost:3000
start http://localhost:8000/docs

echo.
echo ¡Listo! El proyecto esta corriendo.
echo Presiona cualquier tecla para salir...
pause >nul




