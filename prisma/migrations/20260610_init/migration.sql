-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CLIENTE', 'CONDUCTOR');
CREATE TYPE "EstadoConductor" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'SUSPENDIDO', 'BLOQUEADO');
CREATE TYPE "EstadoCarrera" AS ENUM ('BUSCANDO', 'ASIGNADA', 'CONDUCTOR_LLEGO', 'EN_CURSO', 'COMPLETADA', 'CANCELADA');
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PROCESANDO', 'EXITOSO', 'FALLIDO', 'REEMBOLSADO');
CREATE TYPE "MetodoPago" AS ENUM ('TARJETA', 'TRANSFERENCIA');
CREATE TYPE "TipoIncidente" AS ENUM ('PROBLEMA_CONDUCTOR', 'RUTA_INCORRECTA', 'COBRO_INDEBIDO', 'ACCIDENTE', 'EMERGENCIA', 'OTRO');
CREATE TYPE "EstadoIncidente" AS ENUM ('ABIERTO', 'EN_REVISION', 'RESUELTO', 'CERRADO');
CREATE TYPE "TipoSancion" AS ENUM ('GPS_APAGADO', 'CANCELACION_FRECUENTE', 'BAJA_CALIFICACION', 'DENUNCIA_GRAVE', 'OTRO');
CREATE TYPE "RolPMA" AS ENUM ('ADMIN', 'SOPORTE', 'REVISOR');
CREATE TYPE "TipoAccionAuditoria" AS ENUM ('APROBAR_CONDUCTOR', 'RECHAZAR_CONDUCTOR', 'BLOQUEAR_CONDUCTOR', 'DESBLOQUEAR_USUARIO', 'REEMBOLSAR_PAGO', 'CANCELAR_CARRERA', 'RESOLVER_INCIDENTE', 'APLICAR_SANCION', 'EMERGENCIA_ALERTADA', 'OTRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "fotoUrl" TEXT,
    "tipo" "TipoUsuario" NOT NULL,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "deudaPendiente" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creditos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "codigoReferido" TEXT,
    "referidoPorId" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatoConductor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "fotosConductor" TEXT,
    "fotosVehiculo" TEXT,
    "fotosMatricula" TEXT,
    "estado" "EstadoConductor" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "ratingPromedio" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalViajes" INTEGER NOT NULL DEFAULT 0,
    "gpsActivo" BOOLEAN NOT NULL DEFAULT false,
    "ubicacionLat" DECIMAL(10,8),
    "ubicacionLng" DECIMAL(11,8),
    "ubicacionTimestamp" TIMESTAMP(3),
    "disponible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DatoConductor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrera" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "conductorId" TEXT,
    "origenLat" DECIMAL(10,8) NOT NULL,
    "origenLng" DECIMAL(11,8) NOT NULL,
    "origenDireccion" TEXT NOT NULL,
    "destinoLat" DECIMAL(10,8) NOT NULL,
    "destinoLng" DECIMAL(11,8) NOT NULL,
    "destinoDireccion" TEXT NOT NULL,
    "distanciaKm" DECIMAL(10,2) NOT NULL,
    "costoEstimado" DECIMAL(10,2) NOT NULL,
    "costoFinal" DECIMAL(10,2),
    "estado" "EstadoCarrera" NOT NULL DEFAULT 'BUSCANDO',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAsignacion" TIMESTAMP(3),
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "compartidoCon" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motivoCancelacion" TEXT,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoCarreraHistorial" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "estado" "EstadoCarrera" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstadoCarreraHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "deunaTransactionId" TEXT,
    "deunaLink" TEXT,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaConfirmacion" TIMESTAMP(3),

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "conductorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidente" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "conductorId" TEXT,
    "tipo" "TipoIncidente" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "evidenciaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estado" "EstadoIncidente" NOT NULL DEFAULT 'ABIERTO',
    "resolucion" TEXT,
    "resueltoPorId" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),

    CONSTRAINT "Incidente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sancion" (
    "id" TEXT NOT NULL,
    "conductorId" TEXT NOT NULL,
    "tipo" "TipoSancion" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "duracionHoras" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sancion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPMA" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolPMA" NOT NULL DEFAULT 'SOPORTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPMA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "accion" "TipoAccionAuditoria" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "usuarioAfectadoId" TEXT,
    "conductorAfectadoId" TEXT,
    "carreraId" TEXT,
    "incidenteId" TEXT,
    "metadataJson" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");
CREATE UNIQUE INDEX "Usuario_codigoReferido_key" ON "Usuario"("codigoReferido");
CREATE INDEX "Usuario_telefono_idx" ON "Usuario"("telefono");
CREATE INDEX "Usuario_tipo_idx" ON "Usuario"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "DatoConductor_usuarioId_key" ON "DatoConductor"("usuarioId");
CREATE UNIQUE INDEX "DatoConductor_cedula_key" ON "DatoConductor"("cedula");
CREATE UNIQUE INDEX "DatoConductor_placa_key" ON "DatoConductor"("placa");
CREATE INDEX "DatoConductor_estado_idx" ON "DatoConductor"("estado");
CREATE INDEX "DatoConductor_disponible_idx" ON "DatoConductor"("disponible");

-- CreateIndex
CREATE INDEX "Carrera_usuarioId_idx" ON "Carrera"("usuarioId");
CREATE INDEX "Carrera_conductorId_idx" ON "Carrera"("conductorId");
CREATE INDEX "Carrera_estado_idx" ON "Carrera"("estado");
CREATE INDEX "Carrera_fechaSolicitud_idx" ON "Carrera"("fechaSolicitud");

-- CreateIndex
CREATE INDEX "EstadoCarreraHistorial_carreraId_idx" ON "EstadoCarreraHistorial"("carreraId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_carreraId_key" ON "Pago"("carreraId");
CREATE UNIQUE INDEX "Pago_deunaTransactionId_key" ON "Pago"("deunaTransactionId");
CREATE INDEX "Pago_usuarioId_idx" ON "Pago"("usuarioId");
CREATE INDEX "Pago_estado_idx" ON "Pago"("estado");
CREATE INDEX "Pago_fechaCreacion_idx" ON "Pago"("fechaCreacion");

-- CreateIndex
CREATE INDEX "Calificacion_carreraId_idx" ON "Calificacion"("carreraId");
CREATE INDEX "Calificacion_conductorId_idx" ON "Calificacion"("conductorId");

-- CreateIndex
CREATE INDEX "Incidente_estado_idx" ON "Incidente"("estado");
CREATE INDEX "Incidente_tipo_idx" ON "Incidente"("tipo");
CREATE INDEX "Incidente_fechaCreacion_idx" ON "Incidente"("fechaCreacion");

-- CreateIndex
CREATE INDEX "Sancion_conductorId_idx" ON "Sancion"("conductorId");
CREATE INDEX "Sancion_activa_idx" ON "Sancion"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPMA_email_key" ON "AdminPMA"("email");
CREATE INDEX "AdminPMA_email_idx" ON "AdminPMA"("email");

-- CreateIndex
CREATE INDEX "LogAuditoria_accion_idx" ON "LogAuditoria"("accion");
CREATE INDEX "LogAuditoria_timestamp_idx" ON "LogAuditoria"("timestamp");
CREATE INDEX "LogAuditoria_adminId_idx" ON "LogAuditoria"("adminId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_referidoPorId_fkey" FOREIGN KEY ("referidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatoConductor" ADD CONSTRAINT "DatoConductor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrera" ADD CONSTRAINT "Carrera_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrera" ADD CONSTRAINT "Carrera_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoCarreraHistorial" ADD CONSTRAINT "EstadoCarreraHistorial_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sancion" ADD CONSTRAINT "Sancion_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "DatoConductor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
