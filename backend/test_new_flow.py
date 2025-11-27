#!/usr/bin/env python3
"""
Script para probar la sincronización de pasos creando un flujo con un tipo de paso nuevo
"""
import requests
import json
import uuid

# URL base de la API
BASE_URL = "http://localhost:8000/api/v1"

def create_test_flow():
    """Crear un flujo de prueba con un tipo de paso nuevo"""
    
    # Datos del nuevo flujo con paso de cirugía
    flow_data = {
        "name": "Flujo de Prueba - Cirugía",
        "description": "Flujo de prueba para verificar sincronización de pasos",
        "nodes": [
            {
                "id": f"node-{uuid.uuid4()}",
                "type": "consultation",
                "label": "Consulta Pre-Operatoria",
                "cost": 50.0,
                "duration": 30,
                "position": {"x": 100, "y": 200}
            },
            {
                "id": f"node-{uuid.uuid4()}",
                "type": "laboratory",
                "label": "Exámenes Pre-Operatorios",
                "cost": 80.0,
                "duration": 45,
                "position": {"x": 400, "y": 200}
            },
            {
                "id": f"node-{uuid.uuid4()}",
                "type": "surgery",  # Tipo nuevo que no existe en el maestro
                "label": "Cirugía Mayor",
                "cost": 500.0,
                "duration": 180,
                "position": {"x": 700, "y": 200}
            },
            {
                "id": f"node-{uuid.uuid4()}",
                "type": "recovery",
                "label": "Recuperación Post-Operatoria",
                "cost": 100.0,
                "duration": 120,
                "position": {"x": 1000, "y": 200}
            }
        ],
        "edges": [
            {
                "id": f"edge-{uuid.uuid4()}",
                "source": "node-1",
                "target": "node-2"
            },
            {
                "id": f"edge-{uuid.uuid4()}",
                "source": "node-2", 
                "target": "node-3"
            },
            {
                "id": f"edge-{uuid.uuid4()}",
                "source": "node-3",
                "target": "node-4"
            }
        ],
        "steps": 4,
        "estimatedDuration": 375,
        "estimatedCost": 730.0,
        "isActive": True
    }
    
    try:
        # Crear el flujo
        response = requests.post(f"{BASE_URL}/flows/", json=flow_data)
        
        if response.status_code in [200, 201]:
            flow = response.json()
            print(f"EXITO: Flujo creado exitosamente: {flow['name']}")
            return flow
        else:
            print(f"ERROR: Error creando flujo: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def check_steps_before_sync():
    """Verificar pasos antes de sincronización"""
    try:
        response = requests.get(f"{BASE_URL}/steps/")
        if response.status_code == 200:
            steps = response.json()
            print(f"\nPasos antes de sincronizacion: {len(steps)}")
            
            # Contar por tipo
            step_types = {}
            for step in steps:
                step_type = step.get('step_type', 'unknown')
                step_types[step_type] = step_types.get(step_type, 0) + 1
            
            print("Tipos de pasos:")
            for step_type, count in sorted(step_types.items()):
                print(f"  - {step_type}: {count} pasos")
                
            return steps
        else:
            print(f"ERROR: Error obteniendo pasos: {response.status_code}")
            return []
    except Exception as e:
        print(f"ERROR: {e}")
        return []

def sync_steps():
    """Sincronizar pasos desde flujos"""
    try:
        response = requests.post(f"{BASE_URL}/step-sync/sync-steps-from-flows")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nEXITO: {result['message']}")
            print(f"Pasos creados: {result['total_created']}")
            print(f"Pasos actualizados: {result['total_updated']}")
            
            if result['created_steps']:
                print("\nNuevos pasos creados:")
                for step in result['created_steps']:
                    print(f"  - {step['name']} - {step['type']} - ${step['cost']}")
                    
            return result
        else:
            print(f"ERROR: Error sincronizando: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def check_steps_after_sync():
    """Verificar pasos después de sincronización"""
    try:
        response = requests.get(f"{BASE_URL}/steps/")
        if response.status_code == 200:
            steps = response.json()
            print(f"\nPasos despues de sincronizacion: {len(steps)}")
            
            # Contar por tipo
            step_types = {}
            for step in steps:
                step_type = step.get('step_type', 'unknown')
                step_types[step_type] = step_types.get(step_type, 0) + 1
            
            print("Tipos de pasos:")
            for step_type, count in sorted(step_types.items()):
                print(f"  - {step_type}: {count} pasos")
                
            return steps
        else:
            print(f"ERROR: Error obteniendo pasos: {response.status_code}")
            return []
    except Exception as e:
        print(f"ERROR: {e}")
        return []

def main():
    """Función principal de prueba"""
    print("PRUEBA DE SINCRONIZACION AUTOMATICA DE PASOS")
    print("=" * 50)
    
    # 1. Verificar estado inicial
    print("\n1. Verificando estado inicial de pasos...")
    initial_steps = check_steps_before_sync()
    
    # 2. Crear flujo de prueba
    print("\n2. Creando flujo de prueba con tipos de pasos nuevos...")
    flow = create_test_flow()
    
    if not flow:
        print("ERROR: No se pudo crear el flujo de prueba")
        return
    
    # 3. Sincronizar pasos
    print("\n3. Sincronizando pasos desde flujos...")
    sync_result = sync_steps()
    
    # 4. Verificar estado final
    print("\n4. Verificando estado final de pasos...")
    final_steps = check_steps_after_sync()
    
    # 5. Resumen
    print("\n" + "=" * 50)
    print("RESUMEN DE LA PRUEBA")
    print("=" * 50)
    
    if initial_steps and final_steps:
        initial_count = len(initial_steps)
        final_count = len(final_steps)
        new_steps = final_count - initial_count
        
        print(f"Pasos iniciales: {initial_count}")
        print(f"Pasos finales: {final_count}")
        print(f"Nuevos pasos: {new_steps}")
        
        if new_steps > 0:
            print("EXITO: Sincronizacion funciono correctamente!")
        else:
            print("INFO: No se crearon nuevos pasos (posiblemente ya existian)")
    
    print("\nPrueba completada!")

if __name__ == "__main__":
    main()
