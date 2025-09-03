import { SpreadsheetForm } from '@/components/spreadsheet-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { auth } from '@/lib/auth'

export default async function SheetsPage() {
  // Server-side authentication check
  const session = await auth()

  if (!session?.user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Frequência</h1>
      </div>

      <Card>
        <CardHeader className="h-14">
          <CardTitle>Preencha os dados para gerar a planilha de atendimento.</CardTitle>
        </CardHeader>
        <CardContent>
          <SpreadsheetForm />
        </CardContent>
      </Card>
    </div>
  )
}
