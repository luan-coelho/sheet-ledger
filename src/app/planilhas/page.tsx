import { SpreadsheetForm } from '@/components/spreadsheet-form'

export default function PlanilhasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Planilhas</h1>
        <p className="text-muted-foreground">
          Crie e configure suas planilhas de atendimento
        </p>
      </div>
      
      <div className="max-w-2xl">
        <SpreadsheetForm />
      </div>
    </div>
  )
}
