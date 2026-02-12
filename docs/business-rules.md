# 📋 Reglas de Negocio

## Tipos de Ticket

| Tipo | Prefijo | Descripción | Estado Inicial | SLA |
|------|---------|-------------|----------------|-----|
| **Hot Fix** | `BUG` | Problema crítico que bloquea operación | `today` | ~1 día |
| **Bug Report** | `BUG` | Error que afecta flujo de trabajo | `this_week` | ~7 días |
| **Fixed Scope** | `HU` | Nueva funcionalidad o mejora | `backlog` | Sin SLA |
| **Error** | `ERR` | Información insuficiente para clasificar | `backlog` | N/A |

## Clasificación Automática

El clasificador (`ticketClassifier.ts`) usa lógica basada en keywords:

1. **Validación mínima**: Si `whatIsHappening` o `expectedFlow` tienen <10 chars → tipo `error`
2. **Urgencia explícita**: Si el usuario marca `blocks` → `hot_fix`
3. **Keywords críticos** (≥2 matches o 1 error + 1 crítico): → `hot_fix`
4. **Keywords de error** (≥2 o 1 + urgencia `affects`): → `bug_report`
5. **Keywords de feature** o sin keywords de error: → `fixed_scope`
6. **Fallback**: → `error`

### Agentes asignados

- `user_story_writer` → Fixed Scope (features)
- `problem_solver` → Bug Reports
- `skip` → Hot Fixes y Errors

## Nomenclatura

Formato: `[PREFIJO]-[SEQ_3DÍGITOS]-[MÓDULO]-[DESC_CORTA]`

Ejemplos:
- `HU-001-Payments-Agregar-filtro`
- `BUG-002-Auth-Login-no-func`

## Detección de Módulo

Se detecta automáticamente por keywords en el texto:
- `Auth` → login, sesión, password...
- `Payments` → pago, factura, stripe...
- `Users` → usuario, perfil, cuenta...
- `Reports` → reporte, dashboard, métricas...
- `API` → api, endpoint, webhook...
- `UI` → interfaz, botón, pantalla...
- `Core` → sistema, base, principal...
- `Integration` → salesforce, basecamp, crm...

Si no se detecta, se asigna un módulo aleatorio.

## Flujo de Estados

```
draft → [aprobación admin] → today / this_week / backlog
                                    ↓
                              in_progress → review → production → closed
                              
draft → [rechazo admin] → failed_report
```

## Flujo de Aprobación

1. Usuario crea ticket → se clasifica → entra como `draft`
2. Admin ve el ticket en el **Approval Board**
3. Admin puede:
   - ✅ **Aprobar**: intenta sincronizar con Basecamp → si éxito, pasa a estado correspondiente
   - ❌ **Rechazar**: se marca como `failed_report`
   - ✏️ **Editar**: abre diálogo de edición
   - 🗑️ **Eliminar**: borra el borrador

### Sincronización bloqueante

Si Basecamp falla al aprobar, el ticket **permanece como `draft`** para reintento manual.

## Roles (RBAC)

| Rol | Permisos |
|-----|----------|
| `user` | Crear tickets, ver seguimiento, configuración |
| `admin` | Todo lo anterior + Approval Board + gestión Basecamp |

## Notificaciones (simuladas)

| Evento | Destinatarios |
|--------|--------------|
| Apertura de ticket | team@, support@ |
| Fecha estimada deploy | support@ |
| Completitud (→ production) | team@, requester@ |

## Fechas automáticas

- **Hot Fix**: deploy estimado = hoy + 1 día, follow-up = hoy + 5 días
- **Bug Report**: deploy estimado = hoy + 7 días
