# 🏗️ Arquitectura

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado | React hooks (`useState`, `useCallback`) + React Query |
| Routing | React Router v6 |
| Animaciones | Framer Motion |
| Backend | Lovable Cloud (Supabase) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Auth | Email/password, Google OAuth (managed), Microsoft 365 (custom) |

## Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/              # shadcn/ui components
│   ├── ApprovalBoard    # Tablero de aprobación (admin)
│   ├── TicketForm       # Formulario de creación
│   ├── TicketCard       # Card mobile de ticket
│   ├── TrackingTable    # Tabla de seguimiento desktop
│   ├── ClassificationResult  # Resultado de clasificación
│   ├── EditTicketDialog # Diálogo de edición
│   ├── Header           # Navegación principal
│   └── ...
├── contexts/            # React Contexts
│   ├── AuthContext      # Autenticación y roles
│   └── LanguageContext  # Internacionalización
├── hooks/               # Custom hooks
│   └── useTickets       # CRUD de tickets + lógica de negocio
├── lib/                 # Utilidades
│   ├── ticketClassifier # Clasificación automática
│   ├── i18n             # Traducciones
│   └── utils            # Helpers generales
├── pages/               # Páginas/rutas
│   ├── Index            # Vista principal (form/table/approvals)
│   ├── Auth             # Login/Signup
│   ├── Settings         # Configuración y perfil
│   └── NotFound         # 404
├── types/               # TypeScript types
│   └── ticket           # Tipos de ticket, estados, configs
└── integrations/        # Integraciones externas
    ├── supabase/        # Cliente y tipos auto-generados
    └── lovable/         # Auth OAuth (Google)

supabase/
├── functions/           # Edge Functions
│   ├── basecamp-auth/   # Inicio OAuth Basecamp
│   ├── basecamp-callback/ # Callback OAuth Basecamp
│   ├── basecamp-sync/   # Sincronización de tickets → Cards
│   ├── microsoft-auth/  # Inicio OAuth Microsoft
│   └── microsoft-callback/ # Callback OAuth Microsoft
└── config.toml          # Configuración de funciones
```

## Flujo General

```
Usuario → TicketForm → ticketClassifier → useTickets (draft)
                                              ↓
Admin → ApprovalBoard → Aprobar → basecamp-sync → Basecamp Card Table
                       → Rechazar → failed_report
                       → Editar → EditTicketDialog → Re-clasificar
```
