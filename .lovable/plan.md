
# Plan de Refactorización: Integración Basecamp

## Resumen Ejecutivo

La integración actual con Basecamp funciona, pero tiene varias áreas de mejora en robustez, experiencia de usuario, y mantenibilidad. Este plan propone mejoras incrementales para convertirla en una integración de nivel producción.

---

## Progreso de Implementación

| Fase | Estado | Notas |
|------|--------|-------|
| 1.1 - Crear tabla `tickets` | ✅ Completado | Tabla creada con RLS y triggers |
| 1.2 - Migrar `useTickets` a React Query | ✅ Completado | Hook refactorizado |
| 2.1 - Estados de sincronización en UI | ✅ Completado | Spinner, overlay durante sync |
| 2.2 - Retry button para errores | ✅ Completado | Botón "Reintentar" visible |
| 2.3 - Link a card de Basecamp | ✅ Completado | Link en preview dialog |
| 3 - Refactorización edge functions | 🔲 Pendiente | Extraer CORS compartido |
| 4 - Funcionalidades adicionales | 🔲 Pendiente | Logs, desconectar |

---

## Análisis del Estado Actual

### Lo que funciona bien
- OAuth flow implementado correctamente con estado CSRF
- Token refresh automático en edge function
- RLS policies restringen acceso a admins
- Manejo de rate limiting de Basecamp
- Validación de JWT manual (compatible con Lovable Cloud)
- CORS headers restrictivos con whitelist
- **✅ Persistencia de tickets en DB (Fase 1 completada)**
- **✅ Tracking de cardId y cardUrl de Basecamp**

### Problemas Identificados

| Problema | Impacto | Prioridad |
|----------|---------|-----------|
| Sin persistencia de tickets en DB | Los tickets se pierden al refrescar | Alta |
| Sin tracking de cardId de Basecamp | No se puede vincular ticket local con card | Alta |
| Código CORS duplicado en 3 funciones | Mantenimiento difícil | Media |
| Sin retry automático de sync | Requiere acción manual del usuario | Media |
| Sin indicador de sync en progreso | UX confusa durante sincronización | Media |
| Sin desconexión de Basecamp | No hay forma de revocar acceso | Baja |
| Sin logs de sincronización | Difícil debugging | Baja |

---

## Cambios Propuestos

### Fase 1: Persistencia y Tracking (Alta Prioridad)

**1.1 Crear tabla `tickets` en la base de datos**

Persistir tickets localmente permitirá:
- Mantener historial entre sesiones
- Trackear estado de sincronización
- Vincular `basecampCardId` con ticket local

```text
+------------------+
|     tickets      |
+------------------+
| id (uuid, PK)    |
| nomenclature     |
| module           |
| description      |
| type             |
| status           |
| form_data (json) |
| classification   |
| basecamp_card_id |<-- Vinculo con Basecamp
| basecamp_synced  |
| sync_attempts    |<-- Para retry logic
| last_sync_error  |
| created_by       |
| created_at       |
| updated_at       |
+------------------+
```

**1.2 Actualizar hook `useTickets`**

Migrar de estado local (`useState`) a queries con React Query + Supabase, manteniendo la misma API pública del hook.

---

### Fase 2: Mejorar Experiencia de Sincronización (Media Prioridad)

**2.1 Estado de sincronización en ApprovalBoard**

Agregar estados visuales:
- "Enviando a Basecamp..." con spinner
- "Error al sincronizar" con botón de reintentar
- "Sincronizado" con link a la card

**2.2 Retry automático con backoff exponencial**

Implementar cola de reintentos para tickets que fallaron:
- 1er intento: inmediato
- 2do intento: 30 segundos
- 3er intento: 2 minutos
- Después: manual

**2.3 Guardar `cardId` y `cardUrl` de Basecamp**

Cuando sync exitoso, almacenar en el ticket para:
- Mostrar link directo a Basecamp
- Evitar duplicados si se reintenta

---

### Fase 3: Refactorización de Edge Functions (Media Prioridad)

**3.1 Extraer utilidades compartidas**

Crear archivo `_shared/cors.ts` con:
```typescript
// supabase/functions/_shared/cors.ts
export const allowedOriginPatterns = [...];
export function getCorsHeaders(origin: string | null): Record<string, string>;
export function getFrontendUrl(origin: string | null): string;
```

**3.2 Mejorar logging estructurado**

Agregar contexto a todos los logs:
```typescript
console.log(JSON.stringify({
  action: 'basecamp_sync',
  ticketId: body.nomenclature,
  userId: user.id,
  status: 'success',
  cardId: cardData.id,
}));
```

---

### Fase 4: Funcionalidades Adicionales (Baja Prioridad)

**4.1 Tabla de logs de sincronización**

```text
+----------------------+
|   basecamp_sync_log  |
+----------------------+
| id                   |
| ticket_id            |
| action (create/update)|
| status (success/fail)|
| error_message        |
| basecamp_response    |
| created_at           |
+----------------------+
```

**4.2 Opción de desconectar Basecamp**

En Settings, agregar botón "Desconectar" que:
- Elimina token de la base de datos
- Muestra confirmación
- Actualiza estado visual

**4.3 Sincronización bidireccional (futuro)**

Webhook de Basecamp para actualizar status cuando card se mueve.

---

## Implementación Paso a Paso

### Paso 1: Migración de base de datos
Crear tabla `tickets` con RLS policies apropiadas

### Paso 2: Actualizar `useTickets` hook
- Mantener API pública idéntica
- Usar React Query para fetching
- Agregar mutaciones para CRUD

### Paso 3: Actualizar `basecamp-sync`
- Retornar `cardId` y `cardUrl`
- Guardar en tabla `tickets`

### Paso 4: Mejorar UI de ApprovalBoard
- Estados de carga durante sync
- Botón de reintentar
- Link a card de Basecamp

### Paso 5: Extraer utilidades compartidas
- Archivo `_shared/cors.ts`
- Logging estructurado

### Paso 6: Agregar tabla de logs (opcional)
- Historial de sincronizaciones
- Debugging facilitado

---

## Sección Tecnica

### Cambios en Base de Datos

```sql
-- Nueva tabla de tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomenclature TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed_scope', 'bug_report', 'hot_fix', 'error')),
  status TEXT NOT NULL DEFAULT 'draft',
  form_data JSONB NOT NULL,
  classification JSONB NOT NULL,
  notes TEXT[] DEFAULT '{}',
  desired_date TIMESTAMP WITH TIME ZONE,
  estimated_deploy_date TIMESTAMP WITH TIME ZONE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  basecamp_card_id TEXT,
  basecamp_card_url TEXT,
  basecamp_synced BOOLEAN DEFAULT FALSE,
  sync_attempts INTEGER DEFAULT 0,
  last_sync_error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Users can see all tickets, only create their own
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tickets" ON public.tickets
  FOR SELECT USING (true);

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

### Estructura de archivos modificados

```text
supabase/functions/
  _shared/
    cors.ts          <-- NUEVO: Utilidades compartidas
  basecamp-auth/
    index.ts         <-- Importar de _shared
  basecamp-callback/
    index.ts         <-- Importar de _shared
  basecamp-sync/
    index.ts         <-- Retornar cardId, logging mejorado

src/hooks/
  useTickets.ts      <-- Migrar a React Query + Supabase

src/components/
  ApprovalBoard.tsx  <-- Estados de sync, retry button
  
src/pages/
  Settings.tsx       <-- Botón desconectar (opcional)
```

---

## Estimación de Esfuerzo

| Fase | Descripción | Complejidad |
|------|-------------|-------------|
| 1 | Persistencia en DB | Alta |
| 2 | UX de sincronización | Media |
| 3 | Refactorización edge functions | Baja |
| 4 | Funcionalidades adicionales | Baja |

---

## Recomendación

Comenzar con **Fase 1** (persistencia) ya que es el cambio de mayor impacto - sin esto, los tickets se pierden al refrescar la página, lo cual es un problema crítico para una aplicación de producción.

