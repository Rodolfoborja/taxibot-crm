import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cacheGet, cacheSet } from '@/lib/redis'
import { DashboardStats } from '@/types'

const CACHE_TTL = 60 // 1 minuto

export async function GET() {
  try {
    // Intentar obtener de cache (no crítico si falla)
    try {
      const cached = await cacheGet<DashboardStats>('dashboard:stats')
      if (cached) {
        return NextResponse.json(cached)
      }
    } catch (cacheError) {
      console.warn('Redis cache error, continuing without cache:', cacheError)
    }

    const now = new Date()
    const inicioHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const inicioSemana = new Date(now)
    inicioSemana.setDate(now.getDate() - now.getDay())
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)

    // Carreras
    const [carrerasHoy, carrerasSemana, carrerasMes] = await Promise.all([
      prisma.carrera.count({
        where: { fechaSolicitud: { gte: inicioHoy } }
      }),
      prisma.carrera.count({
        where: { fechaSolicitud: { gte: inicioSemana } }
      }),
      prisma.carrera.count({
        where: { fechaSolicitud: { gte: inicioMes } }
      }),
    ])

    // Ingresos (pagos exitosos)
    const [pagosHoy, pagosSemana, pagosMes] = await Promise.all([
      prisma.pago.aggregate({
        where: {
          estado: 'EXITOSO',
          fechaConfirmacion: { gte: inicioHoy }
        },
        _sum: { monto: true }
      }),
      prisma.pago.aggregate({
        where: {
          estado: 'EXITOSO',
          fechaConfirmacion: { gte: inicioSemana }
        },
        _sum: { monto: true }
      }),
      prisma.pago.aggregate({
        where: {
          estado: 'EXITOSO',
          fechaConfirmacion: { gte: inicioMes }
        },
        _sum: { monto: true }
      }),
    ])

    // Conductores
    const [conductoresActivos, conductoresDisponibles] = await Promise.all([
      prisma.datoConductor.count({
        where: {
          estado: 'APROBADO',
          gpsActivo: true
        }
      }),
      prisma.datoConductor.count({
        where: {
          estado: 'APROBADO',
          disponible: true,
          gpsActivo: true
        }
      }),
    ])

    // Incidentes y emergencias
    const [incidentesAbiertos, emergenciasActivas] = await Promise.all([
      prisma.incidente.count({
        where: {
          estado: { in: ['ABIERTO', 'EN_REVISION'] }
        }
      }),
      prisma.incidente.count({
        where: {
          tipo: 'EMERGENCIA',
          estado: { in: ['ABIERTO', 'EN_REVISION'] }
        }
      }),
    ])

    // Pagos pendientes
    const pagoPendienteAgg = await prisma.pago.aggregate({
      where: { estado: 'PENDIENTE' },
      _sum: { monto: true }
    })

    const stats: DashboardStats = {
      carrerasHoy,
      carrerasSemana,
      carrerasMes,
      ingresosHoy: Number(pagosHoy._sum.monto || 0),
      ingresosSemana: Number(pagosSemana._sum.monto || 0),
      ingresosMes: Number(pagosMes._sum.monto || 0),
      conductoresActivos,
      conductoresDisponibles,
      incidentesAbiertos,
      emergenciasActivas,
      pagoPendiente: Number(pagoPendienteAgg._sum.monto || 0),
    }

    // Guardar en cache (no crítico si falla)
    try {
      await cacheSet('dashboard:stats', stats, CACHE_TTL)
    } catch (cacheError) {
      console.warn('Failed to cache stats:', cacheError)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
