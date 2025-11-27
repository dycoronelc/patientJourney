# 🧪 Cómo Probar el Sistema de Flujos y Costos

## ✅ Problemas Solucionados

1. ✅ **Selector de flujos ahora funciona** - Cambia entre flujos dinámicamente
2. ✅ **Editor muestra nodos al editar** - Ya no aparece en blanco

## 🔍 Cómo Probar Cada Funcionalidad

### 1. **Cambiar Entre Flujos** (SOLUCIONADO)

#### Pasos:
1. Ve a http://localhost:3000
2. Click en **"Flujos y Costos"** (menú lateral)
3. En el dropdown **"Seleccionar Flujo"**, elige una opción:
   - Flujo Cardiología
   - Flujo Endocrinología
   - Flujo Geriatría
   - Flujo General

#### ✅ Qué Deberías Ver:
- El diagrama **cambia automáticamente**
- Los **nodos cambian** de posición y contenido
- Los **costos totales** se actualizan
- Las **conexiones** se reconfiguran

#### Diferencias Entre Flujos:

**Cardiología** (5 pasos - $302.50):
```
Consulta → Labs + Imágenes → Cardiología → Alta
```

**Endocrinología** (4 pasos - $160.50):
```
Consulta → Estudios Hormonales → Endocrinología → Alta
```

**Geriatría** (5 pasos - $425.00):
```
Consulta → Perfil Metabólico + Densitometría → Referencias → Alta
```

**General** (3 pasos - $65.00):
```
Consulta → Exámenes → Alta
```

---

### 2. **Editar un Flujo** (SOLUCIONADO)

#### Pasos:
1. Ve a **"Configuración"** (menú lateral)
2. Click en tab **"Gestión de Flujos"**
3. Busca "Flujo Estándar de Cardiología"
4. Click en el icono de **editar** (✏️)

#### ✅ Qué Deberías Ver:
- Se abre un **dialog grande**
- Panel izquierdo con **herramientas**
- Panel derecho con **lienzo de diseño**
- **Al menos 1 nodo** visible (Consulta General)
- Nombre y descripción del flujo **precargados**

#### Qué Puedes Hacer:
- ➕ **Agregar más nodos** desde el panel izquierdo
- ✏️ **Editar nodos** (doble click)
- 🔗 **Conectar nodos** arrastrando
- 💾 **Guardar cambios**

---

### 3. **Crear Flujo Nuevo**

#### Pasos:
1. **Configuración** → **Gestión de Flujos**
2. Click en **"Crear Nuevo Flujo"**

#### ✅ Qué Deberías Ver:
- Dialog con editor **vacío** (correcto para nuevo flujo)
- Panel izquierdo con botones de pasos
- Campos de nombre y descripción **vacíos**

#### Ejercicio Práctico:
1. Ingresa nombre: "Mi Flujo Personalizado"
2. Ingresa descripción: "Flujo de prueba"
3. Click en **"Consulta"** en el panel izquierdo
4. Click en **"Laboratorio"**
5. Arrastra desde el nodo Consulta al nodo Laboratorio
6. Click en **"Guardar Flujo"**
7. ✅ Debería aparecer en la tabla

---

### 4. **Duplicar un Flujo**

#### Pasos:
1. **Configuración** → **Gestión de Flujos**
2. Busca cualquier flujo
3. Click en icono de **duplicar** (📋)

#### ✅ Qué Deberías Ver:
- Mensaje: "Flujo duplicado"
- Nuevo flujo en la tabla con nombre "(Copia)"
- **Mismo número de pasos** que el original

---

### 5. **Análisis de Costos**

#### Pasos:
1. **Flujos y Costos** → Tab **"Análisis de Costos"**

#### ✅ Qué Deberías Ver:
- 4 tarjetas de métricas:
  - Costo Total: $125,000
  - Costo Promedio: $450.75
  - Cobertura Seguro: 78%
  - Responsabilidad Paciente: 22%
- Gráfico circular de distribución
- Gráfico de barras por especialidad
- Gráfico de líneas de tendencias
- Tabla con top items

---

### 6. **Calculadora de Costos**

#### Pasos:
1. **Flujos y Costos** → Tab **"Calculadora de Costos"**
2. Selecciona "Consulta General" en el dropdown
3. Click en **"Agregar Item"**
4. Selecciona "Perfil Lipídico"
5. Click en **"Agregar Item"**

#### ✅ Qué Deberías Ver:
- Items agregados en la tabla
- Cálculo automático:
  - Subtotal: $60.50
  - Seguro (78%): $47.19
  - Paciente (22%): $13.31
- Totales actualizados en tiempo real

---

## 🎨 Interactividad del Diagrama

### Controles Disponibles:
- **🔍 Zoom**: Usa la rueda del mouse
- **👆 Pan**: Arrastra el lienzo
- **🔗 Conectar**: Arrastra desde el borde de un nodo
- **✏️ Editar**: Doble click en un nodo
- **📍 Centrar**: Click en botón "Fit View"

### Mini Mapa:
- Esquina inferior derecha
- Muestra vista general del flujo
- Click para navegar rápido

---

## 🐛 Verificación de Problemas

### ✅ Checklist de Funcionalidad:

- [ ] El selector de flujos cambia el diagrama
- [ ] Al editar un flujo, se ven nodos
- [ ] Puedo agregar nodos nuevos
- [ ] Puedo conectar nodos
- [ ] Los costos se calculan correctamente
- [ ] Los gráficos se muestran
- [ ] La calculadora suma correctamente

### Si Algo No Funciona:

**Selector no cambia:**
- Refrescar la página (F5)
- Verificar consola de navegador (F12)

**Editor aparece vacío:**
- Ya está solucionado ✅
- Debería mostrar al menos 1 nodo

**No puedo agregar nodos:**
- Verificar que no esté en modo readOnly
- Click directo en los botones del panel izquierdo

---

## 📊 Datos de Prueba

### Flujos Disponibles:
1. **Cardiología**: 5 pasos, $302.50
2. **Endocrinología**: 4 pasos, $160.50
3. **Geriatría**: 5 pasos, $425.00
4. **General**: 3 pasos, $65.00

### Items de Costo:
- 3 tipos de consultas
- 3 tipos de laboratorios
- 3 tipos de imágenes

---

## 🎯 Ejercicio Completo de Prueba

### Escenario: Crear y Usar un Flujo Personalizado

1. **Crear Flujo**:
   - Configuración → Gestión de Flujos → Crear Nuevo
   - Nombre: "Flujo Express"
   - Agregar: Consulta → Lab → Alta
   - Guardar

2. **Ver en Configuración**:
   - Verificar que aparece en la tabla
   - Ver detalles (pasos, costo, duración)

3. **Duplicar**:
   - Click en duplicar
   - Ver copia en la tabla

4. **Editar**:
   - Click en editar
   - Agregar un paso más
   - Guardar

5. **Calcular Costos**:
   - Ir a Calculadora
   - Agregar los mismos servicios del flujo
   - Verificar que coincida el total

---

## ✨ ¡Todo Debería Funcionar Perfectamente!

Las dos mejoras implementadas:

1. ✅ **Cambio dinámico** de flujos con el selector
2. ✅ **Editor con datos** al editar flujos existentes

**¡Prueba las funcionalidades y me cuentas cómo funciona!** 🚀










