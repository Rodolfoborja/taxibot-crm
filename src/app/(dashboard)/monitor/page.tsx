'use client'

import dynamic from 'next/dynamic'
import { Topbar } from '@/components/dashboard/topbar'

const MapaLive = dynamic(() => import('@/components/dashboard/mapa-live'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted-foreground">
      Cargando mapa…
    </div>
  ),
})

export default function MonitorPage() {
  return (
    <>
      <Topbar titulo="Monitor en vivo" />
      <MapaLive />
    </>
  )
}
