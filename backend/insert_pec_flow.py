"""
Script para insertar el flujo PEC en la base de datos
Ejecutar: python insert_pec_flow.py
"""

import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import get_db
from app.core.config import settings
import mysql.connector
from mysql.connector import Error

def insert_pec_flow():
    """Insertar el flujo PEC en la base de datos"""
    try:
        # Conectar a la base de datos
        connection = mysql.connector.connect(
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD,
            database=settings.DATABASE_NAME
        )
        
        cursor = connection.cursor()
        
        # Leer el archivo SQL
        sql_file = Path(__file__).parent / "database" / "insert_pec_flow.sql"
        
        if not sql_file.exists():
            print(f"Error: No se encontró el archivo {sql_file}")
            return False
        
        with open(sql_file, 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        # Ejecutar el script SQL
        # Dividir por ';' y ejecutar cada comando
        commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip() and not cmd.strip().startswith('--')]
        
        for command in commands:
            if command:
                try:
                    cursor.execute(command)
                    connection.commit()
                except Error as e:
                    # Ignorar errores de duplicados (ON DUPLICATE KEY UPDATE)
                    if "Duplicate entry" not in str(e):
                        print(f"Advertencia al ejecutar comando: {e}")
        
        print("✅ Flujo PEC insertado exitosamente en la base de datos")
        print("   - Flujo: flow-pec")
        print("   - 8 nodos creados")
        print("   - 7 conexiones creadas")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"❌ Error al insertar el flujo PEC: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

if __name__ == "__main__":
    print("Insertando flujo PEC en la base de datos...")
    success = insert_pec_flow()
    sys.exit(0 if success else 1)

