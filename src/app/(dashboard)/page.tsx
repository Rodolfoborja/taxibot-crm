'use client'

import { useEffect, useState } from 'react'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      setError(null)
      const res = await fetch('/api/stats')
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error fetching stats:', errorMessage)
      setError(errorMessage)
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
          </div>
          <button
            onClick={() => {
              setLoading(true)
              fetchStats()
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard TaxiBot CRM</h1>
        
        {/* Emergencias activas */}
        {stats.emergenciasActivas > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">🚨 ALERTA: </strong>
            <span>{stats.emergenciasActivas} emergencia(s) activa(s) requieren atención inmediata!</span>
          </div>
        )}

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Carreras Hoy */}
          <StatCard
            title="Carreras Hoy"
            value={stats.carrerasHoy}
            icon="🚕"
            color="blue"
          />
          
          {/* Ingresos Hoy */}
          <StatCard
            title="Ingresos Hoy"
            value={`$${stats.ingresosHoy.toFixed(2)}`}
            icon="💵"
            color="green"
          />
          
          {/* Conductores Activos */}
          <StatCard
            title="Conductores Activos"
            value={`${stats.conductoresDisponibles}/${stats.conductoresActivos}`}
            icon="👤"
            color="purple"
          />
          
          {/* Incidentes Abiertos */}
          <StatCard
            title="Incidentes Abiertos"
            value={stats.incidentesAbiertos}
            icon="⚠️"
            color="orange"
          />
        </div>

        {/* Grid de estadísticas semanales/mensuales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Carreras Semana"
            value={stats.carrerasSemana}
            subtitle={`$${stats.ingresosSemana.toFixed(2)}`}
            color="blue"
          />
          
          <StatCard
            title="Carreras Mes"
            value={stats.carrerasMes}
            subtitle={`$${stats.ingresosMes.toFixed(2)}`}
            color="blue"
          />
          
          <StatCard
            title="Pagos Pendientes"
            value={`$${stats.pagoPendiente.toFixed(2)}`}
            color="red"
          />
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Conductores Pendientes"
            description="Revisar documentos y aprobar conductores"
            href="/conductores?estado=PENDIENTE"
            icon="📋"
          />
          
          <QuickActionCard
            title="Incidentes Activos"
            description="Gestionar reportes e incidentes"
            href="/incidentes?estado=ABIERTO"
            icon="🚨"
          />
          
          <QuickActionCard
            title="Monitor de Carreras"
            description="Ver carreras en tiempo real"
            href="/carreras"
            icon="🗺️"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue' 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon?: string
}) {
  return (
    <a
      href={href}
      className="block border rounded-lg p-6 hover:shadow-lg transition bg-white shadow-sm"
    >
      <div className="flex items-start gap-4">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h3 className="font-semibold text-lg mb-1 text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  )
}
