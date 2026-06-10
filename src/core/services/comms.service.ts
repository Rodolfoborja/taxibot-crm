import prisma from '@/lib/prisma'

export interface EnviarMensajeInput {
  telefono: string
  texto: string
  nombre?: string | null
  carreraId?: string | null
  adminId?: string | null
}

/**
 * Registra y envía un mensaje saliente al conductor o cliente.
 * Si JELOU_API_URL/JELOU_API_KEY están configurados, intenta enviarlo por ahí;
 * de lo contrario lo deja registrado como PENDIENTE (para wiring posterior del flujo Jelou).
 */
export async function enviarMensaje(input: EnviarMensajeInput) {
  const mensaje = await prisma.mensaje.create({
    data: {
      telefono: input.telefono,
      nombre: input.nombre ?? null,
      texto: input.texto,
      carreraId: input.carreraId ?? null,
      adminId: input.adminId ?? null,
      direccion: 'SALIENTE',
      canal: 'WHATSAPP',
      estado: 'PENDIENTE',
    },
  })

  const url = process.env.JELOU_API_URL
  const key = process.env.JELOU_API_KEY
  if (!url || !key || key.startsWith('your_')) {
    // Sin credenciales reales: queda registrado, pendiente de envío.
    return { ...mensaje, _aviso: 'Mensaje registrado pero no enviado: falta configurar JELOU_API_KEY.' }
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ to: input.telefono, type: 'text', text: input.texto }),
    })
    const ok = res.ok
    return prisma.mensaje.update({
      where: { id: mensaje.id },
      data: { estado: ok ? 'ENVIADO' : 'FALLIDO', error: ok ? null : `HTTP ${res.status}` },
    })
  } catch (err) {
    return prisma.mensaje.update({
      where: { id: mensaje.id },
      data: { estado: 'FALLIDO', error: err instanceof Error ? err.message : 'error de red' },
    })
  }
}

export async function listarMensajes(filtro: { carreraId?: string; telefono?: string }) {
  return prisma.mensaje.findMany({
    where: {
      ...(filtro.carreraId ? { carreraId: filtro.carreraId } : {}),
      ...(filtro.telefono ? { telefono: filtro.telefono } : {}),
    },
    orderBy: { timestamp: 'asc' },
    take: 100,
  })
}
