import { Topbar } from '@/components/dashboard/topbar'
import { SoporteInbox } from '@/components/dashboard/soporte-inbox'

export const dynamic = 'force-dynamic'

export default function SoportePage() {
  return (
    <>
      <Topbar titulo="Soporte · mensajes" />
      <main className="flex-1 p-4 md:p-8">
        <SoporteInbox />
      </main>
    </>
  )
}
