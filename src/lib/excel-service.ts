import ExcelJS from 'exceljs'
import path from 'path'
import { WeekDays, meses } from './spreadsheet-schema'

/**
 * Service for generating Excel spreadsheets based on a template
 */
export class ExcelService {
  /**
   * Generates an attendance spreadsheet based on the template
   * @param data Data to fill the spreadsheet
   * @returns Buffer containing the generated spreadsheet
   */
  static async generateAttendanceSheet(data: {
    professional: string
    licenseNumber: string
    authorizedSession: string
    patientName: string
    responsible: string
    healthPlan: string
    weekDays: WeekDays[]
    competencia: {
      mes: string
      ano: string
    }
  }): Promise<ArrayBuffer> {
    // Load the template file
    const templatePath = path.join(process.cwd(), 'src/data/modelo.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templatePath)

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1)

    if (!worksheet) {
      throw new Error('Worksheet not found in template file')
    }

    // Fill the merged cells of columns C and D (row 3 to 8)
    worksheet.getCell('C3').value = data.professional
    worksheet.getCell('C4').value = data.licenseNumber
    worksheet.getCell('C5').value = data.authorizedSession
    worksheet.getCell('C6').value = data.patientName
    worksheet.getCell('C7').value = data.responsible
    worksheet.getCell('C8').value = data.healthPlan

    // Format weekdays to SEG Á SEX format
    const weekDaysString = this.formatWeekDaysRange(data.weekDays)

    // Fill row 14 with weekdays
    worksheet.getCell('H14').value = weekDaysString
    
    // Get month name from the number
    const mesIndex = parseInt(data.competencia.mes)
    const mesNome = meses.find(m => parseInt(m.value) === mesIndex)?.label || 'Janeiro'
    
    // Fill the competência field in row 17 (cells H17, I17, J17, K17 are merged)
    worksheet.getCell('H17').value = `${mesNome.toUpperCase()}/${data.competencia.ano}`

    // Generate records for the selected month and year
    const mesCompetencia = parseInt(data.competencia.mes)
    const anoCompetencia = parseInt(data.competencia.ano)
    const daysOfWeekIndices = data.weekDays.map(day => this.getDayIndex(day))
    
    const records = this.generateRecordsForMonth(
      anoCompetencia,
      mesCompetencia,
      daysOfWeekIndices
    )

    // Initial row for records
    const startRow = 12
    const endRow = 32 // Última linha a ser usada (inclusive)
    
    // Limpa apenas as linhas necessárias (da linha 12 até a 32 inclusive)
    for (let row = startRow; row <= endRow; row++) {
      worksheet.getCell(`A${row}`).value = null
      worksheet.getCell(`B${row}`).value = null
      worksheet.getCell(`C${row}`).value = null
      worksheet.getCell(`D${row}`).value = null
      worksheet.getCell(`E${row}`).value = null
    }

    // Fill the records only for the current month
    records.forEach((date, index) => {
      // Garante que não excedemos a linha 32
      if (startRow + index <= endRow) {
        const row = startRow + index
        
        // Sequential number
        worksheet.getCell(`A${row}`).value = index + 1

        // Date in DD/MM/YYYY format
        worksheet.getCell(`B${row}`).value = this.formatDate(date)

        // Fixed value 4 (session/day)
        worksheet.getCell(`C${row}`).value = 4

        // Fixed value "Presencial"
        worksheet.getCell(`D${row}`).value = 'Presencial'

        // Column E is left blank (signature)
      }
    })

    // Generate the spreadsheet buffer
    return await workbook.xlsx.writeBuffer()
  }

  /**
   * Formats the weekdays array to a SEG Á SEX format
   * @param weekdays Array of selected weekdays
   * @returns Formatted string in SEG Á SEX format
   */
  private static formatWeekDaysRange(weekdays: WeekDays[]): string {
    if (weekdays.length === 0) return ''
    
    // Define day abbreviations
    const dayAbbreviations: Record<WeekDays, string> = {
      [WeekDays.MONDAY]: 'SEG',
      [WeekDays.TUESDAY]: 'TER',
      [WeekDays.WEDNESDAY]: 'QUA',
      [WeekDays.THURSDAY]: 'QUI',
      [WeekDays.FRIDAY]: 'SEX',
      [WeekDays.SATURDAY]: 'SAB',
      [WeekDays.SUNDAY]: 'DOM',
    }
    
    // Sort weekdays to find continuous ranges
    const sortedDayIndices = weekdays
      .map(day => this.getDayIndex(day))
      .sort((a, b) => a - b)
    
    // Check if weekdays are consecutive
    const isConsecutive = sortedDayIndices.every(
      (dayIndex, i, array) => i === 0 || dayIndex === array[i - 1] + 1
    )
    
    if (isConsecutive && sortedDayIndices.length > 1) {
      // Get first and last day
      const firstDay = this.getDayByIndex(sortedDayIndices[0])
      const lastDay = this.getDayByIndex(sortedDayIndices[sortedDayIndices.length - 1])
      
      return `${dayAbbreviations[firstDay]} Á ${dayAbbreviations[lastDay]}`
    } else {
      // Return comma-separated list of days if not consecutive
      return weekdays
        .map(day => dayAbbreviations[day])
        .join(', ')
    }
  }
  
  /**
   * Gets the numerical index of a weekday (0-6)
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
   * Gets the weekday by its numeric index
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
   * Generates records for a specific month and year, filtered by selected days of week
   * @param year Year
   * @param month Month (0-11)
   * @param daysOfWeek Array of day indices (0 = Monday, 6 = Sunday)
   * @returns Array of dates representing selected days
   */
  private static generateRecordsForMonth(
    year: number,
    month: number,
    daysOfWeek: number[]
  ): Date[] {
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
      // Convert JS day (0 = Sunday) to our day (0 = Monday)
      const jsDay = d.getDay() // 0 = Sunday, 1 = Monday, etc.
      const ourDay = jsDay === 0 ? 6 : jsDay - 1 // Convert to 0 = Monday, 6 = Sunday
      
      if (daysOfWeek.includes(ourDay)) {
        selectedDays.push(new Date(d))
      }
    }
    
    return selectedDays
  }

  /**
   * Formats a date to DD/MM/YYYY pattern
   * @param date Date to be formatted
   * @returns String in DD/MM/YYYY format
   */
  private static formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }
}
