# Dockerfile para TaxiBot CRM - Versión estable
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

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

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Sincronizar el esquema y arrancar.
# `db push` es idempotente y no destructivo para cambios aditivos: crea las
# tablas/columnas que falten (incl. ApiKey y EventoIngesta) sin depender del
# estado del historial de migraciones. Si falla, el contenedor no arranca
# (no deja la BD a medias).
CMD ["sh", "-c", "npx prisma db push --skip-generate && node prisma/seed.mjs && npm start"]
