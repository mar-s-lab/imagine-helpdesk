# 🔗 Integraciones

## Basecamp 3

### Descripción
Sincronización de tickets aprobados como Cards en un Card Table (Kanban) de Basecamp.

### Flujo OAuth
1. Admin hace clic en "Conectar con Basecamp" en Settings
2. Edge Function `basecamp-auth` genera URL de autorización
3. Usuario autoriza en Basecamp
4. `basecamp-callback` recibe el código, intercambia por tokens
5. Tokens se guardan en `basecamp_tokens` (id = `system`)

### Sincronización de Tickets
- Al aprobar un ticket, se invoca `basecamp-sync`
- Crea una Card en el Card Table con:
  - **Title**: nomenclatura del ticket
  - **Content**: necesidad, flujo deseado, contexto, módulo, tipo
- Si falla, el ticket queda en `draft` para reintento

### Variables de Entorno Requeridas
| Variable | Descripción |
|----------|-------------|
| `BASECAMP_CLIENT_ID` | Client ID de la app OAuth |
| `BASECAMP_CLIENT_SECRET` | Client Secret |
| `BASECAMP_ACCOUNT_ID` | ID de la cuenta de Basecamp |
| `BASECAMP_PROJECT_ID` | ID del proyecto (bucket) |
| `BASECAMP_COLUMN_ID` | ID de la columna del Card Table |

### API Endpoint
```
POST https://3.basecampapi.com/{account_id}/buckets/{project_id}/card_tables/lists/{column_id}/cards.json
```

---

## Microsoft 365

### Descripción
Login con cuentas de Microsoft vía OAuth 2.0 y Microsoft Graph.

### Flujo
1. `microsoft-auth` redirige a Microsoft login
2. `microsoft-callback` intercambia código por token
3. Se obtiene perfil del usuario vía Microsoft Graph
4. Se crea/actualiza sesión en Supabase Auth

### Variables de Entorno
| Variable | Descripción |
|----------|-------------|
| `MICROSOFT_CLIENT_ID` | App registration client ID |
| `MICROSOFT_CLIENT_SECRET` | Client Secret |
| `MICROSOFT_TENANT_ID` | Tenant ID (o `common`) |

---

## Google OAuth

### Descripción
Login con Google gestionado automáticamente por Lovable Cloud.

### Implementación
```typescript
import { lovable } from "@/integrations/lovable/index";

const { error } = await lovable.auth.signInWithOAuth("google", {
  redirect_uri: window.location.origin,
});
```

No requiere configuración adicional de credenciales.
