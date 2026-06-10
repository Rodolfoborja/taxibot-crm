import prisma from '@/lib/prisma'
import { registrarAuditoria } from '@/lib/audit'
import type { AccionPmaInput } from '@/core/validators/pma'

export interface ResultadoAccionPma {
  success: boolean
  mensaje: string
  resultado?: unknown
}

/**
 * Ejecuta una acción administrativa PMA solicitada por el bot o un operador.
 * Toda acción queda registrada en LogAuditoria.
 *
 * @param input  Acción + parámetros (ya validados con Zod).
 * @param origen Identificador de quién la dispara (id de admin o "api:<prefijo>").
 */
export async function ejecutarAccionPma(
  input: AccionPmaInput,
  origen: { adminId?: string | null; descripcionOrigen: string }
): Promise<ResultadoAccionPma> {
  switch (input.accion) {
    case 'reembolsar':
      return reembolsar(input, origen)
    case 'bloquear_conductor':
      return bloquearConductor(input, origen)
    case 'desbloquear_usuario':
      return desbloquearUsuario(input, origen)
    case 'cancelar_carrera_forzada':
      return cancelarCarreraForzada(input, origen)
    case 'consultar_gps':
      return consultarGps(input)
  }
}

async function reembolsar(input: AccionPmaInput, origen: { adminId?: string | null; descripcionOrigen: string }): Promise<ResultadoAccionPma> {
  const pago = await prisma.pago.findUnique({ where: { carreraId: input.carreraId! } })
  if (!pago) return { success: false, mensaje: 'La carrera no tiene un pago asociado.' }
  if (pago.estado !== 'EXITOSO') {
    return { success: false, mensaje: `Solo se pueden reembolsar pagos exitosos (estado actual: ${pago.estado}).` }
  }

  const actualizado = await prisma.pago.update({
    where: { id: pago.id },
    data: { estado: 'REEMBOLSADO', fechaConfirmacion: new Date() },
  })

  await registrarAuditoria({
    accion: 'REEMBOLSAR_PAGO',
    descripcion: `Reembolso de ${pago.monto} (carrera ${input.carreraId}). ${input.motivo ?? ''} [${origen.descripcionOrigen}]`,
    adminId: origen.adminId,
    carreraId: input.carreraId,
    usuarioAfectadoId: pago.usuarioId,
    metadata: { monto: Number(pago.monto) },
  })

  return { success: true, mensaje: 'Pago reembolsado.', resultado: actualizado }
}

async function bloquearConductor(input: AccionPmaInput, origen: { adminId?: string | null; descripcionOrigen: string }): Promise<ResultadoAccionPma> {
  const conductor = await prisma.datoConductor.findUnique({ where: { id: input.conductorId! } })
  if (!conductor) return { success: false, mensaje: 'Conductor no encontrado.' }

  await prisma.datoConductor.update({
    where: { id: conductor.id },
    data: { estado: 'BLOQUEADO', disponible: false, motivoRechazo: input.motivo ?? 'Bloqueado por PMA' },
  })

  await registrarAuditoria({
    accion: 'BLOQUEAR_CONDUCTOR',
    descripcion: `Conductor ${conductor.id} bloqueado. ${input.motivo ?? ''} [${origen.descripcionOrigen}]`,
    adminId: origen.adminId,
    conductorAfectadoId: conductor.usuarioId,
  })

  return { success: true, mensaje: 'Conductor bloqueado.' }
}

async function desbloquearUsuario(input: AccionPmaInput, origen: { adminId?: string | null; descripcionOrigen: string }): Promise<ResultadoAccionPma> {
  const usuario = await prisma.usuario.findUnique({ where: { id: input.usuarioId! } })
  if (!usuario) return { success: false, mensaje: 'Usuario no encontrado.' }

  await prisma.usuario.update({ where: { id: usuario.id }, data: { bloqueado: false } })

  await registrarAuditoria({
    accion: 'DESBLOQUEAR_USUARIO',
    descripcion: `Usuario ${usuario.id} desbloqueado. ${input.motivo ?? ''} [${origen.descripcionOrigen}]`,
    adminId: origen.adminId,
    usuarioAfectadoId: usuario.id,
  })

  return { success: true, mensaje: 'Usuario desbloqueado.' }
}

async function cancelarCarreraForzada(input: AccionPmaInput, origen: { adminId?: string | null; descripcionOrigen: string }): Promise<ResultadoAccionPma> {
  const carrera = await prisma.carrera.findUnique({ where: { id: input.carreraId! } })
  if (!carrera) return { success: false, mensaje: 'Carrera no encontrada.' }
  if (['COMPLETADA', 'CANCELADA'].includes(carrera.estado)) {
    return { success: false, mensaje: `La carrera ya está ${carrera.estado}.` }
  }

  await prisma.$transaction([
    prisma.carrera.update({
      where: { id: carrera.id },
      data: { estado: 'CANCELADA', motivoCancelacion: input.motivo ?? 'Cancelada por PMA', fechaFin: new Date() },
    }),
    prisma.estadoCarreraHistorial.create({
      data: { carreraId: carrera.id, estado: 'CANCELADA' },
    }),
  ])

  await registrarAuditoria({
    accion: 'CANCELAR_CARRERA',
    descripcion: `Carrera ${carrera.id} cancelada forzadamente. ${input.motivo ?? ''} [${origen.descripcionOrigen}]`,
    adminId: origen.adminId,
    carreraId: carrera.id,
  })

  return { success: true, mensaje: 'Carrera cancelada.' }
}

async function consultarGps(input: AccionPmaInput): Promise<ResultadoAccionPma> {
  const conductor = await prisma.datoConductor.findUnique({
    where: { id: input.conductorId! },
    select: {
      ubicacionLat: true,
      ubicacionLng: true,
      ubicacionTimestamp: true,
      gpsActivo: true,
      disponible: true,
    },
  })
  if (!conductor) return { success: false, mensaje: 'Conductor no encontrado.' }

  return {
    success: true,
    mensaje: 'Ubicación obtenida.',
    resultado: {
      lat: conductor.ubicacionLat ? Number(conductor.ubicacionLat) : null,
      lng: conductor.ubicacionLng ? Number(conductor.ubicacionLng) : null,
      timestamp: conductor.ubicacionTimestamp,
      gpsActivo: conductor.gpsActivo,
      disponible: conductor.disponible,
    },
  }
}
