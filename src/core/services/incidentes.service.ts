import prisma from '@/lib/prisma'
import { registrarAuditoria } from '@/lib/audit'
import type { EstadoIncidente } from '@prisma/client'

/** Cambia el estado de un incidente y registra la resolución. */
export async function actualizarIncidente(
  id: string,
  data: { estado: EstadoIncidente; resolucion?: string | null },
  adminId?: string | null
) {
  const incidente = await prisma.incidente.findUnique({ where: { id } })
  if (!incidente) throw new Error('Incidente no encontrado.')

  const cierra = data.estado === 'RESUELTO' || data.estado === 'CERRADO'

  const actualizado = await prisma.incidente.update({
    where: { id },
    data: {
      estado: data.estado,
      resolucion: data.resolucion ?? incidente.resolucion,
      resueltoPorId: cierra ? adminId ?? null : incidente.resueltoPorId,
      fechaResolucion: cierra ? new Date() : incidente.fechaResolucion,
    },
  })

  await registrarAuditoria({
    accion: 'RESOLVER_INCIDENTE',
    descripcion: `Incidente ${id} → ${data.estado}. ${data.resolucion ?? ''}`,
    adminId,
    incidenteId: id,
    usuarioAfectadoId: incidente.usuarioId,
    carreraId: incidente.carreraId,
  })

  return actualizado
}
