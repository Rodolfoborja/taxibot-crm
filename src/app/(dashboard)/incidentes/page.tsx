import { Topbar } from '@/components/dashboard/topbar'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EstadoBadge } from '@/components/dashboard/estado-badge'
import { listarIncidentes } from '@/core/services/dashboard.service'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function IncidentesPage() {
  let incidentes: Awaited<ReturnType<typeof listarIncidentes>> = []
  let error = false
  try {
    incidentes = await listarIncidentes()
  } catch {
    error = true
  }

  return (
    <>
      <Topbar titulo="Incidentes" />
      <main className="flex-1 p-4 md:p-8">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Reporta</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentes.map((i) => (
                <TableRow key={i.id} className={i.tipo === 'EMERGENCIA' ? 'bg-red-50/60' : ''}>
                  <TableCell>
                    {i.tipo === 'EMERGENCIA' ? (
                      <Badge variant="danger">🚨 EMERGENCIA</Badge>
                    ) : (
                      <Badge variant="neutral">{i.tipo.replace(/_/g, ' ')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{i.usuario.nombre}</TableCell>
                  <TableCell className="max-w-md truncate text-sm text-gray-700">{i.descripcion}</TableCell>
                  <TableCell><EstadoBadge estado={i.estado} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(i.fechaCreacion)}</TableCell>
                </TableRow>
              ))}
              {incidentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    {error ? 'No se pudo conectar a la base de datos.' : 'No hay incidentes registrados. 🎉'}
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
