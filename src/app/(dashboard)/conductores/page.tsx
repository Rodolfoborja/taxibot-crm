import { Topbar } from '@/components/dashboard/topbar'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EstadoBadge } from '@/components/dashboard/estado-badge'
import { ConductorAcciones } from '@/components/dashboard/conductor-acciones'
import { listarConductores } from '@/core/services/dashboard.service'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ConductoresPage() {
  let conductores: Awaited<ReturnType<typeof listarConductores>> = []
  let error = false
  try {
    conductores = await listarConductores()
  } catch {
    error = true
  }

  return (
    <>
      <Topbar titulo="Conductores" />
      <main className="flex-1 p-4 md:p-8">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conductor</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductores.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{c.usuario.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.usuario.telefono}</p>
                  </TableCell>
                  <TableCell className="text-sm">{c.cedula}</TableCell>
                  <TableCell className="text-sm font-mono">{c.placa}</TableCell>
                  <TableCell><EstadoBadge estado={c.estado} /></TableCell>
                  <TableCell className="text-sm">⭐ {Number(c.ratingPromedio).toFixed(1)} · {c.totalViajes} viajes</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.usuario.fechaRegistro)}</TableCell>
                  <TableCell className="text-right">
                    {c.estado === 'PENDIENTE' ? (
                      <ConductorAcciones conductorId={c.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {conductores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    {error
                      ? 'No se pudo conectar a la base de datos.'
                      : 'No hay conductores registrados todavía.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </>
  )
}
