import prisma from '@/lib/prisma'

export interface ConductorEnVivo {
  conductorId: string
  nombre: string
  telefono: string
  placa: string
  estado: string
  disponible: boolean
  gpsActivo: boolean
  lat: number | null
  lng: number | null
  ultimaActualizacion: Date | null
  ratingPromedio: number
  carreraActivaId: string | null
  carreraEstado: string | null
  clienteNombre: string | null
  clienteTelefono: string | null
}

/** Conductores aprobados con su última posición GPS, para el mapa en vivo. */
export async function conductoresEnVivo(): Promise<ConductorEnVivo[]> {
  const conductores = await prisma.datoConductor.findMany({
    where: { estado: 'APROBADO', ubicacionLat: { not: null } },
    include: {
      usuario: {
        select: {
          nombre: true,
          telefono: true,
          carrerasConductor: {
            where: { estado: { in: ['ASIGNADA', 'CONDUCTOR_LLEGO', 'EN_CURSO'] } },
            orderBy: { fechaSolicitud: 'desc' },
            take: 1,
            select: { id: true, estado: true, usuario: { select: { nombre: true, telefono: true } } },
          },
        },
      },
    },
    take: 200,
  })

  return conductores.map((c) => {
    const carrera = c.usuario.carrerasConductor[0]
    return {
      conductorId: c.id,
      nombre: c.usuario.nombre,
      telefono: c.usuario.telefono,
      placa: c.placa,
      estado: c.estado,
      disponible: c.disponible,
      gpsActivo: c.gpsActivo,
      lat: c.ubicacionLat ? Number(c.ubicacionLat) : null,
      lng: c.ubicacionLng ? Number(c.ubicacionLng) : null,
      ultimaActualizacion: c.ubicacionTimestamp,
      ratingPromedio: Number(c.ratingPromedio),
      carreraActivaId: carrera?.id ?? null,
      carreraEstado: carrera?.estado ?? null,
      clienteNombre: carrera?.usuario?.nombre ?? null,
      clienteTelefono: carrera?.usuario?.telefono ?? null,
    }
  })
}

export interface PuntoTrayectoria {
  lat: number
  lng: number
  timestamp: Date
}

export interface Trayectoria {
  conductorId: string
  nombre: string
  puntos: PuntoTrayectoria[]
  origen: { lat: number; lng: number; direccion: string } | null
  destino: { lat: number; lng: number; direccion: string } | null
}

/** Trayectoria reciente de un conductor (últimos N puntos). */
export async function trayectoria(conductorId: string, limite = 200): Promise<Trayectoria | null> {
  const conductor = await prisma.datoConductor.findUnique({
    where: { id: conductorId },
    include: { usuario: { select: { nombre: true } } },
  })
  if (!conductor) return null

  const puntos = await prisma.ubicacionHistorial.findMany({
    where: { conductorId },
    orderBy: { timestamp: 'asc' },
    take: limite,
    select: { lat: true, lng: true, timestamp: true },
  })

  // Carrera activa para mostrar origen/destino
  const carrera = await prisma.carrera.findFirst({
    where: { conductorId: conductor.usuarioId, estado: { in: ['ASIGNADA', 'CONDUCTOR_LLEGO', 'EN_CURSO'] } },
    orderBy: { fechaSolicitud: 'desc' },
  })

  return {
    conductorId,
    nombre: conductor.usuario.nombre,
    puntos: puntos.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng), timestamp: p.timestamp })),
    origen: carrera
      ? { lat: Number(carrera.origenLat), lng: Number(carrera.origenLng), direccion: carrera.origenDireccion }
      : null,
    destino: carrera
      ? { lat: Number(carrera.destinoLat), lng: Number(carrera.destinoLng), direccion: carrera.destinoDireccion }
      : null,
  }
}
