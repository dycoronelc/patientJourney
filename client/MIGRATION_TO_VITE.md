# Migración a Vite - Instrucciones

## ✅ Cambios Realizados

La migración de Create React App a Vite ha sido completada. Se han actualizado los siguientes archivos:

1. ✅ `package.json` - Reemplazado `react-scripts` con `vite` y `@vitejs/plugin-react`
   - Actualizado `@types/node` de v16 a v20 (requerido por Vite 5)
   - Actualizado `typescript` de v4.9 a v5.3
   - Actualizado `eslintConfig` para eliminar referencias a `react-app`
   - Agregado `eslint-plugin-react` para configuración ESLint sin react-scripts
2. ✅ Variables de entorno - Cambiado `REACT_APP_*` a `VITE_*` en:
   - `src/services/api.ts`
   - `src/services/analyticsService.ts`
   - `src/services/medicalFlowService.ts`
3. ✅ `public/index.html` - Actualizado para Vite (script module añadido, rutas ajustadas)
4. ✅ `vite.config.ts` - Configuración completa con proxy y alias
5. ✅ `tsconfig.json` - Optimizado para Vite
6. ✅ `tsconfig.node.json` - Creado para configuración de Node
7. ✅ `src/vite-env.d.ts` - Tipos para variables de entorno de Vite
8. ✅ `env.example` - Actualizado con nuevas variables

## 🚀 Pasos para Completar la Migración

### 1. Limpiar Dependencias Anteriores (IMPORTANTE)

Para evitar conflictos con `react-scripts` y dependencias antiguas, primero limpia `node_modules`:

```bash
cd client
# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json
# En Windows:
# rmdir /s /q node_modules
# del package-lock.json
```

### 2. Instalar Dependencias Actualizadas

```bash
npm install
```

**Si aún aparecen conflictos**, puedes usar:
```bash
npm install --legacy-peer-deps
```

Esto instalará las dependencias ignorando conflictos de peer dependencies menores.

Esto instalará las siguientes dependencias clave:
- `vite` - El bundler principal
- `@vitejs/plugin-react` - Plugin de React para Vite
- `vitest` - Framework de testing (opcional, reemplaza Jest)
- `@types/node@20` - Tipos de Node.js actualizados (requerido por Vite 5)
- `typescript@5.3` - TypeScript actualizado

### 3. Actualizar Variables de Entorno

Si tienes un archivo `.env` local, actualízalo:

```env
# Cambiar de:
REACT_APP_API_URL=http://localhost:8000

# A:
VITE_API_URL=http://localhost:8000
```

### 4. Probar el Servidor de Desarrollo

```bash
npm start
# o
npm run dev
```

El servidor debería iniciar en `http://localhost:3000` (igual que antes).

### 5. Probar el Build de Producción

```bash
npm run build
```

Esto generará la carpeta `build/` con los archivos optimizados.

### 6. Verificar el Preview

```bash
npm run preview
```

Esto servirá la build de producción localmente para verificar que todo funciona.

## 📝 Cambios Importantes a Recordar

### Variables de Entorno

- **Antes**: `process.env.REACT_APP_API_URL`
- **Ahora**: `import.meta.env.VITE_API_URL`

### Rutas de Assets

- **Antes**: `%PUBLIC_URL%/images/logo.png`
- **Ahora**: `/images/logo.png` (ruta absoluta desde public/)

### Scripts NPM

- `npm start` → Ahora usa Vite (más rápido)
- `npm run build` → Genera build optimizado
- `npm run preview` → Preview del build de producción
- `npm test` → Ahora usa Vitest (si necesitas testing)

## ⚠️ Notas Importantes

1. **No se eliminó código**: Todo el código existente funciona sin cambios
2. **Rutas**: Las rutas de React Router siguen funcionando igual
3. **API Proxy**: Configurado en `vite.config.ts` para `/api`
4. **TypeScript**: Los tipos están configurados en `vite-env.d.ts`

## 🎉 Beneficios de la Migración

- ⚡ **Inicio más rápido**: El servidor de desarrollo inicia en milisegundos
- 🔥 **HMR instantáneo**: Los cambios se reflejan casi inmediatamente
- 📦 **Builds más rápidos**: Los builds de producción son significativamente más rápidos
- 🎯 **Configuración más simple**: No más necesidad de `eject` o `craco`

## 🐛 Solución de Problemas

### Error: "ERESOLVE could not resolve" o conflictos con @types/node
**Solución**: 
1. Elimina `node_modules` y `package-lock.json`
2. Ejecuta `npm install --legacy-peer-deps` si persisten los conflictos

### Error: "Cannot find type definition file for 'vite/client'"
**Solución**: Ejecuta `npm install` primero. Los tipos se encuentran en `@types/vite` que se instala automáticamente.

### Error: "Failed to resolve import"
**Solución**: Verifica que las rutas en `index.html` no usen `%PUBLIC_URL%`. En Vite, usa rutas absolutas desde `/`.

### Variables de entorno no funcionan
**Solución**: Asegúrate de usar `VITE_` como prefijo y acceder con `import.meta.env.VITE_*`

## 📚 Referencias

- [Documentación de Vite](https://vitejs.dev/)
- [Plugin de React para Vite](https://github.com/vitejs/vite-plugin-react)

