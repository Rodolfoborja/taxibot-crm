# 🚀 Guía de Deploy en Dokploy

## Configuración paso a paso para tu servidor

### 1. Acceso a Dokploy

```
URL: https://cloud.rodolfoborja.com
Usuario: [tu usuario]
```

### 2. Crear Servicios Base

#### PostgreSQL

1. Ir a "Services" → "Add Service"
2. Seleccionar "Postgres"
3. Configuración:
   - **Name**: `taxibot-postgres`
   - **Version**: `16-alpine`
   - **Database**: `taxibot_crm`
   - **Username**: `taxibot`
   - **Password**: [generar segura - guardar]
   - **Port**: `5432` (interno)
   - **Volume**: `/var/lib/postgresql/data`

4. Click "Create"

#### Redis

1. Ir a "Services" → "Add Service"
2. Seleccionar "Redis"
3. Configuración:
   - **Name**: `taxibot-redis`
   - **Version**: `7-alpine`
   - **Port**: `6379` (interno)
   - **Volume**: `/data`

4. Click "Create"

### 3. Crear Aplicación CRM

1. Ir a "Applications" → "Add Application"
2. Configuración:

   **General:**
   - **Name**: `taxibot-crm`
   - **Type**: `Docker`
   - **Source**: `Git Repository`

   **Git:**
   - **Repository**: `https://github.com/tuusuario/taxibot-crm.git`
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`

   **Build:**
   - **Build Command**: (dejar vacío, usa Dockerfile)
   - **Port**: `3000`

   **Environment Variables:**
   ```env
   DATABASE_URL=postgresql://taxibot:[TU_PASSWORD]@taxibot-postgres:5432/taxibot_crm
   REDIS_URL=redis://taxibot-redis:6379
   NEXTAUTH_URL=https://crm.rodolfoborja.com
   NEXTAUTH_SECRET=[GENERAR_CON_COMANDO_ABAJO]
   NODE_ENV=production
   
   # Jelou API
   JELOU_API_URL=https://api.jelou.ai
   JELOU_API_KEY=[TU_JELOU_KEY]
   
   # Deuna (Sandbox)
   DEUNA_API_KEY=[TU_DEUNA_KEY]
   DEUNA_WEBHOOK_SECRET=[TU_DEUNA_SECRET]
   DEUNA_ENV=sandbox
   
   # WhatsApp Business API
   WHATSAPP_API_URL=https://graph.facebook.com/v17.0
   WHATSAPP_ACCESS_TOKEN=[TU_WHATSAPP_TOKEN]
   WHATSAPP_PHONE_NUMBER_ID=[TU_PHONE_ID]
   ```

   **Domain:**
   - Agregar dominio: `crm.rodolfoborja.com`
   - SSL: Auto (Let's Encrypt)

3. Click "Create"

### 4. Generar NEXTAUTH_SECRET

En tu terminal local:

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET`.

### 5. Deploy Inicial

1. Dokploy detectará automáticamente el push a `main`
2. O forzar deploy manual: Click "Deploy" en el panel

### 6. Ejecutar Migraciones (Primera vez)

Acceder al contenedor:

```bash
# En el servidor VPS
docker exec -it taxibot-crm sh

# Dentro del contenedor
npx prisma migrate deploy
```

### 7. Crear Usuario Admin Inicial

```bash
# En el contenedor
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.adminPMA.create({
    data: {
      email: 'admin@rodolfoborja.com',
      nombre: 'Administrador',
      password: hashedPassword,
      rol: 'ADMIN',
    }
  });
  console.log('Admin creado: admin@rodolfoborja.com / admin123');
}

createAdmin();
"
```

### 8. Configurar Webhook para Deuna

En tu cuenta Deuna:

1. Ir a Configuración → Webhooks
2. Agregar endpoint:
   ```
   URL: https://crm.rodolfoborja.com/api/webhook/deuna
   Eventos: payment.success, payment.failed
   Secret: [el mismo de DEUNA_WEBHOOK_SECRET]
   ```

### 9. Health Check

```bash
# Verificar que todo está corriendo
curl https://crm.rodolfoborja.com/api/health

# Debería responder:
# {"status":"ok","database":"connected","redis":"connected"}
```

## 🔄 Actualizar Aplicación

### Deploy automático (recomendado)

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

Dokploy detectará el push y redeplegará automáticamente.

### Deploy manual desde Dokploy

1. Ir a tu aplicación `taxibot-crm`
2. Click "Deploy"
3. Esperar build (2-3 minutos)

### Rollback

1. En Dokploy, ir a "Deployments"
2. Seleccionar versión anterior
3. Click "Redeploy"

## 🔍 Monitoreo

### Logs en Tiempo Real

En Dokploy:
1. Ir a `taxibot-crm`
2. Tab "Logs"
3. Ver logs en tiempo real

O desde SSH:

```bash
docker logs -f taxibot-crm --tail 100
```

### Base de Datos

Conectar con cliente PostgreSQL:

```bash
psql postgresql://taxibot:[PASSWORD]@localhost:5432/taxibot_crm
```

O usar Prisma Studio (túnel SSH):

```bash
# Local
ssh -L 5432:localhost:5432 user@cloud.rodolfoborja.com

# En otra terminal
cd taxibot-crm
DATABASE_URL="postgresql://taxibot:[PASSWORD]@localhost:5432/taxibot_crm" npx prisma studio
```

### Redis

```bash
docker exec -it taxibot-redis redis-cli

# Comandos útiles:
> PING               # Verificar conexión
> KEYS dashboard:*   # Ver keys de dashboard
> TTL dashboard:stats  # Ver tiempo restante de cache
> FLUSHALL          # Limpiar todo (cuidado!)
```

## 🛠️ Troubleshooting

### Error: "Database connection failed"

1. Verificar que PostgreSQL está corriendo:
   ```bash
   docker ps | grep postgres
   ```

2. Verificar DATABASE_URL en variables de entorno

3. Verificar que las migraciones están aplicadas:
   ```bash
   docker exec -it taxibot-crm npx prisma migrate status
   ```

### Error: "Redis connection refused"

1. Verificar Redis:
   ```bash
   docker ps | grep redis
   docker exec -it taxibot-redis redis-cli ping
   ```

2. Verificar REDIS_URL

### Build falla

Ver logs detallados:
```bash
docker logs taxibot-crm-build
```

Causas comunes:
- Error en Dockerfile
- Dependencias faltantes
- Prisma schema inválido

### Aplicación no responde

```bash
# Verificar estado
docker ps -a | grep taxibot-crm

# Reiniciar
docker restart taxibot-crm

# Ver logs de error
docker logs taxibot-crm --tail 50
```

## 🔐 Respaldos

### Base de Datos

Backup automático diario (configurar en Dokploy):

1. Ir a `taxibot-postgres`
2. Tab "Backups"
3. Configurar:
   - **Frequency**: Daily
   - **Time**: 03:00 AM
   - **Retention**: 7 days

Backup manual:

```bash
docker exec taxibot-postgres pg_dump -U taxibot taxibot_crm > backup_$(date +%Y%m%d).sql
```

Restaurar:

```bash
docker exec -i taxibot-postgres psql -U taxibot taxibot_crm < backup_20260604.sql
```

### Redis (opcional)

Redis persiste automáticamente en `/data` con AOF.

## 📊 Métricas Dokploy

Dokploy incluye métricas integradas:

1. CPU / RAM usage
2. Network I/O
3. Storage
4. Request rate

Acceder en: Panel → `taxibot-crm` → Tab "Metrics"

## 🚨 Alertas

Configurar alertas en Dokploy:

1. Settings → Notifications
2. Agregar webhook Slack/Discord:
   ```
   https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
3. Configurar triggers:
   - Deploy failed
   - Service down
   - High CPU/RAM

---

**Última actualización**: 2026-06-04
**Mantenido por**: Kiki 🦉
