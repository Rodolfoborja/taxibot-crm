import { Topbar } from '@/components/dashboard/topbar'
import { Card, CardContent } from '@/components/ui/card'
import { ApiKeysManager } from '@/components/dashboard/api-keys-manager'

export const dynamic = 'force-dynamic'

export default function ApiKeysPage() {
  return (
    <>
      <Topbar titulo="API Keys" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5 text-sm text-blue-900">
            <p className="font-medium">🔌 Integración con el bot (Jelou)</p>
            <p className="mt-1 text-blue-800">
              Genera una API key y úsala desde tu flujo en Jelou para enviar datos al CRM o ejecutar
              acciones PMA. Envía el token en el header{' '}
              <code className="rounded bg-white/70 px-1">Authorization: Bearer &lt;token&gt;</code> a{' '}
              <code className="rounded bg-white/70 px-1">POST /api/v1/ingest</code> o{' '}
              <code className="rounded bg-white/70 px-1">POST /api/v1/pma/ejecutar-accion</code>.
            </p>
          </CardContent>
        </Card>

        <ApiKeysManager />
      </main>
    </>
  )
}
