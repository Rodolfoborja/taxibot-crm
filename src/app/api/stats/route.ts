import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const EMPTY_STATS = {
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

export async function GET() {
  try {
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`

    const now = new Date()
    const inicioHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const inicioSemana = new Date(now)
    inicioSemana.setDate(now.getDate() - now.getDay())
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)

    // Carreras
    const [carrerasHoy, carrerasSemana, carrerasMes] = await Promise.all([
      prisma.carrera.count({ where: { fechaSolicitud: { gte: inicioHoy } } }),
      prisma.carrera.count({ where: { fechaSolicitud: { gte: inicioSemana } } }),
      prisma.carrera.count({ where: { fechaSolicitud: { gte: inicioMes } } }),
    ])

    // Ingresos
    const [pagosHoy, pagosSemana, pagosMes] = await Promise.all([
      prisma.pago.aggregate({
        where: { estado: 'EXITOSO', fechaConfirmacion: { gte: inicioHoy } },
        _sum: { monto: true }
      }),
      prisma.pago.aggregate({
        where: { estado: 'EXITOSO', fechaConfirmacion: { gte: inicioSemana } },
        _sum: { monto: true }
      }),
      prisma.pago.aggregate({
        where: { estado: 'EXITOSO', fechaConfirmacion: { gte: inicioMes } },
        _sum: { monto: true }
      }),
    ])

    // Conductores
    const [conductoresActivos, conductoresDisponibles] = await Promise.all([
      prisma.datoConductor.count({
        where: { estado: 'APROBADO', gpsActivo: true }
      }),
      prisma.datoConductor.count({
        where: { estado: 'APROBADO', disponible: true, gpsActivo: true }
      }),
    ])

    // Incidentes
    const [incidentesAbiertos, emergenciasActivas] = await Promise.all([
      prisma.incidente.count({
        where: { estado: { in: ['ABIERTO', 'EN_REVISION'] } }
      }),
      prisma.incidente.count({
        where: { tipo: 'EMERGENCIA', estado: { in: ['ABIERTO', 'EN_REVISION'] } }
      }),
    ])

    // Pagos pendientes
    const pagoPendienteAgg = await prisma.pago.aggregate({
      where: { estado: 'PENDIENTE' },
      _sum: { monto: true }
    })

    const stats = {
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

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Database error:', error)
    
    // Return empty stats instead of error to allow UI to load
    return NextResponse.json({
      ...EMPTY_STATS,
      error: 'Base de datos no disponible. Mostrando datos de ejemplo.'
    })
  }
}
