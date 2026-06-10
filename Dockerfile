# Dockerfile para TaxiBot CRM - Versión simplificada
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat openssl postgresql-client

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Script de inicio con migraciones
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=== Ejecutando migraciones de Prisma ==="' >> /app/start.sh && \
    echo 'npx prisma migrate deploy || exit 1' >> /app/start.sh && \
    echo 'echo "=== Migraciones completadas exitosamente ==="' >> /app/start.sh && \
    echo 'echo "=== Iniciando aplicación Next.js ==="' >> /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Ejecutar script de inicio
CMD ["/app/start.sh"]
