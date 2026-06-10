'use client'

import { useEffect, useState } from 'react'

interface Stats {
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setError(null)
      const res = await fetch('/api/stats')
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo conectar al servidor`)
      }
      
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error:', errorMessage)
      setError(errorMessage)
      // Usar datos de ejemplo si falla
      setStats({
        carrerasHoy: 0,
        carrerasSemana: 0,
        carrerasMes: 0,
        ingresosHoy: 0,
        ingresosSemana: 0,
        ingresosMes: 0,
        conductoresActivos: 0,
        conductoresDisponibles: 0,
        incidentesAbiertos: 0,
        emergenciasActivas: 0,
        pagoPendiente: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-xl text-gray-600">Cargando TaxiBot CRM...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            🚕 TaxiBot CRM
          </h1>
          <p className="text-gray-600">
            Sistema de gestión para operadores PMA
          </p>
          {error && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <strong>⚠️ Advertencia:</strong> {error}
              <br />
              <span className="text-sm">Mostrando datos de ejemplo.</span>
            </div>
          )}
        </div>

        {/* Emergencias activas */}
        {stats && stats.emergenciasActivas > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">🚨 ALERTA: </strong>
            <span>{stats.emergenciasActivas} emergencia(s) activa(s)</span>
          </div>
        )}

        {/* Grid de estadísticas */}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Carreras Hoy" value={stats.carrerasHoy} icon="🚕" />
              <StatCard title="Ingresos Hoy" value={`$${stats.ingresosHoy.toFixed(2)}`} icon="💵" />
              <StatCard title="Conductores" value={`${stats.conductoresDisponibles}/${stats.conductoresActivos}`} icon="👤" />
              <StatCard title="Incidentes" value={stats.incidentesAbiertos} icon="⚠️" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard 
                title="Carreras Semana" 
                value={stats.carrerasSemana}
                subtitle={`$${stats.ingresosSemana.toFixed(2)}`}
              />
              <StatCard 
                title="Carreras Mes" 
                value={stats.carrerasMes}
                subtitle={`$${stats.ingresosMes.toFixed(2)}`}
              />
              <StatCard 
                title="Pagos Pendientes" 
                value={`$${stats.pagoPendiente.toFixed(2)}`}
              />
            </div>
          </>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickCard
            title="Conductores"
            description="Gestionar conductores"
            icon="📋"
          />
          <QuickCard
            title="Incidentes"
            description="Ver reportes activos"
            icon="🚨"
          />
          <QuickCard
            title="Carreras"
            description="Monitor en tiempo real"
            icon="🗺️"
          />
        </div>

        {/* Estado del sistema */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Estado del Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>✅ App: Running</div>
            <div>{stats ? '✅' : '⚠️'} API: {stats ? 'OK' : 'Error'}</div>
            <div>🔄 Versión: 1.0.0</div>
            <div>📅 {new Date().toLocaleDateString('es-EC')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon?: string
}) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs md:text-sm font-medium text-gray-600">{title}</h3>
        {icon && <span className="text-xl md:text-2xl">{icon}</span>}
      </div>
      <div className="text-xl md:text-2xl font-bold text-gray-800">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

function QuickCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: string
}) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}
