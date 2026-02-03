
# Plan: Corregir Flujo de Conexión Basecamp

## Resumen del Problema
El usuario reporta una página de error al intentar conectar Basecamp. La configuración en 37signals parece correcta (Redirect URI apunta a la edge function correcta), y la edge function `basecamp-auth` genera URLs válidas.

## Diagnóstico Realizado
1. Los secretos de Basecamp están configurados correctamente (CLIENT_ID, CLIENT_SECRET, etc.)
2. La edge function `basecamp-auth` genera la URL de autorización correctamente
3. No hay logs en `basecamp-callback`, indicando que el error ocurre antes de llegar a nuestra función
4. La URL de autorización es válida y muestra la pantalla de login de Basecamp

## Problema Identificado
Hay una inconsistencia menor en cómo se pasa `returnUrl`:
- El frontend envía `returnUrl` en el **body** de la petición POST
- La edge function lo busca en los **query params** de la URL

Sin embargo, esto no debería causar una página de error en Basecamp, solo afecta a dónde redirigir después.

## Posibles Causas del Error
1. **Problema de CORS en el redirect**: El callback puede estar fallando antes de ejecutarse
2. **Client ID/Secret incorrectos**: Aunque están configurados, podrían no coincidir con los de 37signals
3. **Error después de autorizar**: El token exchange falla y redirige con error

## Plan de Corrección

### Tarea 1: Mejorar lectura de returnUrl en basecamp-auth
- Leer `returnUrl` tanto del body como de query params para mayor flexibilidad

### Tarea 2: Agregar logging más detallado al inicio del callback
- Agregar log inmediatamente al recibir la petición para confirmar que la función se ejecuta
- Loguear todos los parámetros recibidos (code, state, error)

### Tarea 3: Mejorar manejo de errores en callback
- Capturar y loguear errores más específicos del token exchange
- Mostrar mensajes de error más descriptivos al usuario

### Tarea 4: Desplegar y probar
- Desplegar las funciones actualizadas
- Probar el flujo completo

---

## Detalles Técnicos

### Archivo: supabase/functions/basecamp-auth/index.ts
```typescript
// Cambiar de:
const returnUrl = url.searchParams.get("returnUrl") || "/";

// A:
let body: { returnUrl?: string } = {};
try {
  if (req.method === "POST") {
    body = await req.json();
  }
} catch {}
const returnUrl = body.returnUrl || url.searchParams.get("returnUrl") || "/";
```

### Archivo: supabase/functions/basecamp-callback/index.ts
Agregar logging al inicio:
```typescript
serve(async (req) => {
  // Log inmediatamente para confirmar que la función se ejecuta
  logInfo("basecamp_callback_received", {
    method: req.method,
    url: req.url,
  });
  // ... resto del código
```

---

## Información Requerida del Usuario
Para completar el diagnóstico, necesito saber:
1. ¿El error aparece antes o después de autorizar en Basecamp?
2. ¿Cuál es el mensaje de error exacto que ves?
3. ¿Puedes compartir una captura de pantalla del error?
