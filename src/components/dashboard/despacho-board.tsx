'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapPin, Clock, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, timeAgo } from '@/lib/utils'

interface Pendiente {
  id: string
  clienteNombre: string
  clienteTelefono: string
  origenDireccion: string
  destinoDireccion: string
  distanciaKm: number
  costoEstimado: number
  fechaSolicitud: string
}
interface Conductor {
  usuarioId: string
  nombre: string
  telefono: string
  placa: string
  rating: number
  disponible: boolean
  porLiberarse: boolean
  estadoActual: string
}

export function DespachoBoard() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const [conductores, setConductores] = useState<Conductor[]>([])
  const [abierto, setAbierto] = useState<string | null>(null)
  const [asignando, setAsignando] = useState(false)

  const cargar = useCallback(async () => {
    const res = await fetch('/api/despacho')
    if (res.ok) {
      const d = await res.json()
      setPendientes(d.pendientes)
      setConductores(d.conductores)
    }
  }, [])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 7000)
    return () => clearInterval(id)
  }, [cargar])

  async function asignar(carreraId: string, conductorUsuarioId: string) {
    setAsignando(true)
    const res = await fetch(`/api/carreras/${carreraId}/asignar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conductorUsuarioId }),
    })
    setAsignando(false)
    if (res.ok) {
      setAbierto(null)
      cargar()
    } else {
      const d = await res.json().catch(() => ({}))
      alert(d.error ?? 'No se pudo asignar.')
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {pendientes.length === 0 && (
        <Card className="lg:col-span-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            🎉 No hay carreras esperando conductor.
          </CardContent>
        </Card>
      )}

      {pendientes.map((p) => (
        <Card key={p.id} className="border-amber-200">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{p.clienteNombre}</p>
                <p className="text-xs text-muted-foreground">{p.clienteTelefono}</p>
              </div>
              <Badge variant="warning">
                <Clock className="mr-1 h-3 w-3" /> Esperando {timeAgo(p.fechaSolicitud)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" /> {p.origenDireccion}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /> {p.destinoDireccion}</p>
              <p className="text-muted-foreground">{p.distanciaKm.toFixed(1)} km · {formatCurrency(p.costoEstimado)}</p>
            </div>

            {abierto === p.id ? (
              <div className="mt-3 space-y-1 rounded-lg border bg-gray-50 p-2">
                <p className="px-1 pb-1 text-xs font-semibold uppercase text-muted-foreground">Elige conductor</p>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {conductores.map((c) => (
                    <button
                      key={c.usuarioId}
                      disabled={asignando}
                      onClick={() => asignar(p.id, c.usuarioId)}
                      className="flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm hover:border-primary disabled:opacity-50"
                    >
                      <span>
                        <span className="font-medium text-gray-900">{c.nombre}</span>
                        <span className="text-xs text-muted-foreground"> · {c.placa} · ⭐{c.rating.toFixed(1)}</span>
                      </span>
                      {c.disponible ? (
                        <Badge variant="success">Libre</Badge>
                      ) : c.porLiberarse ? (
                        <Badge variant="warning">Por liberarse</Badge>
                      ) : (
                        <Badge variant="neutral">Ocupado</Badge>
                      )}
                    </button>
                  ))}
                  {conductores.length === 0 && <p className="p-2 text-center text-sm text-muted-foreground">No hay conductores.</p>}
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setAbierto(null)}>Cancelar</Button>
              </div>
            ) : (
              <Button className="mt-3 w-full" onClick={() => setAbierto(p.id)}>
                <UserPlus className="h-4 w-4" /> Asignar conductor
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
