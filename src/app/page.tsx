"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, CreditCard, BarChart3, Shield } from "lucide-react"
import { useProfessionals } from "@/hooks/use-professionals"
import { usePatients } from "@/hooks/use-patients"
import { useGuardians } from "@/hooks/use-guardians"
import { useHealthPlans } from "@/hooks/use-health-plans"
import Link from "next/link"

export default function Home() {
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: healthPlans } = useHealthPlans()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Sheet Ledger - Sistema de Gestão de Planilhas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Planilhas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profissionais
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {professionals?.length === 1 ? 'profissional cadastrado' : 'profissionais cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {patients?.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planos de Saúde
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthPlans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {healthPlans?.length === 1 ? 'plano cadastrado' : 'planos cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Responsáveis
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guardians?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {guardians?.length === 1 ? 'responsável cadastrado' : 'responsáveis cadastrados'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atividades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nova planilha criada
                </p>
                <p className="text-sm text-muted-foreground">
                  Planilha "Consultas Janeiro 2024" foi criada
                </p>
              </div>
              <div className="text-sm text-muted-foreground">2h atrás</div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Profissional cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Dr. João Silva foi adicionado ao sistema
                </p>
              </div>
              <div className="text-sm text-muted-foreground">4h atrás</div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Paciente atualizado
                </p>
                <p className="text-sm text-muted-foreground">
                  Dados de Maria Santos foram atualizados
                </p>
              </div>
              <div className="text-sm text-muted-foreground">6h atrás</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/planilhas">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Nova Planilha
              </Button>
            </Link>
            <Link href="/profissionais">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Profissionais
              </Button>
            </Link>
            <Link href="/pacientes">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Pacientes
              </Button>
            </Link>
            <Link href="/responsaveis">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Gerenciar Responsáveis
              </Button>
            </Link>
            <Link href="/planos-saude">
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar Planos de Saúde
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
