import { NextResponse, type NextRequest } from 'next/server'
import type { ApiKey, ApiKeyScope } from '@prisma/client'
import { verificarApiKey } from './api-keys'

export type ApiAuthResult =
  | { ok: true; key: ApiKey }
  | { ok: false; response: NextResponse }

/**
 * Autentica una petición a la API pública (v1) mediante API key.
 * Acepta el token en el header `Authorization: Bearer <token>` o `X-API-Key`.
 * Si se pasa `scope`, valida además que la key tenga ese permiso.
 */
export async function autenticarApi(
  req: NextRequest,
  scope?: ApiKeyScope
): Promise<ApiAuthResult> {
  const authHeader = req.headers.get('authorization')
  const xApiKey = req.headers.get('x-api-key')
  const token = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : xApiKey?.trim() ?? null

  const key = await verificarApiKey(token)
  if (!key) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'API key ausente, inválida, expirada o revocada.' },
        { status: 401 }
      ),
    }
  }

  if (scope && !key.scopes.includes(scope)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `La API key no tiene el permiso requerido: ${scope}.` },
        { status: 403 }
      ),
    }
  }

  return { ok: true, key }
}
