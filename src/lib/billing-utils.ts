/**
 * Utilitário para formatação de valores monetários e conversões de centavos
 */

/**
 * Formata um valor em centavos para moeda brasileira (R$)
 * @param cents - Valor em centavos
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return 'R$ 0,00'
  }

  const value = cents / 100

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Converte centavos para valor decimal
 * @param cents - Valor em centavos
 * @returns Valor decimal
 */
export function centsToDecimal(cents: number | null | undefined): number {
  if (cents === null || cents === undefined) {
    return 0
  }

  return cents / 100
}

/**
 * Converte valor decimal para centavos
 * @param value - Valor decimal
 * @returns Valor em centavos
 */
export function decimalToCents(value: number): number {
  return Math.round(value * 100)
}

/**
 * Verifica se uma data de vencimento está vencida
 * @param dueDate - Data de vencimento (string YYYY-MM-DD ou Date)
 * @returns true se vencida, false caso contrário
 */
export function isOverdue(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  due.setHours(0, 0, 0, 0)

  return due < today
}

/**
 * Verifica se uma data de vencimento está próxima (dentro de X dias)
 * @param dueDate - Data de vencimento (string YYYY-MM-DD ou Date)
 * @param days - Número de dias para considerar "próximo" (padrão: 7)
 * @returns true se próxima, false caso contrário
 */
export function isDueSoon(dueDate: string | Date | null | undefined, days: number = 7): boolean {
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 && diffDays <= days
}

/**
 * Calcula quantos dias faltam para o vencimento
 * @param dueDate - Data de vencimento (string YYYY-MM-DD ou Date)
 * @returns Número de dias (negativo se vencido)
 */
export function getDaysUntilDue(dueDate: string | Date | null | undefined): number | null {
  if (!dueDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formata a mensagem de prazo de faturamento
 * @param dueDate - Data de vencimento
 * @returns String descritiva do prazo (ex: "Vence em 3 dias", "Vencido há 2 dias")
 */
export function formatDueStatus(dueDate: string | Date | null | undefined): string {
  const days = getDaysUntilDue(dueDate)

  if (days === null) {
    return 'Sem prazo definido'
  }

  if (days < 0) {
    const absDays = Math.abs(days)
    return `Vencido há ${absDays} ${absDays === 1 ? 'dia' : 'dias'}`
  }

  if (days === 0) {
    return 'Vence hoje'
  }

  return `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`
}

/**
 * Retorna a cor/variante apropriada baseado no status de vencimento
 * @param dueDate - Data de vencimento
 * @returns Variante do badge ("default" | "destructive" | "warning" | "success")
 */
export function getDueStatusVariant(
  dueDate: string | Date | null | undefined,
): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (!dueDate) return 'default'

  if (isOverdue(dueDate)) {
    return 'destructive'
  }

  if (isDueSoon(dueDate, 7)) {
    return 'secondary' // amarelo/warning
  }

  return 'outline'
}

/**
 * Retorna label amigável para status de faturamento
 */
export function getBillingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    scheduled: 'Agendado',
    sent: 'Enviado',
    paid: 'Pago',
    cancelled: 'Cancelado',
  }

  return labels[status] || status
}

/**
 * Retorna variante de badge para status de faturamento
 */
export function getBillingStatusVariant(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    pending: 'secondary',
    scheduled: 'outline',
    sent: 'default',
    paid: 'outline',
    cancelled: 'destructive',
  }

  return variants[status] || 'default'
}
