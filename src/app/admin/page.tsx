import { requireAuth } from "@/lib/auth-utils"
import { DashboardContent } from "@/components/dashboard-content"

export default async function Home() {
  // Require authentication for this page
  const session = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {session.user?.name || 'Usuário'}! Sistema de Gestão de Planilhas
        </p>
      </div>

      <DashboardContent />

    </div>
  )
}
