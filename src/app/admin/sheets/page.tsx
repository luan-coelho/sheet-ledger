import { requireAuth } from '@/lib/auth-utils'
import { SpreadsheetForm } from '@/components/spreadsheet-form'

export default async function PlanilhasPage() {
  // Server-side authentication check
  const session = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Planilhas</h1>
        <p className="text-muted-foreground">
          Crie e configure suas planilhas de atendimento, {session.user?.name}
        </p>
      </div>

      <SpreadsheetForm />
    </div>
  )
}
