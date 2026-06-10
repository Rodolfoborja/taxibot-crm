import { NextResponse, type NextRequest } from 'next/server'
import { autenticarApi } from '@/lib/api-auth'
import { accionPmaSchema } from '@/core/validators/pma'
import { ejecutarAccionPma } from '@/core/services/pma.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/pma/ejecutar-accion
 * Ejecuta una acción administrativa PMA. Requiere API key con scope PMA_ACCIONES.
 *
 * Body: { "accion": "reembolsar|bloquear_conductor|desbloquear_usuario|cancelar_carrera_forzada|consultar_gps", ... }
 */
export async function POST(req: NextRequest) {
  const auth = await autenticarApi(req, 'PMA_ACCIONES')
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = accionPmaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Solicitud inválida.', detalles: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    const resultado = await ejecutarAccionPma(parsed.data, {
      adminId: null,
      descripcionOrigen: `api:${auth.key.prefijo}`,
    })
    return NextResponse.json(resultado, { status: resultado.success ? 200 : 400 })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error ejecutando la acción.'
    return NextResponse.json({ success: false, mensaje }, { status: 500 })
  }
}
