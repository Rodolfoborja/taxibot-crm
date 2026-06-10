-- CreateEnum
CREATE TYPE "ApiKeyScope" AS ENUM ('INGEST', 'PMA_ACCIONES', 'LECTURA');

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "prefijo" TEXT NOT NULL,
    "hashToken" TEXT NOT NULL,
    "scopes" "ApiKeyScope"[] DEFAULT ARRAY['INGEST']::"ApiKeyScope"[],
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "revocada" BOOLEAN NOT NULL DEFAULT false,
    "ultimoUso" TIMESTAMP(3),
    "totalUsos" INTEGER NOT NULL DEFAULT 0,
    "expiraEn" TIMESTAMP(3),
    "creadaPorId" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoIngesta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "payloadJson" TEXT NOT NULL,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "recursoId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoIngesta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_prefijo_key" ON "ApiKey"("prefijo");
CREATE UNIQUE INDEX "ApiKey_hashToken_key" ON "ApiKey"("hashToken");
CREATE INDEX "ApiKey_prefijo_idx" ON "ApiKey"("prefijo");
CREATE INDEX "ApiKey_activa_idx" ON "ApiKey"("activa");
CREATE INDEX "EventoIngesta_tipo_idx" ON "EventoIngesta"("tipo");
CREATE INDEX "EventoIngesta_timestamp_idx" ON "EventoIngesta"("timestamp");
CREATE INDEX "EventoIngesta_procesado_idx" ON "EventoIngesta"("procesado");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "AdminPMA"("id") ON DELETE SET NULL ON UPDATE CASCADE;
