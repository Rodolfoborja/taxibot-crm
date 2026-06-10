import prisma from './prisma'
import type { TipoAccionAuditoria } from '@prisma/client'

/**
 * Registra una acción en el log de auditoría.
 * No lanza: la auditoría nunca debe tumbar la operación principal.
 */
export async function registrarAuditoria(data: {
  accion: TipoAccionAuditoria
  descripcion: string
  adminId?: string | null
  usuarioAfectadoId?: string | null
  conductorAfectadoId?: string | null
  carreraId?: string | null
  incidenteId?: string | null
  metadata?: Record<string, unknown>
}) {
  try {
    await prisma.logAuditoria.create({
      data: {
        accion: data.accion,
        descripcion: data.descripcion,
        adminId: data.adminId ?? null,
        usuarioAfectadoId: data.usuarioAfectadoId ?? null,
        conductorAfectadoId: data.conductorAfectadoId ?? null,
        carreraId: data.carreraId ?? null,
        incidenteId: data.incidenteId ?? null,
        metadataJson: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })
  } catch (err) {
    console.error('[audit] No se pudo registrar la auditoría:', err)
  }
}
