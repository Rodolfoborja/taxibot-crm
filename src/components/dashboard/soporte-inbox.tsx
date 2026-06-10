'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChatPanel } from '@/components/dashboard/chat-panel'
import { cn, timeAgo } from '@/lib/utils'

interface Conversacion {
  telefono: string
  nombre: string | null
  ultimoTexto: string
  ultimaDireccion: string
  timestamp: string
  sinResponder: boolean
}

export function SoporteInbox() {
  const [convs, setConvs] = useState<Conversacion[]>([])
  const [sel, setSel] = useState<Conversacion | null>(null)

  const cargar = useCallback(async () => {
    const res = await fetch('/api/soporte')
    if (res.ok) setConvs(await res.json())
  }, [])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 7000)
    return () => clearInterval(id)
  }, [cargar])

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
      {/* Lista de conversaciones */}
      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Conversaciones ({convs.length})
        </div>
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No hay mensajes de soporte.</p>}
          {convs.map((c) => (
            <button
              key={c.telefono}
              onClick={() => setSel(c)}
              className={cn(
                'flex w-full flex-col items-start gap-0.5 border-b px-4 py-3 text-left text-sm hover:bg-gray-50',
                sel?.telefono === c.telefono && 'bg-primary/5'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-gray-900">{c.nombre ?? c.telefono}</span>
                {c.sinResponder && <Badge variant="danger">Sin responder</Badge>}
              </div>
              <span className="line-clamp-1 text-muted-foreground">
                {c.ultimaDireccion === 'SALIENTE' ? 'Tú: ' : ''}{c.ultimoTexto}
              </span>
              <span className="text-[10px] text-gray-400">{timeAgo(c.timestamp)}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Hilo seleccionado */}
      <Card className="flex min-h-0 flex-col overflow-hidden">
        {sel ? (
          <>
            <div className="border-b p-4">
              <p className="font-semibold text-gray-900">{sel.nombre ?? 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{sel.telefono}</p>
            </div>
            <ChatPanel telefono={sel.telefono} nombre={sel.nombre} />
          </>
        ) : (
          <CardContent className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8" />
            Selecciona una conversación para responder.
          </CardContent>
        )}
      </Card>
    </div>
  )
}
