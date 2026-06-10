import { Topbar } from '@/components/dashboard/topbar'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EstadoBadge } from '@/components/dashboard/estado-badge'
import { listarPagos } from '@/core/services/dashboard.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PagosPage() {
  let pagos: Awaited<ReturnType<typeof listarPagos>> = []
  let error = false
  try {
    pagos = await listarPagos()
  } catch {
    error = true
  }

  return (
    <>
      <Topbar titulo="Pagos" />
      <main className="flex-1 p-4 md:p-8">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-gray-900">{p.usuario.nombre}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(p.monto))}</TableCell>
                  <TableCell><Badge variant="neutral">{p.metodo}</Badge></TableCell>
                  <TableCell><EstadoBadge estado={p.estado} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.fechaCreacion)}</TableCell>
                </TableRow>
              ))}
              {pagos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    {error ? 'No se pudo conectar a la base de datos.' : 'No hay pagos registrados todavía.'}
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
