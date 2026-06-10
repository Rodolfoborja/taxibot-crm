import { Topbar } from '@/components/dashboard/topbar'
import { Card } from '@/components/ui/card'
import { IncidentesClient, type IncidenteVM } from '@/components/dashboard/incidentes-client'
import { listarIncidentes } from '@/core/services/dashboard.service'

export const dynamic = 'force-dynamic'

export default async function IncidentesPage() {
  let incidentes: IncidenteVM[] = []
  let error = false
  try {
    const data = await listarIncidentes()
    incidentes = data.map((i) => ({
      id: i.id,
      tipo: i.tipo,
      estado: i.estado,
      descripcion: i.descripcion,
      resolucion: i.resolucion,
      fecha: i.fechaCreacion.toISOString(),
      reportaNombre: i.usuario.nombre,
      reportaTelefono: i.usuario.telefono,
      carreraId: i.carreraId,
    }))
  } catch {
    error = true
  }

  return (
    <>
      <Topbar titulo="Incidentes y soporte" />
      <main className="flex-1 p-4 md:p-8">
        {error ? (
          <Card className="py-12 text-center text-muted-foreground">No se pudo conectar a la base de datos.</Card>
        ) : (
          <IncidentesClient incidentes={incidentes} />
        )}
      </main>
    </>
  )
}
