import { Topbar } from '@/components/dashboard/topbar'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EstadoBadge } from '@/components/dashboard/estado-badge'
import { listarCarreras } from '@/core/services/dashboard.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CarrerasPage() {
  let carreras: Awaited<ReturnType<typeof listarCarreras>> = []
  let error = false
  try {
    carreras = await listarCarreras()
  } catch {
    error = true
  }

  return (
    <>
      <Topbar titulo="Carreras" />
      <main className="flex-1 p-4 md:p-8">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Solicitada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carreras.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-gray-900">{c.usuario.nombre}</TableCell>
                  <TableCell className="max-w-xs text-sm">
                    <p className="truncate text-gray-700">{c.origenDireccion}</p>
                    <p className="truncate text-muted-foreground">→ {c.destinoDireccion}</p>
                  </TableCell>
                  <TableCell className="text-sm">{c.conductor?.nombre ?? '—'}</TableCell>
                  <TableCell><EstadoBadge estado={c.estado} /></TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(Number(c.costoFinal ?? c.costoEstimado))}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.fechaSolicitud)}</TableCell>
                </TableRow>
              ))}
              {carreras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    {error ? 'No se pudo conectar a la base de datos.' : 'No hay carreras registradas todavía.'}
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
