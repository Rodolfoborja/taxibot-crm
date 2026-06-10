'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EstadoBadge } from '@/components/dashboard/estado-badge'
import { ChatPanel } from '@/components/dashboard/chat-panel'
import { formatDate } from '@/lib/utils'

export interface IncidenteVM {
  id: string
  tipo: string
  estado: string
  descripcion: string
  resolucion: string | null
  fecha: string
  reportaNombre: string
  reportaTelefono: string
  carreraId: string | null
}

const ESTADOS = ['EN_REVISION', 'RESUELTO', 'CERRADO'] as const

export function IncidentesClient({ incidentes }: { incidentes: IncidenteVM[] }) {
  const router = useRouter()
  const [sel, setSel] = useState<IncidenteVM | null>(null)
  const [resolucion, setResolucion] = useState('')
  const [guardando, setGuardando] = useState(false)

  function abrir(i: IncidenteVM) {
    setSel(i)
    setResolucion(i.resolucion ?? '')
  }

  async function cambiarEstado(estado: string) {
    if (!sel) return
    setGuardando(true)
    const res = await fetch(`/api/incidentes/${sel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, resolucion }),
    })
    setGuardando(false)
    if (res.ok) {
      setSel({ ...sel, estado, resolucion })
      router.refresh()
    } else {
      alert('No se pudo actualizar el incidente.')
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Reporta</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acción</TableHead>
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
                <TableCell className="text-sm">{i.reportaNombre}</TableCell>
                <TableCell className="max-w-md truncate text-sm text-gray-700">{i.descripcion}</TableCell>
                <TableCell><EstadoBadge estado={i.estado} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(i.fecha)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => abrir(i)}>Atender</Button>
                </TableCell>
              </TableRow>
            ))}
            {incidentes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No hay incidentes. 🎉</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {sel && (
        <div className="fixed inset-0 z-[1000] flex">
          <div className="flex-1 bg-black/30" onClick={() => setSel(null)} />
          <div className="flex h-full w-full max-w-md flex-col border-l bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="font-semibold text-gray-900">{sel.tipo.replace(/_/g, ' ')}</p>
                <p className="text-xs text-muted-foreground">{sel.reportaNombre} · {sel.reportaTelefono}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSel(null)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-3 border-b p-4">
              <p className="text-sm text-gray-700">{sel.descripcion}</p>
              <div><EstadoBadge estado={sel.estado} /></div>
              <textarea
                value={resolucion}
                onChange={(e) => setResolucion(e.target.value)}
                placeholder="Resolución / notas internas…"
                className="h-20 w-full rounded-lg border border-input p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map((e) => (
                  <Button
                    key={e}
                    size="sm"
                    variant={e === 'RESUELTO' ? 'success' : e === 'CERRADO' ? 'secondary' : 'outline'}
                    disabled={guardando}
                    onClick={() => cambiarEstado(e)}
                  >
                    {e === 'EN_REVISION' ? 'En revisión' : e === 'RESUELTO' ? 'Marcar resuelto' : 'Cerrar'}
                  </Button>
                ))}
              </div>
            </div>

            <p className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Responder a {sel.reportaNombre}
            </p>
            <ChatPanel telefono={sel.reportaTelefono} nombre={sel.reportaNombre} carreraId={sel.carreraId} />
          </div>
        </div>
      )}
    </>
  )
}
