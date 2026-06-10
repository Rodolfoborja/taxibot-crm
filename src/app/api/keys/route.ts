import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { crearApiKey, listarApiKeys } from '@/lib/api-keys'

export const dynamic = 'force-dynamic'

const crearSchema = z.object({
  nombre: z.string().min(2, 'Nombre demasiado corto'),
  scopes: z.array(z.enum(['INGEST', 'PMA_ACCIONES', 'LECTURA'])).min(1, 'Selecciona al menos un permiso'),
  expiraEn: z.string().datetime().optional().nullable(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const keys = await listarApiKeys()
  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = crearSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { key, token } = await crearApiKey({
    nombre: parsed.data.nombre,
    scopes: parsed.data.scopes,
    creadaPorId: (session.user as { id?: string })?.id ?? null,
    expiraEn: parsed.data.expiraEn ? new Date(parsed.data.expiraEn) : null,
  })

  // El token completo se devuelve UNA sola vez.
  return NextResponse.json({ key, token }, { status: 201 })
}
