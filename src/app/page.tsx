import { SpreadsheetForm } from '@/components/spreadsheet-form'

export default function Home() {
  return (
    <main className="h-screen flex items-center flex-col justify-center container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Gerador de Planilha de Atendimento</h1>
      <SpreadsheetForm />
    </main>
  )
}
