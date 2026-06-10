'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Send, X, Navigation, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/utils'

const CENTRO: [number, number] = [-2.170998, -79.922359] // Guayaquil

interface Conductor {
  conductorId: string
  nombre: string
  telefono: string
  placa: string
  estado: string
  disponible: boolean
  lat: number | null
  lng: number | null
  ultimaActualizacion: string | null
  ratingPromedio: number
  carreraActivaId: string | null
  carreraEstado: string | null
  clienteNombre: string | null
  clienteTelefono: string | null
}

interface Mensaje {
  id: string
  telefono: string
  direccion: string
  texto: string
  estado: string
  timestamp: string
}

/** Pin con emoji estilo "gota" (Leaflet divIcon). */
function pinIcon(emoji: string, bg: string) {
  return L.divIcon({
    className: 'taxibot-pin',
    html: `<div style="background:${bg};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center">
             <span style="transform:rotate(45deg);font-size:15px;line-height:1">${emoji}</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })
}

/** Reencuadra el mapa cuando cambian los conductores (solo la 1ª vez con datos). */
function AutoFit({ conductores }: { conductores: Conductor[] }) {
  const map = useMap()
  const hecho = useRef(false)
  useEffect(() => {
    if (hecho.current) return
    const pts = conductores.filter((c) => c.lat && c.lng).map((c) => [c.lat!, c.lng!] as [number, number])
    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [50, 50], maxZoom: 14 })
      hecho.current = true
    }
  }, [conductores, map])
  return null
}

export default function MapaLive() {
  const [conductores, setConductores] = useState<Conductor[]>([])
  const [sel, setSel] = useState<Conductor | null>(null)
  const [ruta, setRuta] = useState<[number, number][]>([])
  const [extremos, setExtremos] = useState<{ origen: any; destino: any } | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [dest, setDest] = useState<'conductor' | 'cliente'>('conductor')

  // Destinatario actual de la comunicación
  const destTelefono = dest === 'cliente' ? sel?.clienteTelefono ?? null : sel?.telefono ?? null
  const destNombre = dest === 'cliente' ? sel?.clienteNombre ?? 'Cliente' : sel?.nombre ?? 'Conductor'

  const iconos = useMemo(
    () => ({
      taxiAzul: pinIcon('🚕', '#2563eb'),
      taxiVerde: pinIcon('🚕', '#16a34a'),
      taxiGris: pinIcon('🚕', '#9ca3af'),
      cliente: pinIcon('🧍', '#0ea5e9'),
      destino: pinIcon('🏁', '#dc2626'),
    }),
    []
  )

  // Polling de conductores
  useEffect(() => {
    let activo = true
    const cargar = async () => {
      const res = await fetch('/api/monitor/conductores')
      if (res.ok && activo) setConductores(await res.json())
    }
    cargar()
    const id = setInterval(cargar, 5000)
    return () => {
      activo = false
      clearInterval(id)
    }
  }, [])

  // Polling de trayectoria + mensajes del conductor seleccionado
  useEffect(() => {
    if (!sel) {
      setRuta([])
      setExtremos(null)
      setMensajes([])
      return
    }
    let activo = true
    const phone = dest === 'cliente' ? sel.clienteTelefono : sel.telefono
    const cargar = async () => {
      const [tr, ms] = await Promise.all([
        fetch(`/api/monitor/trayectoria?conductorId=${sel.conductorId}`).then((r) => (r.ok ? r.json() : null)),
        phone
          ? fetch(`/api/comunicacion?telefono=${encodeURIComponent(phone)}`).then((r) => (r.ok ? r.json() : []))
          : Promise.resolve([]),
      ])
      if (!activo) return
      if (tr) {
        setRuta((tr.puntos ?? []).map((p: any) => [p.lat, p.lng]))
        setExtremos({ origen: tr.origen, destino: tr.destino })
      }
      setMensajes(ms ?? [])
    }
    cargar()
    const id = setInterval(cargar, 4000)
    return () => {
      activo = false
      clearInterval(id)
    }
  }, [sel, dest])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!sel || !texto.trim() || !destTelefono) return
    setEnviando(true)
    await fetch('/api/comunicacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono: destTelefono, nombre: destNombre, texto, carreraId: sel.carreraActivaId }),
    })
    setTexto('')
    setEnviando(false)
    const ms = await fetch(`/api/comunicacion?telefono=${encodeURIComponent(destTelefono)}`).then((r) => r.json())
    setMensajes(ms)
  }

  const disponibles = conductores.filter((c) => c.disponible).length
  const enCarrera = conductores.filter((c) => c.carreraActivaId).length

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {/* Resumen flotante */}
      <div className="absolute left-4 top-4 z-[1000] flex gap-2 rounded-lg bg-white/95 px-4 py-2 text-sm shadow-md">
        <span className="flex items-center gap-1"><Circle className="h-3 w-3 fill-green-600 text-green-600" /> {disponibles} disponibles</span>
        <span className="flex items-center gap-1"><Circle className="h-3 w-3 fill-blue-600 text-blue-600" /> {enCarrera} en carrera</span>
        <span className="text-muted-foreground">· {conductores.length} con GPS</span>
      </div>

      <MapContainer center={CENTRO} zoom={13} className="h-full w-full" style={{ zIndex: 0 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFit conductores={conductores} />

        {conductores.map((c) =>
          c.lat && c.lng ? (
            <Marker
              key={c.conductorId}
              position={[c.lat, c.lng]}
              icon={c.carreraActivaId ? iconos.taxiAzul : c.disponible ? iconos.taxiVerde : iconos.taxiGris}
              eventHandlers={{ click: () => { setSel(c); setDest('conductor') } }}
            >
              <Popup>
                <strong>🚕 {c.nombre}</strong> · {c.placa}
                <br />
                {c.carreraEstado ? `En carrera (${c.carreraEstado})` : c.disponible ? 'Disponible' : 'Ocupado'}
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Trayectoria del seleccionado */}
        {ruta.length > 1 && <Polyline positions={ruta} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }} />}
        {extremos?.origen && (
          <Marker position={[extremos.origen.lat, extremos.origen.lng]} icon={iconos.cliente}>
            <Popup>👤 Cliente / Origen: {extremos.origen.direccion}</Popup>
          </Marker>
        )}
        {extremos?.destino && (
          <Marker position={[extremos.destino.lat, extremos.destino.lng]} icon={iconos.destino}>
            <Popup>🏁 Destino: {extremos.destino.direccion}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Panel lateral del conductor seleccionado */}
      {sel && (
        <div className="absolute right-0 top-0 z-[1000] flex h-full w-full max-w-sm flex-col border-l bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <p className="font-semibold text-gray-900">{sel.nombre}</p>
              <p className="text-xs text-muted-foreground">{sel.placa} · {sel.telefono}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSel(null)}><X className="h-4 w-4" /></Button>
          </div>

          <div className="space-y-2 border-b p-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {sel.carreraActivaId ? <Badge variant="info">En carrera · {sel.carreraEstado}</Badge> : sel.disponible ? <Badge variant="success">Disponible</Badge> : <Badge variant="neutral">Ocupado</Badge>}
              <Badge variant="neutral">⭐ {sel.ratingPromedio.toFixed(1)}</Badge>
            </div>
            {sel.clienteNombre && <p className="text-muted-foreground">Cliente: <span className="text-gray-900">{sel.clienteNombre}</span></p>}
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Navigation className="h-3 w-3" /> GPS {sel.ultimaActualizacion ? timeAgo(sel.ultimaActualizacion) : '—'} · {ruta.length} puntos de trayectoria
            </p>
          </div>

          {/* Comunicación */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comunicación</p>
              <div className="flex rounded-lg border p-0.5 text-xs">
                <button
                  onClick={() => setDest('conductor')}
                  className={`rounded px-2 py-0.5 ${dest === 'conductor' ? 'bg-primary text-primary-foreground' : 'text-gray-600'}`}
                >
                  Conductor
                </button>
                <button
                  onClick={() => setDest('cliente')}
                  disabled={!sel.clienteTelefono}
                  className={`rounded px-2 py-0.5 disabled:opacity-40 ${dest === 'cliente' ? 'bg-primary text-primary-foreground' : 'text-gray-600'}`}
                >
                  Cliente
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {mensajes.length === 0 && <p className="text-center text-sm text-muted-foreground">Sin mensajes.</p>}
              {mensajes.map((m) => (
                <div key={m.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.direccion === 'SALIENTE' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800'}`}>
                  {m.texto}
                  <div className={`mt-0.5 text-[10px] ${m.direccion === 'SALIENTE' ? 'text-primary-foreground/70' : 'text-gray-500'}`}>{timeAgo(m.timestamp)} · {m.estado}</div>
                </div>
              ))}
            </div>
            <form onSubmit={enviar} className="flex gap-2 border-t p-3">
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={destTelefono ? `Mensaje a ${destNombre}…` : 'Sin destinatario'}
                disabled={!destTelefono}
              />
              <Button type="submit" size="icon" disabled={enviando || !texto.trim() || !destTelefono}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
