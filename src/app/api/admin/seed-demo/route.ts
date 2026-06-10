import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { seedDemo, limpiarDemo } from '@/core/services/demo.service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/seed-demo        → inserta datos de demo
 * POST /api/admin/seed-demo?limpiar=1 → solo limpia los datos de demo
 * Protegido por sesión (operador PMA).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    if (req.nextUrl.searchParams.get('limpiar') === '1') {
      await limpiarDemo()
      return NextResponse.json({ success: true, mensaje: 'Datos de demo eliminados.' })
    }
    const resultado = await seedDemo()
    return NextResponse.json({ success: true, ...resultado })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error en el seed.'
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 })
  }
}
