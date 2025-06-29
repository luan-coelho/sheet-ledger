import ExcelJS from 'exceljs'
import path from 'path'
import { WeekDays, meses, WeekdaySession } from './spreadsheet-schema'
import { createBrazilianDate, formatDateBrazilian, getMonthNameInPortuguese } from './date-utils'

type SessionRecord = {
  date: Date
  sessions: number
}

/**
 * Service para gerar planilhas Excel baseadas em um template
 */
export class ExcelService {
  /**
   * Gera uma planilha de atendimento baseada no template
   * @param data Dados para preencher a planilha
   * @returns Buffer contendo a planilha gerada
   */
  static async generateAttendanceSheet(data: {
    professional: string
    licenseNumber: string
    authorizedSession: string
    patientName: string
    responsible: string
    healthPlan: string
    weekDaySessions: WeekdaySession[]
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
    competency?: {
      month: string
      year: string
    }
  }): Promise<ArrayBuffer> {
    // Carrega o arquivo template
    const templatePath = path.join(process.cwd(), 'src/data/model.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templatePath)

    // Obtém a primeira planilha
    const worksheet = workbook.getWorksheet(1)

    if (!worksheet) {
      throw new Error('Planilha não encontrada no arquivo template')
    }

    // Preenche as células mescladas das colunas C e D (linha 3 a 8)
    worksheet.getCell('C3').value = data.professional
    worksheet.getCell('C4').value = data.licenseNumber
    worksheet.getCell('C5').value = data.authorizedSession
    worksheet.getCell('C6').value = data.patientName
    worksheet.getCell('C7').value = data.responsible
    worksheet.getCell('C8').value = data.healthPlan

    // Formata os dias da semana para o formato SEG Á SEX
    const weekDaysString = this.formatWeekDaysRangeWithSessions(data.weekDaySessions)

    // Preenche a linha 14 com os dias da semana (agora na coluna J)
    worksheet.getCell('J14').value = weekDaysString

    let records: SessionRecord[]
    let competencyText: string

    if (data.startDate && data.endDate) {
      // Usar o novo formato com data de início e fim
      const startDateObj = createBrazilianDate(data.startDate)
      const endDateObj = createBrazilianDate(data.endDate)

      // Formato da competência para o período
      const startMonth = getMonthNameInPortuguese(startDateObj.getMonth())
      const startYear = startDateObj.getFullYear()
      const endMonth = getMonthNameInPortuguese(endDateObj.getMonth())
      const endYear = endDateObj.getFullYear()

      if (startYear === endYear && startMonth === endMonth) {
        competencyText = `${startMonth.toUpperCase()}/${startYear}`
      } else {
        competencyText = `${startMonth.toUpperCase()}/${startYear} - ${endMonth.toUpperCase()}/${endYear}`
      }

      records = this.generateRecordsForPeriodWithSessions(startDateObj, endDateObj, data.weekDaySessions)
    } else if (data.competency) {
      // Manter compatibilidade com o formato antigo
      const monthIndex = parseInt(data.competency.month)
      const monthName = meses.find(m => parseInt(m.value) === monthIndex)?.label || 'Janeiro'
      competencyText = `${monthName.toUpperCase()}/${data.competency.year}`

      const competencyMonth = parseInt(data.competency.month)
      const competencyYear = parseInt(data.competency.year)
      records = this.generateRecordsForMonthWithSessions(competencyYear, competencyMonth, data.weekDaySessions)
    } else {
      throw new Error('É necessário informar a data de início e fim ou a competência')
    }

    // Preenche o campo de competência na linha 17 (agora na coluna J)
    worksheet.getCell('J17').value = competencyText

    // Preenche o período de horário em J20 (agora na coluna J)
    if (data.startTime && data.endTime) {
      worksheet.getCell('J20').value = `${data.startTime} - ${data.endTime}`
    }

    // Linha inicial para os registros
    const startRow = 12
    const endRow = 42 // Expandido para comportar até 31 dias (linha 12 a 42)

    // Limpa as linhas de dados (da linha 12 até a 42 inclusive)
    for (let row = startRow; row <= endRow; row++) {
      worksheet.getCell(`A${row}`).value = null
      worksheet.getCell(`B${row}`).value = null
      worksheet.getCell(`C${row}`).value = null
      worksheet.getCell(`D${row}`).value = null
      worksheet.getCell(`E${row}`).value = null
      worksheet.getCell(`F${row}`).value = null
    }

    // Preenche os registros
    let totalSessions = 0
    records.forEach((record, index) => {
      // Garante que não excedemos a linha 42
      if (startRow + index <= endRow) {
        const row = startRow + index

        // Número sequencial
        worksheet.getCell(`A${row}`).value = index + 1

        // Data no formato DD/MM/YYYY
        worksheet.getCell(`B${row}`).value = formatDateBrazilian(record.date)

        // Horário de início (agora na coluna C)
        worksheet.getCell(`C${row}`).value = data.startTime || ''

        // Horário de fim (agora na coluna D)
        worksheet.getCell(`D${row}`).value = data.endTime || ''

        // Sessões por dia (agora na coluna E)
        worksheet.getCell(`E${row}`).value = record.sessions
        totalSessions += record.sessions

        // Valor fixo "Presencial" (agora na coluna F)
        worksheet.getCell(`F${row}`).value = 'Presencial'

        // Coluna G fica em branco (assinatura)
      }
    })

    // Preenche o total de sessões na célula C44
    worksheet.getCell('C44').value = totalSessions

    // Gera o buffer da planilha
    return await workbook.xlsx.writeBuffer()
  }

  /**
   * Formata o array de dias da semana para o formato SEG Á SEX
   * @param weekdays Array de dias da semana selecionados
   * @returns String formatada no formato SEG Á SEX
   */
  private static formatWeekDaysRange(weekdays: WeekDays[]): string {
    if (weekdays.length === 0) return ''

    // Define abreviações dos dias
    const dayAbbreviations: Record<WeekDays, string> = {
      [WeekDays.MONDAY]: 'SEG',
      [WeekDays.TUESDAY]: 'TER',
      [WeekDays.WEDNESDAY]: 'QUA',
      [WeekDays.THURSDAY]: 'QUI',
      [WeekDays.FRIDAY]: 'SEX',
      [WeekDays.SATURDAY]: 'SAB',
      [WeekDays.SUNDAY]: 'DOM',
    }

    // Ordena os dias da semana para encontrar intervalos contínuos
    const sortedDayIndices = weekdays.map(day => this.getDayIndex(day)).sort((a, b) => a - b)

    // Verifica se os dias da semana são consecutivos
    const isConsecutive = sortedDayIndices.every((dayIndex, i, array) => i === 0 || dayIndex === array[i - 1] + 1)

    if (isConsecutive && sortedDayIndices.length > 1) {
      // Obtém o primeiro e último dia
      const firstDay = this.getDayByIndex(sortedDayIndices[0])
      const lastDay = this.getDayByIndex(sortedDayIndices[sortedDayIndices.length - 1])

      return `${dayAbbreviations[firstDay]} Á ${dayAbbreviations[lastDay]}`
    } else {
      // Retorna lista separada por vírgulas se não for consecutivo
      return weekdays.map(day => dayAbbreviations[day]).join(', ')
    }
  }

  /**
   * Obtém o índice numérico de um dia da semana (0-6)
   */
  private static getDayIndex(day: WeekDays): number {
    const dayIndices: Record<WeekDays, number> = {
      [WeekDays.MONDAY]: 0,
      [WeekDays.TUESDAY]: 1,
      [WeekDays.WEDNESDAY]: 2,
      [WeekDays.THURSDAY]: 3,
      [WeekDays.FRIDAY]: 4,
      [WeekDays.SATURDAY]: 5,
      [WeekDays.SUNDAY]: 6,
    }

    return dayIndices[day]
  }

  /**
   * Obtém o dia da semana pelo seu índice numérico
   */
  private static getDayByIndex(index: number): WeekDays {
    const days = [
      WeekDays.MONDAY,
      WeekDays.TUESDAY,
      WeekDays.WEDNESDAY,
      WeekDays.THURSDAY,
      WeekDays.FRIDAY,
      WeekDays.SATURDAY,
      WeekDays.SUNDAY,
    ]

    return days[index]
  }

  /**
   * Gera registros para um mês e ano específicos, filtrados pelos dias da semana selecionados
   * @param year Ano
   * @param month Mês (0-11)
   * @param daysOfWeek Array de índices de dias (0 = Segunda, 6 = Domingo)
   * @returns Array de datas representando os dias selecionados
   */
  private static generateRecordsForMonth(year: number, month: number, daysOfWeek: number[]): Date[] {
    const selectedDays: Date[] = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Garante que temos o ano correto para a competência
    const currentYear = new Date().getFullYear()

    // Se o ano solicitado for muito no futuro (mais de 10 anos), ajusta para o ano atual
    // Esta verificação evita problemas com datas inválidas
    if (year < currentYear - 10 || year > currentYear + 10) {
      year = currentYear
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Converte dia JS (0 = Domingo) para nosso dia (0 = Segunda)
      const jsDay = d.getDay() // 0 = Domingo, 1 = Segunda, etc.
      const ourDay = jsDay === 0 ? 6 : jsDay - 1 // Converte para 0 = Segunda, 6 = Domingo

      if (daysOfWeek.includes(ourDay)) {
        selectedDays.push(new Date(d))
      }
    }

    return selectedDays
  }

  /**
   * Formata uma data para o padrão DD/MM/YYYY
   * @param date Data a ser formatada
   * @returns String no formato DD/MM/YYYY
   */
  private static formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  /**
   * Formata intervalo de dias da semana com sessões para exibição
   * @param weekDaySessions Array de configuração de sessões por dia da semana
   * @returns String formatada como "SEG(4), TER(4), QUA(4)"
   */
  private static formatWeekDaysRangeWithSessions(weekDaySessions: WeekdaySession[]): string {
    if (weekDaySessions.length === 0) return ''

    // Mapeia dias da semana para abreviações
    const dayAbbreviations: Record<WeekDays, string> = {
      [WeekDays.MONDAY]: 'SEG',
      [WeekDays.TUESDAY]: 'TER',
      [WeekDays.WEDNESDAY]: 'QUA',
      [WeekDays.THURSDAY]: 'QUI',
      [WeekDays.FRIDAY]: 'SEX',
      [WeekDays.SATURDAY]: 'SAB',
      [WeekDays.SUNDAY]: 'DOM',
    }

    // Ordena os dias da semana pelo seu índice
    const sortedSessions = [...weekDaySessions].sort((a, b) => this.getDayIndex(a.day) - this.getDayIndex(b.day))

    return sortedSessions.map(({ day, sessions }) => `${dayAbbreviations[day]}(${sessions})`).join(', ')
  }

  /**
   * Gera registros com sessões para um mês e ano específicos
   * @param year Ano
   * @param month Mês (0-11)
   * @param weekDaySessions Array de configuração de sessões por dia da semana
   * @returns Array de registros de sessão
   */
  private static generateRecordsForMonthWithSessions(
    year: number,
    month: number,
    weekDaySessions: WeekdaySession[],
  ): SessionRecord[] {
    const sessionRecords: SessionRecord[] = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Cria um mapa para busca rápida de sessões por dia
    const sessionsMap = new Map<WeekDays, number>()
    weekDaySessions.forEach(({ day, sessions }) => {
      sessionsMap.set(day, sessions)
    })

    // Garante que temos o ano correto para a competência
    const currentYear = new Date().getFullYear()

    // Se o ano solicitado for muito no futuro (mais de 10 anos), ajusta para o ano atual
    if (year < currentYear - 10 || year > currentYear + 10) {
      year = currentYear
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Converte dia JS (0 = Domingo) para nosso enum de dia
      const jsDay = d.getDay() // 0 = Domingo, 1 = Segunda, etc.
      const ourDay = this.getWeekDayFromJSDay(jsDay)

      if (sessionsMap.has(ourDay)) {
        sessionRecords.push({
          date: new Date(d),
          sessions: sessionsMap.get(ourDay)!,
        })
      }
    }

    return sessionRecords
  }

  /**
   * Gera registros para um período específico (de startDate até endDate), filtrados pelos dias da semana selecionados
   * @param startDate Data de início
   * @param endDate Data de fim
   * @param weekDaySessions Array de configuração de sessões por dia da semana
   * @returns Array de registros de sessão para o período
   */
  private static generateRecordsForPeriodWithSessions(
    startDate: Date,
    endDate: Date,
    weekDaySessions: WeekdaySession[],
  ): SessionRecord[] {
    const records: SessionRecord[] = []

    // Cria um mapa de dias da semana para contagem de sessões para busca mais rápida
    const weekDaySessionMap = new Map<WeekDays, number>()
    weekDaySessions.forEach(ws => {
      weekDaySessionMap.set(ws.day, ws.sessions)
    })

    // Itera através de cada dia no período
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const jsDay = currentDate.getDay()
      const weekDay = this.getWeekDayFromJSDay(jsDay)

      // Verifica se este dia da semana está selecionado
      if (weekDaySessionMap.has(weekDay)) {
        const sessions = weekDaySessionMap.get(weekDay)!
        records.push({
          date: new Date(currentDate),
          sessions: sessions,
        })
      }

      // Move para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return records
  }

  /**
   * Converte índice de dia JS para enum WeekDays
   * @param jsDay Índice de dia JS (0 = Domingo, 1 = Segunda, etc.)
   * @returns Valor do enum WeekDays
   */
  private static getWeekDayFromJSDay(jsDay: number): WeekDays {
    switch (jsDay) {
      case 1:
        return WeekDays.MONDAY
      case 2:
        return WeekDays.TUESDAY
      case 3:
        return WeekDays.WEDNESDAY
      case 4:
        return WeekDays.THURSDAY
      case 5:
        return WeekDays.FRIDAY
      case 6:
        return WeekDays.SATURDAY
      case 0:
        return WeekDays.SUNDAY
      default:
        return WeekDays.MONDAY
    }
  }
}
