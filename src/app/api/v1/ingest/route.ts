import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { autenticarApi } from '@/lib/api-auth'
import { ingestaSchema } from '@/core/validators/ingesta'
import { procesarIngesta } from '@/core/services/ingesta.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/ingest
 * Recibe datos del bot (Jelou). Requiere API key con scope INGEST.
 *
 * Body: { "tipo": "usuario|carrera|ubicacion|incidente", "data": { ... } }
 */
export async function POST(req: NextRequest) {
  const auth = await autenticarApi(req, 'INGEST')
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = ingestaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido.', detalles: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const evento = await prisma.eventoIngesta.create({
    data: {
      tipo: parsed.data.tipo,
      apiKeyId: auth.key.id,
      payloadJson: JSON.stringify(body),
    },
  })

  try {
    const resultado = await procesarIngesta(parsed.data)
    await prisma.eventoIngesta.update({
      where: { id: evento.id },
      data: { procesado: true, recursoId: resultado.recursoId },
    })
    return NextResponse.json({
      success: true,
      mensaje: resultado.mensaje,
      recursoId: resultado.recursoId,
    })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error procesando la ingesta.'
    await prisma.eventoIngesta.update({
      where: { id: evento.id },
      data: { error: mensaje },
    })
    return NextResponse.json({ success: false, error: mensaje }, { status: 400 })
  }
}
