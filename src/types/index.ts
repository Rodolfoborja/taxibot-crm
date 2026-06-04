import { Prisma } from '@prisma/client'

// ============================================
// Tipos extendidos con relaciones
// ============================================

export type UsuarioConDatos = Prisma.UsuarioGetPayload<{
  include: {
    datoConductor: true
  }
}>

export type ConductorCompleto = Prisma.DatoConductorGetPayload<{
  include: {
    usuario: true
    sanciones: {
      where: { activa: true }
    }
  }
}>

export type CarreraCompleta = Prisma.CarreraGetPayload<{
  include: {
    usuario: true
    conductor: {
      include: {
        datoConductor: true
      }
    }
    pago: true
    calificaciones: true
    incidentes: true
  }
}>

export type IncidenteCompleto = Prisma.IncidenteGetPayload<{
  include: {
    usuario: true
    conductor: {
      include: {
        datoConductor: true
      }
    }
    carrera: true
  }
}>

// ============================================
// DTOs para APIs
// ============================================

export interface DashboardStats {
  carrerasHoy: number
  carrerasSemana: number
  carrerasMes: number
  ingresosHoy: number
  ingresosSemana: number
  ingresosMes: number
  conductoresActivos: number
  conductoresDisponibles: number
  incidentesAbiertos: number
  emergenciasActivas: number
  pagoPendiente: number
}

export interface ConductorPendiente {
  id: string
  nombre: string
  telefono: string
  cedula: string
  placa: string
  fechaRegistro: Date
  fotosCompletas: boolean
}

export interface AccionPMARequest {
  accion: 'reembolsar' | 'bloquear_conductor' | 'desbloquear_usuario' | 'cancelar_carrera_forzada' | 'consultar_gps'
  usuarioId?: string
  conductorId?: string
  carreraId?: string
  monto?: number
  motivo?: string
}

export interface AccionPMAResponse {
  success: boolean
  mensaje: string
  resultado?: any
}

export interface NotificacionWhatsApp {
  to: string
  mensaje: string
  botones?: { text: string; action?: string }[]
}

// ============================================
// Filtros y Queries
// ============================================

export interface FiltroCarreras {
  estado?: string[]
  fechaDesde?: Date
  fechaHasta?: Date
  usuarioId?: string
  conductorId?: string
  limite?: number
  offset?: number
}

export interface FiltroIncidentes {
  estado?: string[]
  tipo?: string[]
  fechaDesde?: Date
  fechaHasta?: Date
  limite?: number
  offset?: number
}

export interface FiltroConductores {
  estado?: string[]
  disponible?: boolean
  busqueda?: string
  limite?: number
  offset?: number
}
