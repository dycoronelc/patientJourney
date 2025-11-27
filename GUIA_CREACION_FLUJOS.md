# 📝 Guía para Crear y Gestionar Flujos de Pacientes

## 🎯 ¿Qué son los Flujos?

Los **flujos de pacientes** definen el recorrido estándar que sigue un paciente en cada especialidad, desde la consulta inicial hasta el alta.

Cada flujo incluye:
- 👤 **Pasos del recorrido** (consultas, estudios, referencias)
- 💰 **Costos** por cada paso
- ⏱️ **Duración estimada** de cada actividad
- 🔗 **Conexiones** entre pasos

## 📍 Dónde Gestionar los Flujos

### Opción 1: Configuración → Gestión de Flujos
1. Ve a **"Configuración"** en el menú lateral
2. Click en el tab **"Gestión de Flujos"**
3. Aquí puedes:
   - Ver todos los flujos creados
   - Crear nuevos flujos
   - Editar flujos existentes
   - Duplicar flujos
   - Eliminar flujos

### Opción 2: Flujos y Costos → Diagrama de Flujo
1. Ve a **"Flujos y Costos"** en el menú lateral
2. En el tab **"Diagrama de Flujo"**
3. Usa el selector **"Seleccionar Flujo"** para ver diferentes flujos
4. Click en **"Editar Flujo"** para modificar el flujo actual

## 🛠️ Cómo Crear un Nuevo Flujo

### Paso 1: Ir a Gestión de Flujos
```
Configuración → Gestión de Flujos → Crear Nuevo Flujo
```

### Paso 2: Usar el Editor Visual

El editor tiene **2 paneles**:

#### **Panel Izquierdo: Herramientas**
- 📝 Nombre del flujo
- 📄 Descripción
- ➕ Botones para agregar pasos:
  - **Consulta** (azul) - $35, 20 min
  - **Laboratorio** (rojo) - $25, 15 min
  - **Imagen** (verde) - $45, 30 min
  - **Referencia** (naranja) - $75, 30 min
  - **Alta** (verde) - $0, 10 min

#### **Panel Derecho: Lienzo de Diseño**
- Área de trabajo para diseñar el flujo
- Zoom y pan
- Mini mapa

### Paso 3: Agregar Pasos al Flujo

1. **Click en un tipo de paso** (Consulta, Laboratorio, etc.)
2. El paso **aparece en el lienzo**
3. **Arrastra el nodo** para posicionarlo
4. **Doble click** en el nodo para editar:
   - Cambiar nombre
   - Ajustar costo
   - Modificar duración
   - Agregar descripción

### Paso 4: Conectar los Pasos

1. **Posiciona el cursor** en el borde de un nodo
2. **Arrastra** hacia otro nodo
3. Se crea una **flecha de conexión**
4. Las **conexiones definen** el orden del flujo

### Paso 5: Guardar el Flujo

1. **Ingresa nombre** y descripción
2. Click en **"Guardar Flujo"**
3. El flujo se guarda y está listo para usar

## 📋 Flujos Predefinidos

El sistema incluye **4 flujos predefinidos**:

### 1. Flujo de Cardiología
**Pasos:**
1. Consulta General ($35, 20 min)
2. Laboratorios: Perfil Lipídico + Glucosa ($37.50, 15 min)
3. Imágenes: ECG + Ecocardiograma ($155, 55 min)
4. Referencia a Cardiología ($75, 30 min)
5. Alta ($0, 10 min)

**Total:** $302.50 | 130 minutos

### 2. Flujo de Endocrinología
**Pasos:**
1. Consulta General ($35, 20 min)
2. Laboratorios: TSH + T3 + T4 + Glucosa + HbA1c ($55.50, 20 min)
3. Consulta Endocrinología ($70, 25 min)
4. Alta y Tratamiento ($0, 10 min)

**Total:** $160.50 | 75 minutos

### 3. Flujo de Geriatría
**Pasos:**
1. Consulta General ($35, 20 min)
2. Perfil Metabólico Completo ($65, 25 min)
3. Densitometría Ósea ($85, 30 min)
4. Evaluación Geriátrica ($45, 45 min)
5. Referencias Múltiples ($195, 60 min)
6. Plan de Tratamiento ($0, 15 min)

**Total:** $425.00 | 195 minutos

### 4. Flujo de Medicina General
**Pasos:**
1. Consulta General ($35, 20 min)
2. Exámenes Básicos ($30, 15 min)
3. Alta con Tratamiento ($0, 10 min)

**Total:** $65.00 | 45 minutos

## 🎨 Personalizar un Flujo

### Editar un Nodo (Doble Click)
```
Antes:
[Laboratorio] → $25.00, 15 min

Editar:
- Nombre: "Perfil Completo"
- Costo: $45.00
- Duración: 25 min

Después:
[Perfil Completo] → $45.00, 25 min
```

### Agregar Pasos Adicionales
```
Flujo original:
Consulta → Laboratorio → Alta

Agregar paso:
Consulta → Laboratorio → [Imagen] → Alta
                            ↑
                         (nuevo paso)
```

### Modificar Conexiones
```
Cambiar de:
A → B → C

A:
A → B
A → C
(B y C en paralelo)
```

## 🔄 Seleccionar Flujos para Visualizar

### En "Flujos y Costos"

1. Ve a **"Flujos y Costos"**
2. Tab **"Diagrama de Flujo"**
3. Usa el **selector dropdown** arriba a la derecha:
   ```
   [Seleccionar Flujo ▼]
   - Flujo Cardiología - Cardiología
   - Flujo Endocrinología - Endocrinología
   - Flujo Geriatría - Geriatría
   - Flujo General - Medicina General
   ```
4. Selecciona el flujo que quieres visualizar
5. El diagrama se actualiza automáticamente

## 💡 Casos de Uso

### Caso 1: Crear Flujo Personalizado para Nueva Especialidad

**Escenario:** Quieres crear un flujo para "Dermatología"

**Pasos:**
1. Configuración → Gestión de Flujos → Crear Nuevo
2. Nombre: "Flujo Dermatología"
3. Agregar pasos:
   - Consulta General ($35)
   - Biopsia de Piel ($85)
   - Consulta Dermatología ($65)
   - Alta ($0)
4. Conectar pasos en orden
5. Guardar

### Caso 2: Modificar Flujo Existente

**Escenario:** El flujo de Cardiología necesita un paso adicional

**Pasos:**
1. Configuración → Gestión de Flujos
2. Buscar "Flujo Estándar de Cardiología"
3. Click en icono de editar ✏️
4. Agregar nuevo paso (ej: "Prueba de Esfuerzo")
5. Conectar en el lugar apropiado
6. Guardar

### Caso 3: Duplicar y Adaptar Flujo

**Escenario:** Crear flujo de "Cardiología Express" basado en el estándar

**Pasos:**
1. Configuración → Gestión de Flujos
2. Buscar "Flujo Estándar de Cardiología"
3. Click en icono de duplicar 📋
4. Se crea "Flujo Estándar de Cardiología (Copia)"
5. Editar la copia:
   - Cambiar nombre a "Cardiología Express"
   - Eliminar pasos no urgentes
   - Ajustar costos
6. Guardar

## 📊 Información en el Diagrama

Cada nodo muestra:
```
┌─────────────────────┐
│  🔬 (Icono)         │
│  Perfil Lipídico    │ ← Nombre
│  15 min             │ ← Duración
│  [$25.50]          │ ← Costo
└─────────────────────┘
```

Colores por tipo:
- 🔵 **Azul**: Consultas
- 🔴 **Rojo**: Laboratorios
- 🟢 **Verde**: Imágenes y Alta
- 🟠 **Naranja**: Referencias

## 🎯 Mejores Prácticas

### 1. Nombrar Flujos Claramente
✅ **Bueno**: "Flujo Cardiología - Evaluación Completa"
❌ **Malo**: "Flujo 1"

### 2. Incluir Descripción Detallada
✅ **Bueno**: "Flujo para evaluación cardiológica completa incluyendo ECG, Echo y laboratorios"
❌ **Malo**: "Flujo cardio"

### 3. Organizar Pasos Lógicamente
✅ **Bueno**: Consulta → Órdenes → Resultados → Tratamiento
❌ **Malo**: Pasos desordenados

### 4. Actualizar Costos Regularmente
- Revisar costos cada trimestre
- Ajustar según inflación
- Verificar con tarifario real

### 5. Documentar Cambios
- Anotar fecha de modificación
- Explicar razón del cambio
- Mantener historial

## 🔍 Buscar y Filtrar Flujos

En la página de Gestión de Flujos puedes:
- Ver todos los flujos en una tabla
- Ordenar por especialidad, costo, duración
- Filtrar por estado (activo/inactivo)
- Buscar por nombre

## 💾 Guardar y Exportar

**Guardar:**
- Click en "Guardar Flujo"
- Se guarda en la base de datos
- Disponible inmediatamente

**Exportar** (próximamente):
- Exportar a JSON
- Importar flujos de otros centros
- Compartir plantillas

## 🚀 Próximas Mejoras

- 📤 **Importar/Exportar** flujos en JSON
- 📊 **Analítica de flujos**: Comparar flujos reales vs diseñados
- 🤖 **Sugerencias automáticas**: ML para optimizar flujos
- 📱 **Templates** por tipo de diagnóstico
- 🔄 **Versionamiento** de flujos

---

## ✨ ¡Ya Puedes Crear Tus Propios Flujos!

Ahora tienes control total sobre los flujos de pacientes:

1. ✅ **Crear** flujos personalizados
2. ✅ **Editar** flujos existentes  
3. ✅ **Duplicar** para variaciones
4. ✅ **Seleccionar** flujos para visualizar
5. ✅ **Calcular** costos automáticamente

**¡Pruébalo ahora en la aplicación!** 🎉










