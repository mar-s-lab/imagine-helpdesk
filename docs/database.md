# 🗄️ Base de Datos

## Tablas

### `tickets`

Almacena todos los tickets del sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador único |
| `nomenclature` | text | Código estructurado (ej: `HU-001-Auth-Login`) |
| `module` | text | Módulo detectado |
| `description` | text | Descripción corta |
| `type` | text | `fixed_scope`, `bug_report`, `hot_fix`, `error` |
| `status` | text | Estado actual (default: `draft`) |
| `form_data` | jsonb | Datos completos del formulario |
| `classification` | jsonb | Resultado de clasificación (tipo, confianza, agente) |
| `notes` | text[] | Notas adicionales |
| `created_by` | uuid | Usuario que creó el ticket |
| `desired_date` | timestamptz | Fecha deseada de entrega |
| `estimated_deploy_date` | timestamptz | Fecha estimada de deploy |
| `follow_up_date` | timestamptz | Fecha de seguimiento (hot fixes) |
| `basecamp_synced` | boolean | Si fue sincronizado a Basecamp |
| `basecamp_card_id` | text | ID de la card en Basecamp |
| `basecamp_card_url` | text | URL de la card en Basecamp |
| `sync_attempts` | integer | Intentos de sincronización |
| `last_sync_error` | text | Último error de sync |
| `rejection_reason` | text | Razón de rechazo |

**RLS**: Todos pueden leer. Solo el creador puede insertar. Solo admins pueden actualizar/eliminar.

### `profiles`

Información adicional de usuarios.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador |
| `user_id` | uuid (unique) | Referencia al usuario |
| `email` | text | Email |
| `full_name` | text | Nombre completo |

**RLS**: Usuarios ven/editan su propio perfil. Admins ven todos.

### `user_roles`

Roles del sistema RBAC.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador |
| `user_id` | uuid | Referencia al usuario |
| `role` | app_role (enum) | `admin` o `user` |

**RLS**: Usuarios ven su propio rol. Solo admins pueden CRUD.

### `basecamp_tokens`

Token OAuth del sistema para Basecamp.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | text (PK) | Siempre `system` |
| `access_token` | text | Token de acceso |
| `refresh_token` | text | Token de refresco |
| `expires_at` | timestamptz | Expiración del token |
| `accounts` | jsonb | Cuentas de Basecamp |
| `identity` | jsonb | Identidad del usuario |

**RLS**: Solo admins tienen acceso completo.

### `basecamp_sync_log`

Auditoría de sincronizaciones con Basecamp.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador |
| `ticket_id` | uuid (FK → tickets) | Ticket sincronizado |
| `action` | text | Acción realizada |
| `status` | text | Resultado (success/error) |
| `basecamp_card_id` | text | ID de card creada |
| `basecamp_response` | jsonb | Respuesta de Basecamp |
| `error_message` | text | Mensaje de error |
| `created_by` | uuid | Usuario que ejecutó |

**RLS**: Solo admins pueden leer. Service role puede insertar.

## Enum

- `app_role`: `admin` | `user`

## Funciones de Base de Datos

| Función | Propósito |
|---------|-----------|
| `has_role(user_id, role)` | Verifica si un usuario tiene un rol específico |
| `get_user_role(user_id)` | Obtiene el rol de un usuario |
| `handle_new_user()` | Trigger: crea perfil y asigna rol `user` al registrarse |
| `update_tickets_updated_at()` | Trigger: actualiza `updated_at` automáticamente |
