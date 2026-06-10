import { Topbar } from '@/components/dashboard/topbar'
import { DespachoBoard } from '@/components/dashboard/despacho-board'

export const dynamic = 'force-dynamic'

export default function DespachoPage() {
  return (
    <>
      <Topbar titulo="Despacho · carreras sin conductor" />
      <main className="flex-1 p-4 md:p-8">
        <DespachoBoard />
      </main>
    </>
  )
}
