'use client'

import { useEffect, useState, useCallback } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { timeAgo } from '@/lib/utils'

interface Mensaje {
  id: string
  direccion: string
  texto: string
  estado: string
  timestamp: string
}

/** Hilo de mensajes con un teléfono + envío. Reutilizable (soporte, incidentes). */
export function ChatPanel({
  telefono,
  nombre,
  carreraId,
}: {
  telefono: string
  nombre?: string | null
  carreraId?: string | null
}) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/comunicacion?telefono=${encodeURIComponent(telefono)}`)
    if (res.ok) setMensajes(await res.json())
  }, [telefono])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 5000)
    return () => clearInterval(id)
  }, [cargar])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    await fetch('/api/comunicacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono, nombre, texto, carreraId: carreraId ?? null }),
    })
    setTexto('')
    setEnviando(false)
    cargar()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {mensajes.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sin mensajes todavía.</p>}
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.direccion === 'SALIENTE' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {m.texto}
            <div className={`mt-0.5 text-[10px] ${m.direccion === 'SALIENTE' ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
              {timeAgo(m.timestamp)} · {m.estado}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={enviar} className="flex gap-2 border-t p-3">
        <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`Responder a ${nombre ?? telefono}…`} />
        <Button type="submit" size="icon" disabled={enviando || !texto.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
