'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ConductorAcciones({ conductorId }: { conductorId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function ejecutar(accion: 'aprobar' | 'rechazar') {
    let motivo: string | undefined
    if (accion === 'rechazar') {
      motivo = window.prompt('Motivo del rechazo:') ?? undefined
      if (!motivo) return
    }
    setLoading(true)
    const res = await fetch(`/api/conductores/${conductorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion, motivo }),
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'No se pudo completar la acción.')
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="success" disabled={loading} onClick={() => ejecutar('aprobar')}>
        <Check className="h-4 w-4" /> Aprobar
      </Button>
      <Button size="sm" variant="destructive" disabled={loading} onClick={() => ejecutar('rechazar')}>
        <X className="h-4 w-4" /> Rechazar
      </Button>
    </div>
  )
}
