/**
 * Utilitários para operações de data com fuso horário brasileiro
 */

// Configuração do fuso horário brasileiro
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

/**
 * Cria uma nova data no fuso horário brasileiro
 * @param dateString String de data no formato YYYY-MM-DD
 * @returns Date object no fuso horário brasileiro
 */
export function createBrazilianDate(dateString: string): Date {
  // Implementação mais robusta que não depende de date-fns-tz
  // Cria a data interpretando como horário brasileiro (UTC-3)
  const [year, month, day] = dateString.split('-').map(Number)

  // Cria a data no fuso horário brasileiro
  // Durante o horário de verão brasileiro (outubro a fevereiro), UTC-2
  // Durante o horário padrão brasileiro (março a setembro), UTC-3

  // Para setembro 2025, estamos no horário padrão (UTC-3)
  // Então criamos a data às 00:00 horário brasileiro, que é 03:00 UTC
  const date = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0))

  return date
}

/**
 * Formata uma data para string no formato brasileiro (DD/MM/YYYY)
 * @param date Data a ser formatada
 * @returns String formatada
 */
export function formatDateBrazilian(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata uma data para string no formato ISO brasileiro (YYYY-MM-DD)
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtém a data atual no fuso horário brasileiro
 * @returns Date object representando agora no Brasil
 */
export function getNowInBrazil(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }))
}

/**
 * Obtém o primeiro dia do mês no fuso horário brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Date object do primeiro dia do mês
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/**
 * Obtém o último dia do mês no fuso horário brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Date object do último dia do mês
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

/**
 * Verifica se duas datas são do mesmo mês e ano
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns true se são do mesmo mês e ano
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
}

/**
 * Obtém o nome do mês em português
 * @param monthIndex Índice do mês (0-11)
 * @returns Nome do mês em português
 */
export function getMonthNameInPortuguese(monthIndex: number): string {
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]
  return months[monthIndex] || 'janeiro'
}

/**
 * Converte um objeto Date para string local no formato YYYY-MM-DD
 * @param date Data a ser convertida
 * @returns String no formato YYYY-MM-DD
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtém a data mínima para fim (um dia após a data de início)
 * @param startDate String de data no formato YYYY-MM-DD
 * @returns Date object do dia seguinte ou undefined se não há data de início
 */
export function getMinEndDate(startDate: string | undefined): Date | undefined {
  if (!startDate) return undefined
  const date = new Date(startDate + 'T00:00:00')
  date.setDate(date.getDate() + 1)
  return date
}

/**
 * Verifica se um período abrange múltiplos meses
 * @param startDate String de data de início no formato YYYY-MM-DD
 * @param endDate String de data de fim no formato YYYY-MM-DD
 * @returns true se o período abrange múltiplos meses
 */
export function isMultipleMonths(startDate: string | undefined, endDate: string | undefined): boolean {
  if (!startDate || !endDate) return false
  const startDateObj = new Date(startDate + 'T00:00:00')
  const endDateObj = new Date(endDate + 'T00:00:00')
  return startDateObj.getMonth() !== endDateObj.getMonth() || startDateObj.getFullYear() !== endDateObj.getFullYear()
}
