

# Plan: Arquitectura Multi-Equipo

## Contexto

El sistema actual es single-tenant: un solo grupo de usuarios con roles `admin` y `user`. Para escalar a **varios equipos**, necesitamos introducir el concepto de **Equipo (Team)** como unidad organizativa central, soportando los tres modelos que mencionas.

## Modelo Propuesto

Cada usuario pertenece a uno o mas equipos. Cada equipo tiene sus propios tickets, admins y configuracion. Los tickets se asocian a un equipo y opcionalmente a un responsable individual.

```text
+------------------+       +------------------+       +------------------+
|      teams       |       |   team_members   |       |     profiles     |
+------------------+       +------------------+       +------------------+
| id (PK)          |<------| team_id (FK)     |------>| user_id          |
| name             |       | user_id (FK)     |       | email            |
| slug             |       | role (enum)      |       | full_name        |
| settings (jsonb) |       | joined_at        |       +------------------+
+------------------+       +------------------+
        |
        |  1:N
        v
+------------------+       +---------------------+       +------------------+
|     tickets      |       | ticket_assignments  |       |  time_entries    |
+------------------+       +---------------------+       +------------------+
| id               |<------| ticket_id (FK)      |       | id               |
| team_id (FK) NEW |       | user_id (FK)        |       | ticket_id (FK)   |
| created_by       |       | assigned_at         |       | user_id (FK)     |
| ...              |       | assigned_by         |       | started_at       |
+------------------+       +---------------------+       | ended_at         |
                                                          | duration_minutes |
                                                          +------------------+
```

## Cambios en Base de Datos

### 1. Nuevas tablas

**`teams`** - Equipos del sistema
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid (PK) | Identificador |
| name | text | Nombre del equipo |
| slug | text (unique) | Identificador corto |
| settings | jsonb | Config por equipo (SLAs, integraciones) |
| created_by | uuid | Creador |

**`team_members`** - Membresías con rol por equipo
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid (PK) | Identificador |
| team_id | uuid (FK -> teams) | Equipo |
| user_id | uuid | Usuario |
| role | team_role enum | `owner`, `admin`, `member` |

**`ticket_assignments`** - Responsable de cada ticket
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid (PK) | Identificador |
| ticket_id | uuid (FK -> tickets) | Ticket asignado |
| user_id | uuid | Responsable |
| assigned_by | uuid | Quien asigno |
| assigned_at | timestamptz | Cuando |

**`time_entries`** - Registro de tiempo
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid (PK) | Identificador |
| ticket_id | uuid (FK -> tickets) | Ticket |
| user_id | uuid | Quien trabajo |
| started_at | timestamptz | Inicio |
| ended_at | timestamptz | Fin (null si activo) |
| duration_minutes | integer | Duracion calculada |
| description | text | Nota del trabajo |

**`ticket_history`** - Auditoria automatica via trigger
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid (PK) | Identificador |
| ticket_id | uuid (FK) | Ticket |
| changed_by | uuid | Quien cambio |
| field | text | Campo modificado |
| old_value | text | Valor anterior |
| new_value | text | Valor nuevo |
| changed_at | timestamptz | Cuando |

### 2. Modificaciones a tablas existentes

- **`tickets`**: agregar columna `team_id uuid REFERENCES teams(id)` (nullable al inicio para migrar datos existentes)
- **`app_role` enum**: se mantiene para roles globales. Se crea nuevo enum `team_role` (`owner`, `admin`, `member`) para roles dentro de equipos

### 3. Funciones y triggers

- `is_team_member(user_id, team_id)` - Security definer para verificar membresia
- `is_team_admin(user_id, team_id)` - Security definer para verificar admin de equipo
- Trigger en `tickets` para registrar cambios en `ticket_history`
- Trigger `handle_new_user()` actualizado: crear equipo personal por defecto

### 4. Politicas RLS

- **teams**: miembros pueden ver sus equipos; owners/admins pueden editar
- **team_members**: miembros ven a su equipo; admins del equipo gestionan miembros
- **tickets**: filtrado por `team_id` -- solo miembros del equipo ven sus tickets
- **ticket_assignments**: miembros del equipo pueden ver; admins del equipo pueden asignar
- **time_entries**: cada usuario gestiona las suyas; admins del equipo ven todas
- **ticket_history**: miembros del equipo pueden leer

## Cambios en Frontend

### 5. Contexto de equipo

- Nuevo `TeamContext` con el equipo activo y selector de equipo en el Header
- `useTickets` refactorizado para filtrar por `team_id` y leer/escribir de la base de datos (eliminando el estado en memoria)

### 6. Nuevas vistas

- **Selector de equipo** en el Header (dropdown)
- **Pagina de gestion de equipo** (miembros, roles, configuracion)
- **Panel de asignacion** en el detalle del ticket
- **Timer de trabajo** (iniciar/parar) en tickets asignados
- **Dashboard de metricas por equipo** (tiempo promedio, carga por persona, SLA)

### 7. Flujo actualizado

```text
Usuario crea ticket -> se asocia al equipo activo -> draft
Admin del equipo aprueba -> asigna responsable -> Basecamp sync
Responsable inicia timer -> trabaja -> detiene timer
Admin mueve a review -> production -> closed
```

## Secuencia de Implementacion

Dado que son muchos cambios, se recomienda hacerlo en fases:

1. **Fase 1**: Crear tablas `teams`, `team_members` + migrar datos. Agregar `team_id` a tickets. RLS basico.
2. **Fase 2**: `TeamContext`, selector de equipo en Header, refactorizar `useTickets` para persistir en DB filtrado por equipo.
3. **Fase 3**: `ticket_assignments` + UI de asignacion en el Approval Board y detalle de ticket.
4. **Fase 4**: `time_entries` + timer en UI + `ticket_history` con trigger de auditoria.
5. **Fase 5**: Dashboard de metricas por equipo.

## Seccion Tecnica

- El enum `team_role` es independiente de `app_role` para evitar conflictos. Un usuario puede ser `admin` global y `member` en un equipo especifico.
- Las funciones `is_team_member` e `is_team_admin` son `SECURITY DEFINER` para evitar recursion en RLS.
- El trigger de `handle_new_user()` se modifica para crear un equipo personal "Mi Equipo" automaticamente.
- Los tickets existentes (sin `team_id`) se migraran al equipo del creador o a un equipo por defecto.
- Se mantiene compatibilidad con Basecamp: la configuracion de Basecamp se mueve a `teams.settings` para que cada equipo pueda tener su propio proyecto de Basecamp.

