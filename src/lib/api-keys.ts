import crypto from 'crypto'
import prisma from './prisma'
import type { ApiKeyScope } from '@prisma/client'

const TOKEN_PREFIX = 'tbk_live_'

/**
 * Genera un token de API nuevo.
 * - `token`: se muestra UNA sola vez al crearlo (nunca se persiste en claro).
 * - `prefijo`: parte visible para identificar la key en la UI.
 * - `hashToken`: SHA-256 del token completo, es lo único que se guarda.
 */
export function generarToken() {
  const random = crypto.randomBytes(24).toString('hex') // 48 chars hex
  const token = `${TOKEN_PREFIX}${random}`
  const prefijo = `${TOKEN_PREFIX}${random.slice(0, 8)}`
  const hashToken = hashTokenValue(token)
  return { token, prefijo, hashToken }
}

export function hashTokenValue(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function crearApiKey(params: {
  nombre: string
  scopes: ApiKeyScope[]
  creadaPorId?: string | null
  expiraEn?: Date | null
}) {
  const { token, prefijo, hashToken } = generarToken()
  const key = await prisma.apiKey.create({
    data: {
      nombre: params.nombre,
      prefijo,
      hashToken,
      scopes: params.scopes,
      creadaPorId: params.creadaPorId ?? null,
      expiraEn: params.expiraEn ?? null,
    },
  })
  // Devolvemos el token en claro SOLO en este momento.
  return { key, token }
}

/**
 * Verifica un token entrante. Devuelve la ApiKey si es válida y vigente,
 * o `null` en caso contrario. Actualiza métricas de uso en background.
 */
export async function verificarApiKey(token: string | null | undefined) {
  if (!token) return null
  const hashToken = hashTokenValue(token.trim())

  const key = await prisma.apiKey.findUnique({ where: { hashToken } })
  if (!key || !key.activa || key.revocada) return null
  if (key.expiraEn && key.expiraEn.getTime() < Date.now()) return null

  // Métricas de uso (no bloqueante)
  prisma.apiKey
    .update({
      where: { id: key.id },
      data: { ultimoUso: new Date(), totalUsos: { increment: 1 } },
    })
    .catch(() => {})

  return key
}

export async function revocarApiKey(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: { revocada: true, activa: false },
  })
}

export async function listarApiKeys() {
  return prisma.apiKey.findMany({
    orderBy: { fechaCreacion: 'desc' },
    include: { creadaPor: { select: { nombre: true, email: true } } },
  })
}
