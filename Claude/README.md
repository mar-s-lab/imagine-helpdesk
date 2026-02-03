# 📊 Basecamp Executive Summary API

Aplicación Full Stack (Frontend + Backend) para integración con Basecamp 4 que permite visualizar resúmenes ejecutivos de proyectos.

## 🎯 Características

- **Resúmenes Ejecutivos**: Vista consolidada del estado de cada proyecto
- **Tablero Kanban**: Visualización de columnas y tarjetas del Card Table
- **Listas de Tareas**: Organización de To-Dos por listas con estados
- **Estadísticas en Tiempo Real**: 
  - Total de tareas
  - Tareas completadas y pendientes
  - Porcentaje de progreso
- **Interfaz Moderna**: UI/UX intuitiva y responsiva

## 📁 Estructura del Proyecto

```
basecamp-integration/
├── backend/               # API Node.js/Express
│   ├── server.js         # Servidor principal
│   ├── package.json      # Dependencias backend
│   └── .env.example      # Variables de entorno ejemplo
│
└── frontend/             # Aplicación React
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js        # Componente principal
    │   ├── App.css       # Estilos
    │   ├── index.js      # Punto de entrada
    │   └── index.css     # Estilos globales
    ├── package.json      # Dependencias frontend
    └── .env.example      # Variables de entorno ejemplo
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 16+ y npm
- Cuenta de Basecamp 4
- Credenciales OAuth 2.0 de Basecamp

### 1. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

En el archivo `.env` configura:

```env
BASECAMP_ACCOUNT_ID=tu_account_id
BASECAMP_ACCESS_TOKEN=tu_access_token
PORT=3001
```

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

El archivo `.env` del frontend debe contener:

```env
REACT_APP_API_URL=http://localhost:3001
```

## 🔑 Obtener Credenciales de Basecamp

### Account ID

1. Inicia sesión en Basecamp
2. La URL tiene el formato: `https://3.basecamp.com/XXXXXXX/projects`
3. El `XXXXXXX` es tu Account ID

### Access Token (OAuth 2.0)

Sigue la [guía de autenticación de Basecamp](https://github.com/basecamp/api/blob/master/sections/authentication.md):

1. Registra tu aplicación en: https://launchpad.37signals.com/integrations
2. Obtén el `Client ID` y `Client Secret`
3. Implementa el flujo OAuth 2.0 para obtener el Access Token

**Flujo simplificado:**

```
1. Redirige al usuario a:
https://launchpad.37signals.com/authorization/new?type=web_server&client_id=TU_CLIENT_ID&redirect_uri=TU_REDIRECT_URI

2. Basecamp redirige de vuelta con un código

3. Intercambia el código por un token:
POST https://launchpad.37signals.com/authorization/token
{
  "type": "web_server",
  "client_id": "TU_CLIENT_ID",
  "redirect_uri": "TU_REDIRECT_URI",
  "client_secret": "TU_CLIENT_SECRET",
  "code": "CODIGO_RECIBIDO"
}

4. Guarda el access_token en tu .env
```

## ▶️ Ejecución

### Iniciar Backend

```bash
cd backend
npm start

# Para desarrollo con auto-reload:
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

### Iniciar Frontend

```bash
cd frontend
npm start
```

La aplicación se abrirá en: `http://localhost:3000`

## 📡 API Endpoints

### Backend API

#### `GET /api/projects`
Obtiene lista de todos los proyectos

**Respuesta:**
```json
[
  {
    "id": 123456,
    "name": "Mi Proyecto",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `GET /api/projects/:projectId`
Obtiene detalles de un proyecto específico

#### `GET /api/projects/:projectId/executive-summary`
Obtiene el resumen ejecutivo completo de un proyecto

**Respuesta:**
```json
{
  "project": {
    "id": 123456,
    "name": "Mi Proyecto",
    "description": "Descripción del proyecto",
    "status": "active"
  },
  "statistics": {
    "total_todos": 50,
    "completed_todos": 30,
    "pending_todos": 20,
    "total_todolists": 5
  },
  "cardTable": {
    "id": 789,
    "title": "Kanban Board",
    "columns": [
      {
        "id": 1,
        "title": "Por Hacer",
        "cards_count": 5,
        "cards": [...]
      }
    ]
  },
  "todos": [
    {
      "list_id": 1,
      "list_name": "Tareas de Desarrollo",
      "todos": [...]
    }
  ]
}
```

## 🎨 Capturas de Pantalla

### Vista Principal
- Lista de proyectos en sidebar
- Resumen ejecutivo con estadísticas
- Tarjetas Kanban organizadas por columnas
- Listas de To-Dos con estados

## 📊 Resumen Ejecutivo - ¿Qué Incluye?

Un **resumen ejecutivo** en esta aplicación es una vista consolidada que incluye:

### 1. Información del Proyecto
- Nombre y descripción
- Fechas de creación y actualización
- Estado del proyecto

### 2. Estadísticas Generales
- **Total de tareas**: Suma de todos los To-Dos
- **Completadas**: Tareas marcadas como completadas
- **Pendientes**: Tareas activas sin completar
- **Progreso**: Porcentaje de completitud

### 3. Card Table (Tablero Kanban)
- **Columnas**: Organización visual del flujo de trabajo
- **Tarjetas por columna**: Con título, asignados y fechas
- **Estado de tarjetas**: Completadas vs pendientes

### 4. Listas de To-Dos
- **Agrupadas por lista**: Organización lógica de tareas
- **Cada To-Do incluye**:
  - Título
  - Estado (completado/pendiente)
  - Asignados
  - Fecha de vencimiento

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **Axios**: Cliente HTTP para consumir Basecamp API
- **CORS**: Manejo de peticiones entre dominios
- **dotenv**: Gestión de variables de entorno

### Frontend
- **React 18**: Biblioteca de UI
- **CSS3**: Estilos modernos con gradientes y animaciones
- **Fetch API**: Comunicación con backend

## 📝 Notas de Desarrollo

### Estructura de To-Dos en Basecamp

Basecamp tiene una jerarquía específica:

```
Proyecto
  └── To-do Set (uno por proyecto)
        ├── To-do List "Lista 1"
        │     ├── To-do Item
        │     └── To-do Item
        └── To-do List "Lista 2"
              └── To-do Item
```

### Limitaciones de la API

- **Rate Limiting**: 50 requests por 10 segundos por IP
- **Paginación**: Usa header `Link` para siguientes páginas
- **OAuth 2.0**: Requerido para autenticación
- **User-Agent**: Header obligatorio

## 🔧 Solución de Problemas

### Error: "400 Bad Request"
- Verifica que incluyas el header `User-Agent` en todas las peticiones

### Error: "401 Unauthorized"
- Verifica tu Access Token
- Asegúrate de que el token no haya expirado

### Error: "404 Not Found"
- Verifica el Account ID
- Confirma que el proyecto existe y tienes acceso

### Error: "429 Too Many Requests"
- Estás excediendo el rate limit
- Implementa exponential backoff en tus peticiones

## 🚀 Mejoras Futuras

- [ ] Implementar autenticación OAuth 2.0 completa
- [ ] Agregar filtros por estado y fecha
- [ ] Exportar resúmenes a PDF
- [ ] Notificaciones en tiempo real
- [ ] Gráficos y visualizaciones avanzadas
- [ ] Comparación entre proyectos
- [ ] Integración con webhooks
- [ ] Caché de datos
- [ ] Tests unitarios y de integración

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Hecho con ❤️ para mejorar la gestión de proyectos en Basecamp**
