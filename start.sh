#!/bin/bash

echo "========================================"
echo " Patient Journey Predictor - Setup"
echo "========================================"
echo

# Verificar Docker
echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado o no está corriendo"
    echo "Por favor instala Docker Desktop y asegúrate de que esté corriendo"
    exit 1
fi

echo "Docker encontrado ✓"
echo

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo "Node.js encontrado ✓"
echo

# Verificar Python
echo "Verificando Python..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python no está instalado"
    echo "Por favor instala Python desde https://www.python.org/"
    exit 1
fi

echo "Python encontrado ✓"
echo

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    cat > .env << EOF
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
EOF
    echo "Archivo .env creado ✓"
    echo
fi

echo "Construyendo e iniciando contenedores..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo "ERROR: No se pudieron iniciar los contenedores"
    echo "Verifica que Docker esté corriendo y que no haya conflictos de puertos"
    exit 1
fi

echo
echo "Esperando a que los servicios estén listos..."
sleep 10

echo
echo "========================================"
echo " Servicios Iniciados Exitosamente!"
echo "========================================"
echo
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo "MySQL:     localhost:3306"
echo
echo "Para ver los logs:"
echo "  docker-compose logs -f"
echo
echo "Para detener los servicios:"
echo "  docker-compose down"
echo

# Abrir navegador (solo en sistemas que lo soporten)
if command -v xdg-open &> /dev/null; then
    echo "Abriendo navegador..."
    xdg-open http://localhost:3000
    xdg-open http://localhost:8000/docs
elif command -v open &> /dev/null; then
    echo "Abriendo navegador..."
    open http://localhost:3000
    open http://localhost:8000/docs
fi

echo
echo "¡Listo! El proyecto está corriendo."
echo "Presiona Enter para salir..."
read




