import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { conductoresEnVivo } from '@/core/services/monitor.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    return NextResponse.json(await conductoresEnVivo())
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
