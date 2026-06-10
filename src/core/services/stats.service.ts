import prisma from '@/lib/prisma'
import type { DashboardStats } from '@/types'

export const EMPTY_STATS: DashboardStats = {
  carrerasHoy: 0,
  carrerasSemana: 0,
  carrerasMes: 0,
  ingresosHoy: 0,
  ingresosSemana: 0,
  ingresosMes: 0,
  conductoresActivos: 0,
  conductoresDisponibles: 0,
  incidentesAbiertos: 0,
  emergenciasActivas: 0,
  pagoPendiente: 0,
}

/**
 * Calcula las métricas del dashboard. Lanza si la BD no está disponible
 * (el route handler decide cómo degradar la respuesta).
 */
export async function obtenerStats(): Promise<DashboardStats> {
  const now = new Date()
  const inicioHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const inicioSemana = new Date(now)
  inicioSemana.setDate(now.getDate() - now.getDay())
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    carrerasHoy,
    carrerasSemana,
    carrerasMes,
    pagosHoy,
    pagosSemana,
    pagosMes,
    conductoresActivos,
    conductoresDisponibles,
    incidentesAbiertos,
    emergenciasActivas,
    pagoPendienteAgg,
  ] = await Promise.all([
    prisma.carrera.count({ where: { fechaSolicitud: { gte: inicioHoy } } }),
    prisma.carrera.count({ where: { fechaSolicitud: { gte: inicioSemana } } }),
    prisma.carrera.count({ where: { fechaSolicitud: { gte: inicioMes } } }),
    prisma.pago.aggregate({
      where: { estado: 'EXITOSO', fechaConfirmacion: { gte: inicioHoy } },
      _sum: { monto: true },
    }),
    prisma.pago.aggregate({
      where: { estado: 'EXITOSO', fechaConfirmacion: { gte: inicioSemana } },
      _sum: { monto: true },
    }),
    prisma.pago.aggregate({
      where: { estado: 'EXITOSO', fechaConfirmacion: { gte: inicioMes } },
      _sum: { monto: true },
    }),
    prisma.datoConductor.count({ where: { estado: 'APROBADO', gpsActivo: true } }),
    prisma.datoConductor.count({
      where: { estado: 'APROBADO', disponible: true, gpsActivo: true },
    }),
    prisma.incidente.count({ where: { estado: { in: ['ABIERTO', 'EN_REVISION'] } } }),
    prisma.incidente.count({
      where: { tipo: 'EMERGENCIA', estado: { in: ['ABIERTO', 'EN_REVISION'] } },
    }),
    prisma.pago.aggregate({ where: { estado: 'PENDIENTE' }, _sum: { monto: true } }),
  ])

  return {
    carrerasHoy,
    carrerasSemana,
    carrerasMes,
    ingresosHoy: Number(pagosHoy._sum.monto ?? 0),
    ingresosSemana: Number(pagosSemana._sum.monto ?? 0),
    ingresosMes: Number(pagosMes._sum.monto ?? 0),
    conductoresActivos,
    conductoresDisponibles,
    incidentesAbiertos,
    emergenciasActivas,
    pagoPendiente: Number(pagoPendienteAgg._sum.monto ?? 0),
  }
}
