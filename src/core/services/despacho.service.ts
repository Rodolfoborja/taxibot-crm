import prisma from '@/lib/prisma'
import { registrarAuditoria } from '@/lib/audit'
import { enviarMensaje } from './comms.service'

/** Carreras que nadie ha aceptado (esperando conductor). */
export async function carrerasPorAsignar() {
  const carreras = await prisma.carrera.findMany({
    where: { estado: 'BUSCANDO', conductorId: null },
    include: { usuario: { select: { nombre: true, telefono: true } } },
    orderBy: { fechaSolicitud: 'asc' }, // las que más esperan, primero
    take: 100,
  })
  return carreras.map((c) => ({
    id: c.id,
    clienteNombre: c.usuario.nombre,
    clienteTelefono: c.usuario.telefono,
    origenDireccion: c.origenDireccion,
    destinoDireccion: c.destinoDireccion,
    distanciaKm: Number(c.distanciaKm),
    costoEstimado: Number(c.costoEstimado),
    fechaSolicitud: c.fechaSolicitud,
  }))
}

/** Conductores candidatos para asignación: libres primero, luego "por liberarse". */
export async function conductoresParaAsignar() {
  const conductores = await prisma.datoConductor.findMany({
    where: { estado: 'APROBADO' },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          telefono: true,
          carrerasConductor: {
            where: { estado: { in: ['ASIGNADA', 'CONDUCTOR_LLEGO', 'EN_CURSO'] } },
            select: { estado: true },
            take: 1,
          },
        },
      },
    },
    take: 200,
  })

  return conductores
    .map((c) => {
      const carreraActiva = c.usuario.carrerasConductor[0]
      return {
        usuarioId: c.usuario.id,
        nombre: c.usuario.nombre,
        telefono: c.usuario.telefono,
        placa: c.placa,
        rating: Number(c.ratingPromedio),
        gpsActivo: c.gpsActivo,
        disponible: c.disponible && !carreraActiva,
        // "por liberarse": va en una carrera que está por terminar
        porLiberarse: !!carreraActiva && carreraActiva.estado === 'EN_CURSO',
        estadoActual: carreraActiva ? carreraActiva.estado : c.disponible ? 'LIBRE' : 'OCUPADO',
      }
    })
    .sort((a, b) => Number(b.disponible) - Number(a.disponible) || Number(b.porLiberarse) - Number(a.porLiberarse))
}

/** Asigna manualmente un conductor a una carrera (despacho PMA). */
export async function asignarConductor(carreraId: string, conductorUsuarioId: string, adminId?: string | null) {
  const carrera = await prisma.carrera.findUnique({
    where: { id: carreraId },
    include: { usuario: { select: { nombre: true, telefono: true } } },
  })
  if (!carrera) throw new Error('Carrera no encontrada.')
  if (['COMPLETADA', 'CANCELADA'].includes(carrera.estado)) {
    throw new Error(`La carrera ya está ${carrera.estado}.`)
  }

  const conductor = await prisma.usuario.findUnique({
    where: { id: conductorUsuarioId },
    include: { datoConductor: true },
  })
  if (!conductor?.datoConductor) throw new Error('Conductor no válido.')

  const actualizada = await prisma.$transaction(async (tx) => {
    const c = await tx.carrera.update({
      where: { id: carreraId },
      data: { conductorId: conductorUsuarioId, estado: 'ASIGNADA', fechaAsignacion: new Date() },
    })
    await tx.estadoCarreraHistorial.create({ data: { carreraId, estado: 'ASIGNADA' } })
    await tx.datoConductor.update({ where: { id: conductor.datoConductor!.id }, data: { disponible: false } })
    return c
  })

  await registrarAuditoria({
    accion: 'OTRO',
    descripcion: `Carrera ${carreraId} asignada manualmente al conductor ${conductor.nombre} (${conductor.telefono}).`,
    adminId,
    carreraId,
    conductorAfectadoId: conductorUsuarioId,
  })

  // Notificar a ambas partes (best-effort)
  await Promise.allSettled([
    enviarMensaje({
      telefono: conductor.telefono,
      nombre: conductor.nombre,
      texto: `Se te asignó una carrera: recoger en ${carrera.origenDireccion} → ${carrera.destinoDireccion}.`,
      carreraId,
      adminId,
    }),
    enviarMensaje({
      telefono: carrera.usuario.telefono,
      nombre: carrera.usuario.nombre,
      texto: `Te asignamos un conductor: ${conductor.nombre} (${conductor.datoConductor.placa}). ¡En camino!`,
      carreraId,
      adminId,
    }),
  ])

  return actualizada
}
