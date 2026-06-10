import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { actualizarIncidente } from '@/core/services/incidentes.service'

export const dynamic = 'force-dynamic'

const schema = z.object({
  estado: z.enum(['ABIERTO', 'EN_REVISION', 'RESUELTO', 'CERRADO']),
  resolucion: z.string().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 422 })
  }

  try {
    const incidente = await actualizarIncidente(params.id, parsed.data, (session.user as { id?: string })?.id ?? null)
    return NextResponse.json({ success: true, incidente })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
