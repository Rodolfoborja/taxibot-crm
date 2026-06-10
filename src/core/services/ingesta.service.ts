import prisma from '@/lib/prisma'
import type { IngestaPayload } from '@/core/validators/ingesta'

export interface ResultadoIngesta {
  recursoId: string
  mensaje: string
}

/**
 * Procesa un payload de ingesta proveniente del bot (Jelou).
 * Hace upsert de usuarios y crea/actualiza el recurso correspondiente.
 */
export async function procesarIngesta(payload: IngestaPayload): Promise<ResultadoIngesta> {
  switch (payload.tipo) {
    case 'usuario':
      return ingestarUsuario(payload.data)
    case 'carrera':
      return ingestarCarrera(payload.data)
    case 'ubicacion':
      return ingestarUbicacion(payload.data)
    case 'incidente':
      return ingestarIncidente(payload.data)
  }
}

async function ingestarUsuario(
  data: Extract<IngestaPayload, { tipo: 'usuario' }>['data']
): Promise<ResultadoIngesta> {
  const usuario = await prisma.usuario.upsert({
    where: { telefono: data.telefono },
    update: {
      nombre: data.nombre,
      email: data.email ?? undefined,
      fotoUrl: data.fotoUrl ?? undefined,
      ultimaActividad: new Date(),
    },
    create: {
      telefono: data.telefono,
      nombre: data.nombre,
      email: data.email ?? undefined,
      fotoUrl: data.fotoUrl ?? undefined,
      tipo: data.tipo,
    },
  })
  return { recursoId: usuario.id, mensaje: 'Usuario sincronizado.' }
}

async function ingestarCarrera(
  data: Extract<IngestaPayload, { tipo: 'carrera' }>['data']
): Promise<ResultadoIngesta> {
  const cliente = await prisma.usuario.findUnique({
    where: { telefono: data.telefonoCliente },
  })
  if (!cliente) {
    throw new Error(`No existe un cliente con teléfono ${data.telefonoCliente}. Sincronízalo primero.`)
  }

  const carrera = await prisma.carrera.create({
    data: {
      usuarioId: cliente.id,
      origenLat: data.origenLat,
      origenLng: data.origenLng,
      origenDireccion: data.origenDireccion,
      destinoLat: data.destinoLat,
      destinoLng: data.destinoLng,
      destinoDireccion: data.destinoDireccion,
      distanciaKm: data.distanciaKm,
      costoEstimado: data.costoEstimado,
      estado: data.estado ?? 'BUSCANDO',
    },
  })
  return { recursoId: carrera.id, mensaje: 'Carrera registrada.' }
}

async function ingestarUbicacion(
  data: Extract<IngestaPayload, { tipo: 'ubicacion' }>['data']
): Promise<ResultadoIngesta> {
  const conductor = await prisma.usuario.findUnique({
    where: { telefono: data.telefonoConductor },
    include: { datoConductor: true },
  })
  if (!conductor?.datoConductor) {
    throw new Error(`No existe un conductor con teléfono ${data.telefonoConductor}.`)
  }

  const conductorId = conductor.datoConductor.id

  // Carrera activa del conductor (para asociar el punto a su trayectoria)
  const carreraActiva = await prisma.carrera.findFirst({
    where: { conductorId: conductor.id, estado: { in: ['ASIGNADA', 'CONDUCTOR_LLEGO', 'EN_CURSO'] } },
    select: { id: true },
    orderBy: { fechaSolicitud: 'desc' },
  })

  await prisma.$transaction([
    prisma.datoConductor.update({
      where: { id: conductorId },
      data: {
        ubicacionLat: data.lat,
        ubicacionLng: data.lng,
        ubicacionTimestamp: new Date(),
        gpsActivo: true,
        ...(data.disponible !== undefined ? { disponible: data.disponible } : {}),
      },
    }),
    prisma.ubicacionHistorial.create({
      data: {
        conductorId,
        carreraId: carreraActiva?.id ?? null,
        lat: data.lat,
        lng: data.lng,
      },
    }),
  ])
  return { recursoId: conductorId, mensaje: 'Ubicación GPS actualizada.' }
}

async function ingestarIncidente(
  data: Extract<IngestaPayload, { tipo: 'incidente' }>['data']
): Promise<ResultadoIngesta> {
  const reporta = await prisma.usuario.findUnique({
    where: { telefono: data.telefonoReporta },
  })
  if (!reporta) {
    throw new Error(`No existe el usuario que reporta (${data.telefonoReporta}).`)
  }

  const incidente = await prisma.incidente.create({
    data: {
      carreraId: data.carreraId,
      usuarioId: reporta.id,
      tipo: data.tipo,
      descripcion: data.descripcion,
      evidenciaUrls: data.evidenciaUrls ?? [],
    },
  })
  return { recursoId: incidente.id, mensaje: 'Incidente registrado.' }
}
