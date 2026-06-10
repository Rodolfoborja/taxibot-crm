import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { enviarMensaje, listarMensajes } from '@/core/services/comms.service'

export const dynamic = 'force-dynamic'

const enviarSchema = z.object({
  telefono: z.string().min(7),
  texto: z.string().min(1),
  nombre: z.string().optional().nullable(),
  carreraId: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const carreraId = req.nextUrl.searchParams.get('carreraId') ?? undefined
  const telefono = req.nextUrl.searchParams.get('telefono') ?? undefined
  return NextResponse.json(await listarMensajes({ carreraId, telefono }))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = enviarSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 422 })
  }

  const mensaje = await enviarMensaje({
    ...parsed.data,
    adminId: (session.user as { id?: string })?.id ?? null,
  })
  return NextResponse.json(mensaje, { status: 201 })
}
