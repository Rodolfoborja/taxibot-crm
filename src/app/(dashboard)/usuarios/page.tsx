import { Topbar } from '@/components/dashboard/topbar'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { listarUsuarios } from '@/core/services/dashboard.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  let usuarios: Awaited<ReturnType<typeof listarUsuarios>> = []
  let error = false
  try {
    usuarios = await listarUsuarios()
  } catch {
    error = true
  }

  return (
    <>
      <Topbar titulo="Usuarios" />
      <main className="flex-1 p-4 md:p-8">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Deuda</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-gray-900">{u.nombre}</TableCell>
                  <TableCell className="text-sm font-mono">{u.telefono}</TableCell>
                  <TableCell>
                    <Badge variant={u.tipo === 'CONDUCTOR' ? 'info' : 'neutral'}>{u.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.bloqueado ? <Badge variant="danger">Bloqueado</Badge> : <Badge variant="success">Activo</Badge>}
                  </TableCell>
                  <TableCell className="text-sm">{formatCurrency(Number(u.deudaPendiente))}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(u.fechaRegistro)}</TableCell>
                </TableRow>
              ))}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    {error ? 'No se pudo conectar a la base de datos.' : 'No hay usuarios registrados todavía.'}
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
