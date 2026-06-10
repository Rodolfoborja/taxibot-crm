import { NextResponse } from 'next/server'
import { obtenerStats, EMPTY_STATS } from '@/core/services/stats.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await obtenerStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[stats] Error de base de datos:', error)
    return NextResponse.json({
      ...EMPTY_STATS,
      error: 'Base de datos no disponible. Mostrando datos en cero.',
    })
  }
}
