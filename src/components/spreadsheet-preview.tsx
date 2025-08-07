'use client'

import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Hash,
  IdCard,
  Target,
  UserCheck,
  UserRound,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'
import { usePatients } from '@/hooks/use-patients'
import { useProfessionals } from '@/hooks/use-professionals'

import { PreviewUtils } from '@/lib/preview-utils'
import { SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

interface SpreadsheetPreviewProps {
  formData: SpreadsheetFormValues
  onClose: () => void
}

export function SpreadsheetPreview({ formData, onClose }: SpreadsheetPreviewProps) {
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: healthPlans } = useHealthPlans()

  // Find entity names by IDs
  const professional = professionals?.find(p => p.id === formData.professionalId)
  const patient = patients?.find(p => p.id === formData.patientId)
  const guardian = guardians?.find(g => g.id === formData.guardianId)
  const healthPlan = healthPlans?.find(h => h.id === formData.healthPlanId)

  // Generate session dates with sessions per day
  let sessionDates: Array<{ date: Date; sessions: number }> = []
  let competencyString = ''

  if (formData.startDate && formData.endDate) {
    // Use new date range format
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    sessionDates = PreviewUtils.generateSessionDatesWithSessionsForPeriod(startDate, endDate, formData.weekDaySessions)

    // Format period string
    const startMonth = startDate.toLocaleDateString('pt-BR', { month: 'long' })
    const startYear = startDate.getFullYear()
    const endMonth = endDate.toLocaleDateString('pt-BR', { month: 'long' })
    const endYear = endDate.getFullYear()

    if (startYear === endYear && startMonth === endMonth) {
      competencyString = `${startMonth.toUpperCase()}/${startYear}`
    } else {
      competencyString = `${startMonth.toUpperCase()}/${startYear} - ${endMonth.toUpperCase()}/${endYear}`
    }
  }

  // Format data for display
  const weekDaysString = PreviewUtils.formatWeekDaysRangeWithSessions(formData.weekDaySessions)

  // Calculate totals
  const totalSessionsInMonth = sessionDates.reduce((total, session) => total + session.sessions, 0)
  const totalDaysInMonth = sessionDates.length
  const sessionsPerWeek = formData.weekDaySessions.reduce((total, item) => total + item.sessions, 0)

  return (
    <Card className="w-full">
      <CardHeader className="h-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Resumo da Planilha de Atendimento
            </CardTitle>
            <CardDescription>Esses serão os dados que serão inseridos na planilha</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Information */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">Registro de Atendimento</h3>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Profissional executante
                </div>
                <div className="pl-6 font-medium">{professional?.name || 'Carregando...'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <IdCard className="h-4 w-4 text-green-600" />
                  Nº conselho do profissional
                </div>
                <div className="pl-6 font-medium">{formData.licenseNumber}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Sessão Autorizada
                </div>
                <div className="pl-6 font-medium">{formData.authorizedSession}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <UserRound className="h-4 w-4 text-pink-600" />
                  Nome paciente
                </div>
                <div className="pl-6 font-medium">{patient?.name || 'Carregando...'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <UserRound className="h-4 w-4 text-purple-600" />
                  Responsável
                </div>
                <div className="pl-6 font-medium">{guardian?.name || 'Carregando...'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  Plano
                </div>
                <div className="pl-6 font-medium">{healthPlan?.name || 'Carregando...'}</div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Session Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">Informações das Sessões</h3>
            <div className="flex gap-2">
              <Badge variant="secondary">{weekDaysString}</Badge>
              <Badge variant="outline">{competencyString}</Badge>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="mb-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Dias da semana selecionados
                </div>
                <div className="pl-6 font-medium">{weekDaysString}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Competência
                </div>
                <div className="pl-6 font-medium">{competencyString}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <BarChart3 className="h-4 w-4 text-cyan-600" />
                  Total de dias no mês
                </div>
                <div className="pl-6 font-medium">{totalDaysInMonth}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Target className="h-4 w-4 text-green-600" />
                  Total de sessões no mês
                </div>
                <div className="text-primary pl-6 font-semibold">{totalSessionsInMonth}</div>
              </div>

              <div className="space-y-1 md:col-span-1">
                <div className="text-muted-foreground flex items-center gap-2 font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Sessões por semana (configurado)
                </div>
                <div className="pl-6 font-medium">{sessionsPerWeek}</div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sessions Table Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sessões que serão geradas:</h3>

          <div className="overflow-hidden rounded-lg border">
            <div className="bg-muted/50 border-b px-4 py-2">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-slate-600" />
                  Nº
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  Data
                </span>
                <span className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-green-600" />
                  Sessão/dia
                </span>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {sessionDates.map((session, index) => (
                <div key={index} className="hover:bg-muted/30 border-b px-4 py-2 last:border-b-0">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">{index + 1}</span>
                    <span>{PreviewUtils.formatDate(session.date)}</span>
                    <span>{session.sessions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary - Always visible below the table */}
          {sessionDates.length > 0 && (
            <div className="bg-primary/5 border-primary/20 mt-4 rounded-lg border-2 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-primary flex items-center gap-2 font-semibold">
                  <BarChart3 className="h-4 w-4" />
                  Resumo Total
                </h4>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2 text-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-primary text-lg font-semibold">{totalDaysInMonth}</div>
                      <div className="text-muted-foreground text-xs">Dias</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-center">
                    <Target className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-primary text-lg font-semibold">{totalSessionsInMonth}</div>
                      <div className="text-muted-foreground text-xs">Sessões</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sessionDates.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Nenhuma sessão encontrada para os critérios selecionados</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
