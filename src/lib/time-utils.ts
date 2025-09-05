/**
 * Utilitários para validação e manipulação de horários
 */

/**
 * Valida se um horário de fim é posterior ao horário de início
 * @param startTime Horário de início no formato HH:MM
 * @param endTime Horário de fim no formato HH:MM
 * @returns true se o horário de fim é posterior ao de início
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const startTimeInMinutes = startHour * 60 + startMinute
  const endTimeInMinutes = endHour * 60 + endMinute

  return endTimeInMinutes > startTimeInMinutes
}

/**
 * Converte horário em formato HH:MM para minutos desde meia-noite
 * @param timeString Horário no formato HH:MM
 * @returns Número de minutos desde meia-noite
 */
export function timeToMinutes(timeString: string): number {
  const [hour, minute] = timeString.split(':').map(Number)
  return hour * 60 + minute
}

/**
 * Converte minutos desde meia-noite para formato HH:MM
 * @param minutes Minutos desde meia-noite
 * @returns Horário no formato HH:MM
 */
export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

/**
 * Valida se ambos os horários foram preenchidos
 * @param startTime Horário de início
 * @param endTime Horário de fim
 * @returns true se ambos os horários foram preenchidos
 */
export function areTimesProvided(startTime: string, endTime: string): boolean {
  return Boolean(startTime && endTime)
}

/**
 * Formata uma mensagem de erro para validação de horários
 * @param field Campo que falhou na validação
 * @returns Mensagem de erro formatada
 */
export function getTimeValidationError(field: 'missing' | 'invalid'): string {
  switch (field) {
    case 'missing':
      return 'Preencha ambos os horários globais (início e fim) antes de aplicar'
    case 'invalid':
      return 'Horário fim deve ser posterior ao horário de início'
    default:
      return 'Erro na validação de horários'
  }
}
