import { Badge, type BadgeProps } from '@/components/ui/badge'

const MAPA: Record<string, BadgeProps['variant']> = {
  // Conductor
  PENDIENTE: 'warning',
  APROBADO: 'success',
  RECHAZADO: 'danger',
  SUSPENDIDO: 'warning',
  BLOQUEADO: 'danger',
  // Carrera
  BUSCANDO: 'info',
  ASIGNADA: 'info',
  CONDUCTOR_LLEGO: 'info',
  EN_CURSO: 'info',
  COMPLETADA: 'success',
  CANCELADA: 'neutral',
  // Pago
  PROCESANDO: 'info',
  EXITOSO: 'success',
  FALLIDO: 'danger',
  REEMBOLSADO: 'warning',
  // Incidente
  ABIERTO: 'danger',
  EN_REVISION: 'warning',
  RESUELTO: 'success',
  CERRADO: 'neutral',
}

export function EstadoBadge({ estado }: { estado: string }) {
  return <Badge variant={MAPA[estado] ?? 'neutral'}>{estado.replace(/_/g, ' ')}</Badge>
}
