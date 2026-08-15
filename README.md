# BudgetCraft - Aplicación de Gestión Financiera Personal

**BudgetCraft** es una aplicación web full-stack diseñada para gestionar finanzas personales de forma inteligente. Permite registrar ingresos y gastos, visualizar métricas clave en un dashboard interactivo y consultar un asistente de inteligencia artificial que analiza tus hábitos financieros para ofrecerte recomendaciones personalizadas.

## Tecnologías

### Backend
- Node.js + Express.js
- PostgreSQL
- JWT + Bcrypt para autenticación segura
- Google Gemini AI (`@google/genai`) para el asistente inteligente
- Arquitectura REST por dominios

### Frontend
- React 19 + TypeScript
- Vite como bundler
- Tailwind CSS v4
- Axios con interceptor JWT
- Lucide React para iconografía

## Características principales

- **Autenticación segura**: registro, login y gestión de sesión con JWT
- **Dashboard financiero**: balance, ingresos, gastos, tasa de ahorro y distribución por categoría
- **Transacciones**: creación, listado y eliminación de movimientos
- **Asistente IA**: chat con contexto financiero real del usuario
- **Filtros y búsqueda**: filtrado por tipo y búsqueda por descripción/categoría
- **Diseño responsive**: interfaz moderna con glassmorphism, sidebar adaptable y gráficos CSS
- **Validaciones**: manejo de errores y formularios controlados

## Arquitectura

```
budgetcraft/
├── budgetcraft-backend/   # API REST con Express
│   └── src/
│       ├── config/        # Pool de conexiones a PostgreSQL
│       ├── middlewares/    # Verificación de JWT
│       ├── controllers/   # Lógica de negocio por dominio
│       └── routes/        # Endpoints organizados
└── budgetcraft-frontend/  # SPA con React + TypeScript
    └── src/
        ├── api/           # Cliente HTTP centralizado
        ├── context/       # Estado global de autenticación
        ├── pages/         # Vistas principales
        └── components/    # Componentes reutilizables
```

## Base de datos

Esquema principal:
- `usuarios`: id, nombre, email, password_hash
- `categorias`: id, nombre, tipo, icono
- `transacciones`: id, usuario_id, categoria_id, monto, descripcion, tipo, fecha
- `chat_mensajes`: id, usuario_id, rol, contenido

## Ejecución local

```bash
# Backend
cd budgetcraft-backend
npm install
cp .env.example .env   # Configurar DATABASE_URL y GEMINI_API_KEY
npm run dev            # Puerto 3000

# Frontend
cd budgetcraft-frontend
npm install
npm run dev            # Puerto 5173
```

## Estado del proyecto

En desarrollo activo. Funcionalidad core completada: autenticación, transacciones, dashboard, chat IA y rediseño UI/UX.

## Autor

Desarrollado como proyecto personal de gestión financiera con integración de inteligencia artificial.
