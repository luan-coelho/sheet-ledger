'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Calendar, User, FileText, CreditCard, Shield } from 'lucide-react'
import { SpreadsheetFormValues } from '@/lib/spreadsheet-schema'
import { PreviewUtils } from '@/lib/preview-utils'
import { useProfessionals } from '@/hooks/use-professionals'
import { usePatients } from '@/hooks/use-patients'
import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'

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
  const monthIndex = parseInt(formData.competencia.mes)
  const year = parseInt(formData.competencia.ano)
  const sessionDates = PreviewUtils.generateSessionDatesWithSessions(year, monthIndex, formData.weekDaySessions)

  // Format data for display
  const weekDaysString = PreviewUtils.formatWeekDaysRangeWithSessions(formData.weekDaySessions)
  const competenciaString = PreviewUtils.formatCompetencia(monthIndex, formData.competencia.ano)

  // Calculate totals
  const totalSessionsInMonth = sessionDates.reduce((total, session) => total + session.sessions, 0)
  const totalDaysInMonth = sessionDates.length
  const sessionsPerWeek = formData.weekDaySessions.reduce((total, item) => total + item.sessions, 0)

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview da Planilha de Atendimento
            </CardTitle>
            <CardDescription>
              Visualização dos dados que serão gerados na planilha
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Header Information */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            REGISTRO DE ATENDIMENTO
          </h3>
          
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Profissional executante:</span>
              <span>{professional?.name || 'Carregando...'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Nº conselho do profissional:</span>
              <span>{formData.licenseNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Sessão Autorizada:</span>
              <span>{formData.authorizedSession}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Nome paciente:</span>
              <span>{patient?.name || 'Carregando...'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Responsável:</span>
              <span>{guardian?.name || 'Carregando...'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Plano:</span>
              <span>{healthPlan?.name || 'Carregando...'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Session Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações das Sessões
            </h3>
            <div className="flex gap-2">
              <Badge variant="secondary">{weekDaysString}</Badge>
              <Badge variant="outline">{competenciaString}</Badge>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="grid gap-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Dias da semana selecionados:</span>
                <span>{weekDaysString}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Competência:</span>
                <span>{competenciaString}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total de dias no mês:</span>
                <span>{totalDaysInMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total de sessões no mês:</span>
                <span className="font-semibold text-primary">{totalSessionsInMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sessões por semana (configurado):</span>
                <span>{sessionsPerWeek}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sessions Table Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Sessões que serão geradas:</h3>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                <span>Nº</span>
                <span>Data</span>
                <span>Sessão/dia</span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {sessionDates.map((session, index) => (
                <div key={index} className="px-4 py-2 border-b last:border-b-0 hover:bg-muted/30">
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
            <div className="mt-4 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary">Resumo Total</h4>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-primary text-lg">{totalDaysInMonth}</div>
                    <div className="text-muted-foreground">Dias</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary text-lg">{totalSessionsInMonth}</div>
                    <div className="text-muted-foreground">Sessões</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sessionDates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sessão encontrada para os critérios selecionados</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
