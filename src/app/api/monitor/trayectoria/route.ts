import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trayectoria } from '@/core/services/monitor.service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const conductorId = req.nextUrl.searchParams.get('conductorId')
  if (!conductorId) return NextResponse.json({ error: 'Falta conductorId' }, { status: 400 })

  const data = await trayectoria(conductorId)
  if (!data) return NextResponse.json({ error: 'Conductor no encontrado' }, { status: 404 })
  return NextResponse.json(data)
}
