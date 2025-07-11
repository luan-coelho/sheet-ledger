import { SpreadsheetForm } from '@/components/spreadsheet-form'

import { auth } from '@/lib/auth'

export default async function SheetsPage() {
  // Server-side authentication check
  const session = await auth()

  if (!session?.user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Planilhas</h1>
        <p className="text-muted-foreground">Crie e configure suas planilhas de atendimento, {session.user?.name}</p>
      </div>

      <SpreadsheetForm />
    </div>
  )
}
