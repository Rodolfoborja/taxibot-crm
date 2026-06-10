'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Trash2, Copy, Check, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const SCOPES = [
  { value: 'INGEST', label: 'Ingesta de datos', desc: 'Enviar carreras, usuarios, GPS, incidentes' },
  { value: 'PMA_ACCIONES', label: 'Acciones PMA', desc: 'Bloquear, reembolsar, cancelar, consultar GPS' },
  { value: 'LECTURA', label: 'Lectura', desc: 'Consultar datos y estadísticas' },
] as const

interface ApiKey {
  id: string
  nombre: string
  prefijo: string
  scopes: string[]
  activa: boolean
  revocada: boolean
  ultimoUso: string | null
  totalUsos: number
  fechaCreacion: string
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('')
  const [scopes, setScopes] = useState<string[]>(['INGEST'])
  const [creando, setCreando] = useState(false)
  const [nuevoToken, setNuevoToken] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function cargar() {
    setLoading(true)
    const res = await fetch('/api/keys')
    if (res.ok) setKeys(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  function toggleScope(s: string) {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre || scopes.length === 0) return
    setCreando(true)
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, scopes }),
    })
    setCreando(false)
    if (res.ok) {
      const data = await res.json()
      setNuevoToken(data.token)
      setNombre('')
      setScopes(['INGEST'])
      cargar()
    } else {
      alert('No se pudo crear la API key.')
    }
  }

  async function revocar(id: string) {
    if (!confirm('¿Revocar esta API key? El bot dejará de poder usarla de inmediato.')) return
    await fetch(`/api/keys/${id}`, { method: 'DELETE' })
    cargar()
  }

  function copiar() {
    if (!nuevoToken) return
    navigator.clipboard.writeText(nuevoToken)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Token recién creado */}
      {nuevoToken && (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <ShieldAlert className="h-5 w-5" />
              Copia tu token ahora — no se volverá a mostrar.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-lg border bg-white px-3 py-2 text-sm">{nuevoToken}</code>
              <Button size="sm" onClick={copiar}>
                {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiado ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setNuevoToken(null)}>
              Entendido, cerrar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Crear nueva */}
      <Card>
        <CardHeader>
          <CardTitle>Crear nueva API key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={crear} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre descriptivo</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Bot Jelou Producción"
              />
            </div>
            <div className="space-y-2">
              <Label>Permisos (scopes)</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {SCOPES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    onClick={() => toggleScope(s.value)}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      scopes.includes(s.value)
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={creando || !nombre || scopes.length === 0}>
              <KeyRound className="h-4 w-4" />
              {creando ? 'Generando…' : 'Generar API key'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>API keys existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-muted-foreground">Cargando…</p>
          ) : keys.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">No hay API keys creadas todavía.</p>
          ) : (
            <ul className="divide-y">
              {keys.map((k) => (
                <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{k.nombre}</p>
                      {k.revocada ? (
                        <Badge variant="danger">Revocada</Badge>
                      ) : (
                        <Badge variant="success">Activa</Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{k.prefijo}…</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <Badge key={s} variant="info">{s}</Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {k.totalUsos} usos · creada {formatDate(k.fechaCreacion)}
                      {k.ultimoUso ? ` · último uso ${formatDate(k.ultimoUso)}` : ''}
                    </p>
                  </div>
                  {!k.revocada && (
                    <Button variant="destructive" size="sm" onClick={() => revocar(k.id)}>
                      <Trash2 className="h-4 w-4" /> Revocar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
