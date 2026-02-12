# ⚡ Edge Functions

## Patrón de Autenticación

Todas las Edge Functions usan `verify_jwt = false` en `config.toml` y validan manualmente el JWT:

```typescript
const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
const { data: { user }, error } = await authClient.auth.getUser(token);
```

Esto es necesario porque Lovable Cloud usa tokens ES256, incompatibles con la verificación automática RS256 del gateway.

## CORS

Todas las funciones usan una lista blanca de orígenes basada en regex:

```typescript
const allowedOriginPatterns = [
  /^https:\/\/imagine-helpdesk\.lovable\.app$/,
  /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
];
```

## Funciones Disponibles

### `basecamp-auth`
- **Método**: POST
- **Propósito**: Genera URL de autorización OAuth para Basecamp
- **Auth**: Requiere JWT válido
- **Body**: `{ returnUrl: string }`

### `basecamp-callback`
- **Método**: GET
- **Propósito**: Recibe callback OAuth, intercambia código por tokens
- **Auth**: No requiere (callback externo)
- **Query params**: `code`, `state`

### `basecamp-sync`
- **Método**: POST
- **Propósito**: Crea Card en Basecamp Card Table
- **Auth**: Requiere JWT válido
- **Body**: `{ nomenclature, description, module, type, formData }`
- **Respuesta**: `{ success, cardId, cardUrl }`

### `microsoft-auth`
- **Método**: POST
- **Propósito**: Genera URL de autorización OAuth para Microsoft
- **Auth**: No requiere

### `microsoft-callback`
- **Método**: GET
- **Propósito**: Recibe callback OAuth de Microsoft
- **Auth**: No requiere (callback externo)
