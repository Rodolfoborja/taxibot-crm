import { z } from 'zod'

/**
 * Esquemas de validación para la ingesta de datos desde el bot (Jelou).
 * Cada payload se envía a POST /api/v1/ingest con forma { tipo, data }.
 */

export const usuarioIngestaSchema = z.object({
  telefono: z.string().min(7, 'Teléfono inválido'),
  nombre: z.string().min(1),
  tipo: z.enum(['CLIENTE', 'CONDUCTOR']),
  email: z.string().email().optional().nullable(),
  fotoUrl: z.string().url().optional().nullable(),
})

export const carreraIngestaSchema = z.object({
  telefonoCliente: z.string().min(7),
  origenLat: z.number(),
  origenLng: z.number(),
  origenDireccion: z.string().min(1),
  destinoLat: z.number(),
  destinoLng: z.number(),
  destinoDireccion: z.string().min(1),
  distanciaKm: z.number().nonnegative(),
  costoEstimado: z.number().nonnegative(),
  estado: z
    .enum(['BUSCANDO', 'ASIGNADA', 'CONDUCTOR_LLEGO', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'])
    .optional(),
})

export const ubicacionIngestaSchema = z.object({
  telefonoConductor: z.string().min(7),
  lat: z.number(),
  lng: z.number(),
  disponible: z.boolean().optional(),
})

export const incidenteIngestaSchema = z.object({
  carreraId: z.string().min(1),
  telefonoReporta: z.string().min(7),
  tipo: z.enum([
    'PROBLEMA_CONDUCTOR',
    'RUTA_INCORRECTA',
    'COBRO_INDEBIDO',
    'ACCIDENTE',
    'EMERGENCIA',
    'OTRO',
  ]),
  descripcion: z.string().min(1),
  evidenciaUrls: z.array(z.string().url()).optional(),
})

export const ingestaSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('usuario'), data: usuarioIngestaSchema }),
  z.object({ tipo: z.literal('carrera'), data: carreraIngestaSchema }),
  z.object({ tipo: z.literal('ubicacion'), data: ubicacionIngestaSchema }),
  z.object({ tipo: z.literal('incidente'), data: incidenteIngestaSchema }),
])

export type IngestaPayload = z.infer<typeof ingestaSchema>
