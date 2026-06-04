# 📝 TODO - Próximos Pasos

## ✅ Completado

- [x] Estructura del proyecto
- [x] Configuración Docker + Docker Compose
- [x] Esquema Prisma completo (PostgreSQL)
- [x] Cliente Redis con funciones helper
- [x] API endpoint: GET /api/stats (dashboard)
- [x] Página principal del dashboard
- [x] Documentación README.md
- [x] Guía de deploy Dokploy
- [x] Configuración Tailwind + PostCSS
- [x] TypeScript types

## 🚧 En Progreso / Pendiente

### 1. Autenticación (Prioridad Alta)

- [ ] Configurar NextAuth.js
- [ ] Página de login (`src/app/(auth)/login/page.tsx`)
- [ ] Middleware de autenticación
- [ ] Roles: ADMIN, SOPORTE, REVISOR
- [ ] Seed inicial de usuario admin

**Archivos a crear:**
```
src/app/api/auth/[...nextauth]/route.ts
src/app/(auth)/login/page.tsx
src/middleware.ts
```

### 2. Gestión de Conductores (Prioridad Alta)

- [ ] API: GET /api/conductores (lista)
- [ ] API: GET /api/conductores/[id] (detalle)
- [ ] API: PUT /api/conductores/[id]/aprobar
- [ ] API: PUT /api/conductores/[id]/rechazar
- [ ] API: PUT /api/conductores/[id]/bloquear
- [ ] Página: `src/app/(dashboard)/conductores/page.tsx`
- [ ] Componente: Tabla de conductores
- [ ] Componente: Modal de revisión de documentos

### 3. Monitor de Carreras (Prioridad Alta)

- [ ] API: GET /api/carreras (lista con filtros)
- [ ] API: GET /api/carreras/[id] (detalle)
- [ ] API: WebSocket para actualización en tiempo real
- [ ] Página: `src/app/(dashboard)/carreras/page.tsx`
- [ ] Componente: Mapa con carreras activas (Google Maps o Mapbox)
- [ ] Componente: Lista de carreras

### 4. Gestión de Incidentes (Prioridad Alta)

- [ ] API: GET /api/incidentes
- [ ] API: GET /api/incidentes/[id]
- [ ] API: PUT /api/incidentes/[id]/resolver
- [ ] API: GET /api/incidentes/emergencias (filtro)
- [ ] Página: `src/app/(dashboard)/incidentes/page.tsx`
- [ ] Componente: Lista de incidentes con prioridad
- [ ] Notificaciones push para emergencias

### 5. Gestión de Pagos (Prioridad Media)

- [ ] API: GET /api/pagos
- [ ] API: POST /api/pagos/reembolsar
- [ ] API: Webhook Deuna: `/api/webhook/deuna`
- [ ] Página: `src/app/(dashboard)/pagos/page.tsx`
- [ ] Componente: Lista de pagos pendientes
- [ ] Integración completa con Deuna

### 6. PMA Utils Webhook (Prioridad Alta)

- [ ] API: POST /api/pma/ejecutar-accion
- [ ] Autenticación con X-API-Key
- [ ] Acciones:
  - [ ] `reembolsar`
  - [ ] `bloquear_conductor`
  - [ ] `desbloquear_usuario`
  - [ ] `cancelar_carrera_forzada`
  - [ ] `consultar_gps`
- [ ] Logging en `LogAuditoria`
- [ ] Documentación Postman

### 7. Usuarios/Clientes (Prioridad Baja)

- [ ] API: GET /api/usuarios
- [ ] API: GET /api/usuarios/[id]
- [ ] API: PUT /api/usuarios/[id]/bloquear
- [ ] API: PUT /api/usuarios/[id]/desbloquear
- [ ] Página: `src/app/(dashboard)/usuarios/page.tsx`
- [ ] Historial de carreras por usuario

### 8. Logs y Auditoría (Prioridad Media)

- [ ] Página: `src/app/(dashboard)/logs/page.tsx`
- [ ] Filtros por acción, admin, fecha
- [ ] Exportar CSV

### 9. Notificaciones WhatsApp (Prioridad Alta)

- [ ] Función: `enviarNotificacionWhatsApp()`
- [ ] Integración con WhatsApp Business API
- [ ] Templates de mensajes:
  - Conductor aprobado
  - Conductor rechazado
  - Conductor bloqueado
  - Usuario bloqueado
  - Pago exitoso
  - Emergencia alertada

### 10. Componentes UI (shadcn) (Prioridad Media)

Componentes básicos a agregar en `src/components/ui/`:

- [ ] `button.tsx`
- [ ] `card.tsx`
- [ ] `table.tsx`
- [ ] `dialog.tsx`
- [ ] `dropdown-menu.tsx`
- [ ] `input.tsx`
- [ ] `label.tsx`
- [ ] `select.tsx`
- [ ] `tabs.tsx`
- [ ] `toast.tsx`
- [ ] `avatar.tsx`
- [ ] `badge.tsx`

**Instalar con:**
```bash
npx shadcn-ui@latest add button card table dialog dropdown-menu input label select tabs toast avatar badge
```

### 11. Testing (Prioridad Baja)

- [ ] Tests unitarios (Jest)
- [ ] Tests de integración (API routes)
- [ ] Tests E2E (Playwright)

### 12. CI/CD (Prioridad Media)

- [ ] GitHub Actions
- [ ] Deploy automático a Dokploy
- [ ] Linting (ESLint)
- [ ] Type checking (tsc)
- [ ] Tests en CI

### 13. Mejoras Adicionales (Prioridad Baja)

- [ ] Tema oscuro (dark mode)
- [ ] Gráficos avanzados (Recharts)
- [ ] Exportar reportes PDF
- [ ] Multi-idioma (i18n)
- [ ] Notificaciones por email
- [ ] Backup automático programado

## 📦 Instalación de Dependencias Adicionales

```bash
# Autenticación
npm install next-auth bcryptjs
npm install -D @types/bcryptjs

# Mapas (elegir uno)
npm install @googlemaps/js-api-loader  # Google Maps
# o
npm install mapbox-gl  # Mapbox

# WebSockets (tiempo real)
npm install socket.io socket.io-client

# PDF
npm install jspdf

# Email (opcional)
npm install nodemailer
npm install -D @types/nodemailer

# Testing
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright
```

## 🎯 Roadmap por Sprint

### Sprint 1 (Semana 1) - MVP
- [x] Setup inicial
- [ ] Autenticación
- [ ] Dashboard stats
- [ ] Gestión conductores básica

### Sprint 2 (Semana 2) - Core Features
- [ ] Monitor carreras
- [ ] Gestión incidentes/emergencias
- [ ] PMA Utils Webhook
- [ ] Notificaciones WhatsApp

### Sprint 3 (Semana 3) - Pagos & UX
- [ ] Gestión de pagos
- [ ] Integración Deuna
- [ ] Componentes UI completos
- [ ] Mejoras UX

### Sprint 4 (Semana 4) - Polish & Deploy
- [ ] Testing
- [ ] CI/CD
- [ ] Documentación final
- [ ] Deploy a producción

## 🚀 Comandos Rápidos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Prisma
npx prisma studio
npx prisma migrate dev --name descripcion

# Docker
docker-compose up -d
docker-compose logs -f crm

# Git
git add .
git commit -m "feat: descripcion"
git push origin main
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)

---

**Última actualización**: 2026-06-04
