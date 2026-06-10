import prisma from '@/lib/prisma'

/** Listados para las pantallas del panel. Se llaman desde Server Components. */

export async function listarConductores(estado?: string) {
  return prisma.datoConductor.findMany({
    where: estado ? { estado: estado as never } : undefined,
    include: { usuario: true, sanciones: { where: { activa: true } } },
    orderBy: { usuario: { fechaRegistro: 'desc' } },
    take: 100,
  })
}

export async function obtenerConductor(id: string) {
  return prisma.datoConductor.findUnique({
    where: { id },
    include: { usuario: true, sanciones: { orderBy: { fechaInicio: 'desc' } } },
  })
}

export async function listarCarreras(estado?: string) {
  return prisma.carrera.findMany({
    where: estado ? { estado: estado as never } : undefined,
    include: { usuario: true, conductor: true, pago: true },
    orderBy: { fechaSolicitud: 'desc' },
    take: 100,
  })
}

export async function listarIncidentes(soloAbiertos = false) {
  return prisma.incidente.findMany({
    where: soloAbiertos ? { estado: { in: ['ABIERTO', 'EN_REVISION'] } } : undefined,
    include: { usuario: true, conductor: true, carrera: true },
    orderBy: [{ fechaCreacion: 'desc' }],
    take: 100,
  })
}

export async function listarPagos(estado?: string) {
  return prisma.pago.findMany({
    where: estado ? { estado: estado as never } : undefined,
    include: { usuario: true, carrera: true },
    orderBy: { fechaCreacion: 'desc' },
    take: 100,
  })
}

export async function listarUsuarios(tipo?: string) {
  return prisma.usuario.findMany({
    where: tipo ? { tipo: tipo as never } : undefined,
    include: { datoConductor: true },
    orderBy: { fechaRegistro: 'desc' },
    take: 100,
  })
}
