'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, CreditCard, Shield, Clock } from 'lucide-react'
import { useProfessionals } from '@/hooks/use-professionals'
import { usePatients } from '@/hooks/use-patients'
import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'
import Link from 'next/link'
import { routes } from '@/lib/routes'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'

export function DashboardContent() {
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: healthPlans } = useHealthPlans()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-muted-foreground mt-2">Acompanhe as estatísticas e atividades do sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-50 to-blue-100 shadow-md dark:from-blue-950 dark:to-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planilhas</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800">
              <FileText className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Funcionalidade em desenvolvimento</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-50 to-slate-100 shadow-md dark:from-slate-950 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
              <Users className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{professionals?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {professionals?.length === 1 ? 'profissional cadastrado' : 'profissionais cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-md dark:from-indigo-950 dark:to-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-800">
              <Users className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {patients?.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-md dark:from-cyan-950 dark:to-cyan-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos de Saúde</CardTitle>
            <div className="rounded-full bg-cyan-100 p-2 dark:bg-cyan-800">
              <CreditCard className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{healthPlans?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {healthPlans?.length === 1 ? 'plano cadastrado' : 'planos cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-md dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-800">
              <Shield className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{guardians?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {guardians?.length === 1 ? 'responsável cadastrado' : 'responsáveis cadastrados'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3 border shadow-sm">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Link href={routes.frontend.admin.sheets} className="block">
              <div className="group relative h-32 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 transition-all hover:shadow-md dark:from-blue-950 dark:to-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center relative z-10">
                  <div className="rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-800">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Nova Planilha</span>
                </div>
              </div>
            </Link>

            <Link href={routes.frontend.admin.professionals.index} className="block">
              <div className="group relative h-32 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 transition-all hover:shadow-md dark:from-slate-950 dark:to-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center relative z-10">
                  <div className="rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-800">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Profissionais</span>
                </div>
              </div>
            </Link>

            <Link href={routes.frontend.admin.patients.index} className="block">
              <div className="group relative h-32 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 transition-all hover:shadow-md dark:from-indigo-950 dark:to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center relative z-10">
                  <div className="rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-800">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Pacientes</span>
                </div>
              </div>
            </Link>

            <Link href={routes.frontend.admin.guardians.index} className="block">
              <div className="group relative h-32 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 transition-all hover:shadow-md dark:from-cyan-950 dark:to-cyan-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center relative z-10">
                  <div className="rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-800">
                    <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Responsáveis</span>
                </div>
              </div>
            </Link>

            <Link href={routes.frontend.admin.healthPlans.index} className="block col-span-2">
              <div className="group relative h-32 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 transition-all hover:shadow-md dark:from-emerald-950 dark:to-emerald-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center relative z-10">
                  <div className="rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-800">
                    <CreditCard className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Planos de Saúde</span>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
