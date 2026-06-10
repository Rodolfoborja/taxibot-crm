import { z } from 'zod'

/**
 * Acciones PMA que el bot (o un operador) puede solicitar al CRM.
 * POST /api/v1/pma/ejecutar-accion
 */
export const accionPmaSchema = z
  .object({
    accion: z.enum([
      'reembolsar',
      'bloquear_conductor',
      'desbloquear_usuario',
      'cancelar_carrera_forzada',
      'consultar_gps',
    ]),
    usuarioId: z.string().optional(),
    conductorId: z.string().optional(),
    carreraId: z.string().optional(),
    monto: z.number().positive().optional(),
    motivo: z.string().optional(),
  })
  .refine(
    (d) => {
      switch (d.accion) {
        case 'reembolsar':
          return !!d.carreraId
        case 'bloquear_conductor':
        case 'consultar_gps':
          return !!d.conductorId
        case 'desbloquear_usuario':
          return !!d.usuarioId
        case 'cancelar_carrera_forzada':
          return !!d.carreraId
        default:
          return false
      }
    },
    { message: 'Faltan parámetros requeridos para la acción solicitada.' }
  )

export type AccionPmaInput = z.infer<typeof accionPmaSchema>
