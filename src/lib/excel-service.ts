import path from 'path'

import ExcelJS from 'exceljs'

import { createBrazilianDate, formatDateBrazilian, getMonthNameInPortuguese } from './date-utils'
import { meses, WeekDays, WeekdaySession } from './spreadsheet-schema'
import { formatCNPJ } from './utils'

type SessionRecord = {
  date: Date
  sessions: number
  startTime?: string
  endTime?: string
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
    authorizedSession?: string
    patientName: string
    responsible: string
    healthPlan: string
    therapy: string
    cardNumber?: string
    guideNumber?: string
    weekDaySessions: WeekdaySession[]
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
    companyData?: {
      name: string
      cnpj: string
      address: string
    }
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

    // Preenche a célula A1 com as informações da empresa
    if (data.companyData) {
      const companyInfo = `${data.companyData.name}\nCNPJ: ${formatCNPJ(data.companyData.cnpj)}\nENDEREÇO: ${data.companyData.address}`
      worksheet.getCell('A1').value = companyInfo

      // Configurar quebra de linha na célula
      worksheet.getCell('A1').alignment = {
        wrapText: true,
        vertical: 'top',
        horizontal: 'left',
      }

      // Definir altura da linha A1 para acomodar múltiplas linhas
      worksheet.getRow(1).height = 60
    }

    // Preenche as células mescladas das colunas C e D (linha 3 a 11)
    worksheet.getCell('C3').value = data.professional
    worksheet.getCell('C4').value = data.therapy
    worksheet.getCell('C5').value = data.licenseNumber
    worksheet.getCell('C6').value = data.authorizedSession || ''
    worksheet.getCell('C7').value = data.patientName
    worksheet.getCell('C8').value = data.responsible
    worksheet.getCell('C9').value = data.healthPlan
    worksheet.getCell('C10').value = data.cardNumber || ''
    worksheet.getCell('C11').value = data.guideNumber || ''

    // Formata os dias da semana para o formato SEG Á SEX
    const weekDaysString = this.formatWeekDaysRangeWithSessions(data.weekDaySessions)

    // Preenche a linha 15 com os dias da semana (agora na coluna J)
    worksheet.getCell('C54').value = weekDaysString

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

    // Preenche o campo de competência na linha 18 (agora na coluna J)
    worksheet.getCell('C57').value = competencyText

    // Linha inicial para os registros
    const startRow = 14
    // Linha final para os registros (expandido para comportar até 31 dias)
    const endRow = 44

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

        // Horário de início (usa o horário específico do dia se disponível)
        worksheet.getCell(`C${row}`).value = record.startTime || data.startTime || ''

        // Horário de fim (usa o horário específico do dia se disponível)
        worksheet.getCell(`D${row}`).value = record.endTime || data.endTime || ''

        // Sessões por dia (agora na coluna E)
        worksheet.getCell(`E${row}`).value = record.sessions
        totalSessions += record.sessions

        // Valor fixo "Atendido" (agora na coluna F)
        worksheet.getCell(`F${row}`).value = 'Atendido'

        // Coluna G fica em branco (assinatura)
      }
    })

    // Preenche o total de sessões na célula E46
    worksheet.getCell('E46').value = totalSessions

    // Gera o buffer da planilha
    return await workbook.xlsx.writeBuffer()
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

    return sortedSessions
      .map(({ day, sessions }) => {
        return `${dayAbbreviations[day]}(${sessions})`
      })
      .join(', ')
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
    const sessionsMap = new Map<WeekDays, { sessions: number; startTime: string; endTime: string }>()
    weekDaySessions.forEach(({ day, sessions, startTime, endTime }) => {
      sessionsMap.set(day, { sessions, startTime, endTime })
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
        const sessionData = sessionsMap.get(ourDay)!
        sessionRecords.push({
          date: new Date(d),
          sessions: sessionData.sessions,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
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

    // Cria um mapa de dias da semana para busca mais rápida
    const weekDaySessionMap = new Map<WeekDays, { sessions: number; startTime: string; endTime: string }>()
    weekDaySessions.forEach(ws => {
      weekDaySessionMap.set(ws.day, { sessions: ws.sessions, startTime: ws.startTime, endTime: ws.endTime })
    })

    // Itera através de cada dia no período
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const jsDay = currentDate.getDay()
      const weekDay = this.getWeekDayFromJSDay(jsDay)

      // Verifica se este dia da semana está selecionado
      if (weekDaySessionMap.has(weekDay)) {
        const sessionData = weekDaySessionMap.get(weekDay)!
        records.push({
          date: new Date(currentDate),
          sessions: sessionData.sessions,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
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
