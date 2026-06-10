import Link from 'next/link'
import { Car, DollarSign, Contact, AlertTriangle, CreditCard, Users, ArrowRight } from 'lucide-react'
import { Topbar } from '@/components/dashboard/topbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { obtenerStats, EMPTY_STATS } from '@/core/services/stats.service'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let stats = EMPTY_STATS
  let error: string | null = null
  try {
    stats = await obtenerStats()
  } catch {
    error = 'No se pudo conectar a la base de datos. Mostrando datos en cero.'
  }

  return (
    <>
      <Topbar titulo="Dashboard" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ {error}
          </div>
        )}

        {stats.emergenciasActivas > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-700">
            <AlertTriangle className="h-5 w-5" />
            🚨 {stats.emergenciasActivas} emergencia(s) activa(s) — requieren atención inmediata.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Carreras hoy" value={stats.carrerasHoy} icon={Car} subtitle={`${stats.carrerasSemana} esta semana`} />
          <StatCard title="Ingresos hoy" value={formatCurrency(stats.ingresosHoy)} icon={DollarSign} accent="text-emerald-600" subtitle={`${formatCurrency(stats.ingresosMes)} este mes`} />
          <StatCard title="Conductores activos" value={`${stats.conductoresDisponibles}/${stats.conductoresActivos}`} icon={Contact} accent="text-blue-600" subtitle="disponibles / activos" />
          <StatCard title="Incidentes abiertos" value={stats.incidentesAbiertos} icon={AlertTriangle} accent="text-amber-600" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Carreras este mes" value={stats.carrerasMes} subtitle={formatCurrency(stats.ingresosMes)} />
          <StatCard title="Pagos pendientes" value={formatCurrency(stats.pagoPendiente)} icon={CreditCard} accent="text-purple-600" />
          <StatCard title="Emergencias activas" value={stats.emergenciasActivas} icon={AlertTriangle} accent="text-red-600" />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Accesos rápidos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink href="/conductores" label="Conductores" desc="Aprobar y gestionar" icon={Contact} />
            <QuickLink href="/carreras" label="Carreras" desc="Monitor de viajes" icon={Car} />
            <QuickLink href="/incidentes" label="Incidentes" desc="Reportes y emergencias" icon={AlertTriangle} />
            <QuickLink href="/usuarios" label="Usuarios" desc="Clientes y conductores" icon={Users} />
          </div>
        </div>
      </main>
    </>
  )
}

function QuickLink({
  href,
  label,
  desc,
  icon: Icon,
}: {
  href: string
  label: string
  desc: string
  icon: typeof Car
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-5">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </CardContent>
      </Card>
    </Link>
  )
}
