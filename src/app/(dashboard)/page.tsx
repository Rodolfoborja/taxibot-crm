'use client'

import { useEffect, useState } from 'react'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error al cargar estadísticas</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard TaxiBot CRM</h1>
      
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
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
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
      className="block border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
    >
      <div className="flex items-start gap-4">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  )
}
