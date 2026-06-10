-- CreateEnum
CREATE TYPE "DireccionMensaje" AS ENUM ('ENTRANTE', 'SALIENTE');
CREATE TYPE "CanalMensaje" AS ENUM ('WHATSAPP', 'INTERNO');
CREATE TYPE "EstadoMensaje" AS ENUM ('PENDIENTE', 'ENVIADO', 'ENTREGADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "UbicacionHistorial" (
    "id" TEXT NOT NULL,
    "conductorId" TEXT NOT NULL,
    "carreraId" TEXT,
    "lat" DECIMAL(10,8) NOT NULL,
    "lng" DECIMAL(11,8) NOT NULL,
    "velocidadKmh" DECIMAL(6,2),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UbicacionHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT,
    "telefono" TEXT NOT NULL,
    "nombre" TEXT,
    "direccion" "DireccionMensaje" NOT NULL DEFAULT 'SALIENTE',
    "canal" "CanalMensaje" NOT NULL DEFAULT 'WHATSAPP',
    "texto" TEXT NOT NULL,
    "estado" "EstadoMensaje" NOT NULL DEFAULT 'PENDIENTE',
    "error" TEXT,
    "adminId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UbicacionHistorial_conductorId_timestamp_idx" ON "UbicacionHistorial"("conductorId", "timestamp");
CREATE INDEX "UbicacionHistorial_carreraId_timestamp_idx" ON "UbicacionHistorial"("carreraId", "timestamp");
CREATE INDEX "Mensaje_carreraId_timestamp_idx" ON "Mensaje"("carreraId", "timestamp");
CREATE INDEX "Mensaje_telefono_timestamp_idx" ON "Mensaje"("telefono", "timestamp");

-- AddForeignKey
ALTER TABLE "UbicacionHistorial" ADD CONSTRAINT "UbicacionHistorial_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "DatoConductor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UbicacionHistorial" ADD CONSTRAINT "UbicacionHistorial_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;
