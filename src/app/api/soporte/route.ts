import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bandejaSoporte } from '@/core/services/soporte.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    return NextResponse.json(await bandejaSoporte())
  } catch {
    return NextResponse.json([])
  }
}
