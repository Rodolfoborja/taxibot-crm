# 🚕 TaxiBot CRM - Sistema de Gestión PMA

Sistema de administración para gestión de operadores PMA del sistema TaxiBot WhatsApp.

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Autenticación**: NextAuth.js
- **Deployment**: Docker + Dokploy

## 📦 Instalación

### Pre-requisitos

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### 1. Clonar repositorio

```bash
git clone <repo-url>
cd taxibot-crm
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taxibot_crm"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="tu_secret_aleatorio_aqui"
```

### 4. Iniciar base de datos (desarrollo local)

```bash
docker-compose up -d postgres redis
```

### 5. Ejecutar migraciones

```bash
npx prisma migrate dev
```

### 6. (Opcional) Seed datos de prueba

```bash
npx prisma db seed
```

### 7. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🐳 Deploy con Docker

### Desarrollo completo (PostgreSQL + Redis + App)

```bash
docker-compose up -d
```

### Producción (solo app)

```bash
docker build -t taxibot-crm .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  taxibot-crm
```

## 🚀 Deploy en Dokploy

### 1. Crear proyecto en Dokploy

1. Acceder a tu panel Dokploy
2. Crear nuevo proyecto: `taxibot-crm`
3. Agregar servicio tipo "Application"

### 2. Configurar servicios

**PostgreSQL:**
- Tipo: Postgres 16
- Nombre: `taxibot-postgres`
- Usuario: `taxibot`
- Contraseña: `[generar segura]`
- Base de datos: `taxibot_crm`

**Redis:**
- Tipo: Redis 7
- Nombre: `taxibot-redis`

**Aplicación:**
- Tipo: Application (Docker)
- Repositorio: [tu-repo-git]
- Branch: `main`
- Dockerfile: `./Dockerfile`
- Puerto: `3000`

### 3. Variables de entorno en Dokploy

```env
DATABASE_URL=postgresql://taxibot:[PASSWORD]@taxibot-postgres:5432/taxibot_crm
REDIS_URL=redis://taxibot-redis:6379
NEXTAUTH_URL=https://crm.tudominio.com
NEXTAUTH_SECRET=[generar-con-openssl-rand-base64-32]
NODE_ENV=production
```

### 4. Deploy

```bash
git push origin main
```

Dokploy detectará el push y ejecutará el build automáticamente.

## 📊 Estructura del Proyecto

```
taxibot-crm/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── src/
│   ├── app/
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Rutas del dashboard
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── conductores/   # Gestión conductores
│   │   │   ├── carreras/      # Monitor carreras
│   │   │   ├── incidentes/    # Incidentes
│   │   │   ├── pagos/         # Pagos
│   │   │   └── usuarios/      # Usuarios
│   │   ├── api/               # API Routes
│   │   │   ├── stats/         # Estadísticas
│   │   │   ├── conductores/   # CRUD conductores
│   │   │   ├── carreras/      # CRUD carreras
│   │   │   └── webhook/       # PMA Utils Webhook
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Componentes shadcn
│   │   ├── dashboard/         # Componentes dashboard
│   │   └── shared/            # Componentes compartidos
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── redis.ts           # Cliente Redis
│   │   └── utils.ts           # Utilidades
│   └── types/
│       └── index.ts           # TypeScript types
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## 🔐 Seguridad

### Autenticación

El sistema usa NextAuth.js con JWT. Configurar en `.env`:

```env
NEXTAUTH_SECRET="[generar con: openssl rand -base64 32]"
```

### Roles PMA

- `ADMIN`: Acceso completo
- `SOPORTE`: Gestión de incidentes y emergencias
- `REVISOR`: Aprobación de conductores

### API Keys

Las API keys para Jelou, Deuna y WhatsApp deben estar en `.env` y **nunca** en el código fuente.

## 📱 Funcionalidades PMA

### Dashboard Principal
- Estadísticas en tiempo real (actualización cada 60s)
- Alertas de emergencias activas
- Métricas: carreras, ingresos, conductores, incidentes

### Gestión de Conductores
- Revisar documentos pendientes
- Aprobar/rechazar conductores
- Bloquear/suspender por sanciones
- Ver ubicación en tiempo real

### Monitor de Carreras
- Ver carreras activas en mapa
- Seguimiento de estado
- Historial completo

### Incidentes y Emergencias
- Prioridad alta para emergencias
- Tracking GPS de conductor
- Resolución con comentarios
- Escalamiento automático

### Gestión de Pagos
- Ver pagos pendientes
- Ejecutar reembolsos
- Historial de transacciones

### Webhook PMA Utils
Endpoint: `POST /api/pma/ejecutar-accion`

```bash
curl -X POST https://crm.tudominio.com/api/pma/ejecutar-accion \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "accion": "bloquear_conductor",
    "conductorId": "conductor_123",
    "motivo": "Denuncia grave"
  }'
```

Acciones disponibles:
- `reembolsar`
- `bloquear_conductor`
- `desbloquear_usuario`
- `cancelar_carrera_forzada`
- `consultar_gps`

## 🛠️ Comandos útiles

```bash
# Desarrollo
npm run dev                    # Iniciar dev server
npm run build                  # Build producción
npm start                      # Iniciar producción

# Prisma
npx prisma studio             # Abrir Prisma Studio (GUI)
npx prisma migrate dev        # Crear migración
npx prisma migrate deploy     # Aplicar migraciones (prod)
npx prisma generate           # Generar Prisma Client

# Docker
docker-compose up -d          # Iniciar servicios
docker-compose down           # Detener servicios
docker-compose logs -f crm    # Ver logs
```

## 📈 Monitoreo

### Logs

Los logs se almacenan en la tabla `LogAuditoria` para auditoría completa.

### Redis Cache

- `dashboard:stats`: TTL 60s
- `conductor:ubicacion:{id}`: TTL 120s
- `carrera:activa:{id}`: TTL 300s

### Prisma Queries

En desarrollo, Prisma logea todas las queries. Configurar en `src/lib/prisma.ts`:

```typescript
log: ['query', 'error', 'warn']
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"

Verificar que PostgreSQL está corriendo:

```bash
docker-compose ps postgres
```

### Error: "Redis connection refused"

Verificar Redis:

```bash
docker-compose ps redis
redis-cli ping  # Debe responder PONG
```

### Migraciones pendientes

```bash
npx prisma migrate deploy
```

## 📞 Soporte

- GitHub Issues: [repo/issues]
- Documentación: [docs]
- Contacto: rodolfoborja25@gmail.com

## 📄 Licencia

Propietario - Rodolfo Borja © 2026

---

**Creado con ❤️ por Kiki 🦉**
