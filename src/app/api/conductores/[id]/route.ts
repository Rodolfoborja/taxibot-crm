import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { aprobarConductor, rechazarConductor } from '@/core/services/conductores.service'

export const dynamic = 'force-dynamic'

const accionSchema = z.discriminatedUnion('accion', [
  z.object({ accion: z.literal('aprobar') }),
  z.object({ accion: z.literal('rechazar'), motivo: z.string().min(3) }),
])

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = accionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Acción inválida', detalles: parsed.error.flatten() }, { status: 422 })
  }

  const adminId = (session.user as { id?: string })?.id ?? null

  try {
    const resultado =
      parsed.data.accion === 'aprobar'
        ? await aprobarConductor(params.id, adminId)
        : await rechazarConductor(params.id, parsed.data.motivo, adminId)
    return NextResponse.json({ success: true, conductor: resultado })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error en la operación.'
    return NextResponse.json({ success: false, error: mensaje }, { status: 400 })
  }
}
