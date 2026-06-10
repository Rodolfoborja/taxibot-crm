import prisma from '@/lib/prisma'
import { registrarAuditoria } from '@/lib/audit'

/** Mutaciones sobre conductores ejecutadas por operadores PMA desde el panel. */

export async function aprobarConductor(conductorId: string, adminId?: string | null) {
  const conductor = await prisma.datoConductor.findUnique({ where: { id: conductorId } })
  if (!conductor) throw new Error('Conductor no encontrado.')

  const actualizado = await prisma.datoConductor.update({
    where: { id: conductorId },
    data: { estado: 'APROBADO', motivoRechazo: null },
  })

  await registrarAuditoria({
    accion: 'APROBAR_CONDUCTOR',
    descripcion: `Conductor ${conductorId} aprobado.`,
    adminId,
    conductorAfectadoId: conductor.usuarioId,
  })

  return actualizado
}

export async function rechazarConductor(conductorId: string, motivo: string, adminId?: string | null) {
  const conductor = await prisma.datoConductor.findUnique({ where: { id: conductorId } })
  if (!conductor) throw new Error('Conductor no encontrado.')

  const actualizado = await prisma.datoConductor.update({
    where: { id: conductorId },
    data: { estado: 'RECHAZADO', motivoRechazo: motivo },
  })

  await registrarAuditoria({
    accion: 'RECHAZAR_CONDUCTOR',
    descripcion: `Conductor ${conductorId} rechazado: ${motivo}`,
    adminId,
    conductorAfectadoId: conductor.usuarioId,
  })

  return actualizado
}
