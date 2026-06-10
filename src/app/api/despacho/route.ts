import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { carrerasPorAsignar, conductoresParaAsignar } from '@/core/services/despacho.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const [pendientes, conductores] = await Promise.all([carrerasPorAsignar(), conductoresParaAsignar()])
    return NextResponse.json({ pendientes, conductores })
  } catch {
    return NextResponse.json({ pendientes: [], conductores: [] })
  }
}
