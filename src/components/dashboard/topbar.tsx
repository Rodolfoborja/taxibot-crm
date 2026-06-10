'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Topbar({ titulo }: { titulo: string }) {
  const { data: session } = useSession()
  const nombre = session?.user?.name ?? 'Operador'
  const rol = (session?.user as { rol?: string } | undefined)?.rol ?? ''

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-8">
      <h1 className="text-lg font-semibold text-gray-900 md:text-xl">{titulo}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-gray-900">{nombre}</p>
          {rol && <p className="text-xs text-gray-500">{rol}</p>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {nombre.slice(0, 1).toUpperCase()}
        </div>
        <Button variant="ghost" size="icon" title="Cerrar sesión" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
