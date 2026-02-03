# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha la aplicación en menos de 10 minutos.

## ⚡ Pasos Rápidos

### 1. Clonar o Descargar el Proyecto

```bash
# Si tienes el repositorio
git clone <tu-repositorio>
cd basecamp-integration
```

### 2. Configurar Backend (2 minutos)

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `.env` y añade tus credenciales:

```env
BASECAMP_ACCOUNT_ID=1234567890
BASECAMP_ACCESS_TOKEN=BAhbBy...tu_token_aqui
PORT=3001
```

**¿Dónde encuentro estos valores?**

- **ACCOUNT_ID**: En la URL de Basecamp `https://3.basecamp.com/XXXXXXX` → el XXXXXXX
- **ACCESS_TOKEN**: Lo obtienes mediante OAuth 2.0 (ver README principal)

### 3. Configurar Frontend (1 minuto)

```bash
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

El archivo `.env` ya está configurado por defecto:
```env
REACT_APP_API_URL=http://localhost:3001
```

### 4. Ejecutar Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Deberías ver:
```
🚀 Server running on port 3001
📊 Health check: http://localhost:3001/health
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Se abrirá automáticamente en `http://localhost:3000`

### 5. ¡Listo! 🎉

Ahora puedes:
1. Ver la lista de proyectos en el sidebar izquierdo
2. Hacer clic en cualquier proyecto
3. Ver su resumen ejecutivo completo

## 🔍 Verificación Rápida

### ¿Backend funcionando?

Abre en tu navegador: `http://localhost:3001/health`

Deberías ver:
```json
{
  "status": "ok",
  "message": "Basecamp API Integration is running"
}
```

### ¿Frontend conectado?

1. Abre `http://localhost:3000`
2. Deberías ver el encabezado "📊 Basecamp - Resúmenes Ejecutivos"
3. En el sidebar deberían aparecer tus proyectos

## ⚠️ Problemas Comunes

### No veo mis proyectos

**Causa**: Credenciales incorrectas

**Solución**:
1. Verifica el ACCOUNT_ID en `.env`
2. Verifica que el ACCESS_TOKEN sea válido
3. Reinicia el backend: `Ctrl+C` y `npm start`

### Error 401 Unauthorized

**Causa**: Token expirado o inválido

**Solución**: Genera un nuevo Access Token siguiendo la guía OAuth 2.0

### Puerto 3001 ya en uso

**Solución**: 
```bash
# Cambiar puerto en backend/.env
PORT=3002

# Actualizar en frontend/.env
REACT_APP_API_URL=http://localhost:3002
```

### CORS Error

**Causa**: Backend y Frontend no están comunicándose

**Solución**:
1. Asegúrate de que el backend esté corriendo
2. Verifica que `REACT_APP_API_URL` apunte al puerto correcto

## 📊 Próximos Pasos

Una vez que todo funcione:

1. **Explora los resúmenes**: Haz clic en diferentes proyectos
2. **Revisa las estadísticas**: Porcentaje de progreso, tareas completadas
3. **Observa el Kanban**: Si tienes Card Tables configurados
4. **Personaliza**: Modifica colores y estilos en `App.css`

## 💡 Tips

- **Desarrollo**: Usa `npm run dev` en el backend para auto-reload
- **Producción**: Ejecuta `npm run build` en el frontend
- **Debugging**: Abre las DevTools del navegador (F12) para ver errores

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend en la terminal
3. Consulta el README.md principal para más detalles
4. Abre un issue en GitHub

---

**¡Feliz gestión de proyectos! 🎯**
