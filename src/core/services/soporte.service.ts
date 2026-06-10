import prisma from '@/lib/prisma'

export interface ConversacionSoporte {
  telefono: string
  nombre: string | null
  ultimoTexto: string
  ultimaDireccion: string
  timestamp: Date
  sinResponder: boolean
}

/**
 * Bandeja de soporte: una entrada por teléfono, con su último mensaje.
 * `sinResponder` = el último mensaje fue ENTRANTE (espera respuesta del PMA).
 */
export async function bandejaSoporte(): Promise<ConversacionSoporte[]> {
  const recientes = await prisma.mensaje.findMany({
    orderBy: { timestamp: 'desc' },
    take: 300,
  })

  const porTelefono = new Map<string, ConversacionSoporte>()
  for (const m of recientes) {
    if (!porTelefono.has(m.telefono)) {
      porTelefono.set(m.telefono, {
        telefono: m.telefono,
        nombre: m.nombre,
        ultimoTexto: m.texto,
        ultimaDireccion: m.direccion,
        timestamp: m.timestamp,
        sinResponder: m.direccion === 'ENTRANTE',
      })
    }
  }

  return Array.from(porTelefono.values()).sort((a, b) => {
    // sin responder primero, luego por fecha
    if (a.sinResponder !== b.sinResponder) return a.sinResponder ? -1 : 1
    return b.timestamp.getTime() - a.timestamp.getTime()
  })
}
