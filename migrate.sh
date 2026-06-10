#!/bin/sh
# Script de migraciones inicial para TaxiBot CRM

echo "=== Iniciando migraciones de Prisma ==="
npx prisma migrate deploy

echo "=== Migraciones completadas ==="
echo "Iniciando aplicación..."
exec npm start
