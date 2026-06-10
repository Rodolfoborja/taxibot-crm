import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { asignarConductor } from '@/core/services/despacho.service'

export const dynamic = 'force-dynamic'

const schema = z.object({ conductorUsuarioId: z.string().min(1) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Falta conductorUsuarioId' }, { status: 422 })

  try {
    const carrera = await asignarConductor(
      params.id,
      parsed.data.conductorUsuarioId,
      (session.user as { id?: string })?.id ?? null
    )
    return NextResponse.json({ success: true, carrera })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error al asignar.' },
      { status: 400 }
    )
  }
}
