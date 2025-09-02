import ExcelJS from 'exceljs'

import { ExcelService } from '@/lib/excel-service'
import { WeekDays } from '@/lib/spreadsheet-schema'

describe('WeekdaySession with Optional Times', () => {
  const baseData = {
    professional: 'João Silva',
    licenseNumber: '12345',
    patientName: 'Ana Santos',
    responsible: 'Maria Santos',
    healthPlan: 'Unimed',
    therapy: 'Fonoaudiologia',
    company: 'Clínica Test',
    companyData: {
      name: 'Clínica Test',
      cnpj: '12.345.678/0001-90',
      address: 'Rua Test, 123',
    },
    startDate: '2025-09-01', // Segunda-feira
    endDate: '2025-09-05', // Sexta-feira
    startTime: '08:00',
    endTime: '17:00',
  }

  it('deve gerar planilha com dias sem horários definidos', async () => {
    const data = {
      ...baseData,
      weekDaySessions: [
        { day: WeekDays.MONDAY, sessions: 2 }, // Sem horários
        { day: WeekDays.TUESDAY, sessions: 3 }, // Sem horários
        { day: WeekDays.WEDNESDAY, sessions: 1, startTime: '09:00', endTime: '10:00' }, // Com horários
      ],
    }

    const result = await ExcelService.generateAttendanceSheet(data)

    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it('deve gerar planilha com todos os dias sem horários', async () => {
    const data = {
      ...baseData,
      weekDaySessions: [
        { day: WeekDays.MONDAY, sessions: 4 },
        { day: WeekDays.FRIDAY, sessions: 2 },
      ],
    }

    const result = await ExcelService.generateAttendanceSheet(data)

    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it('deve gerar planilha com mistura de dias com e sem horários', async () => {
    const data = {
      ...baseData,
      weekDaySessions: [
        { day: WeekDays.MONDAY, sessions: 2, startTime: '08:00', endTime: '10:00' },
        { day: WeekDays.TUESDAY, sessions: 3 }, // Sem horários
        { day: WeekDays.WEDNESDAY, sessions: 1 }, // Sem horários
        { day: WeekDays.THURSDAY, sessions: 4, startTime: '14:00', endTime: '18:00' },
      ],
    }

    const result = await ExcelService.generateAttendanceSheet(data)

    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it('não deve usar horários padrão quando dias não possuem horários definidos', async () => {
    const data = {
      ...baseData,
      // Remove os horários padrão para garantir que não sejam usados
      startTime: undefined,
      endTime: undefined,
      weekDaySessions: [
        { day: WeekDays.MONDAY, sessions: 2 }, // Sem horários
        { day: WeekDays.TUESDAY, sessions: 3 }, // Sem horários
      ],
    }

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    // Verifica as primeiras duas linhas de dados (linhas 14 e 15)
    // Coluna C = startTime, Coluna D = endTime
    const startTime1 = worksheet?.getCell('C14').value
    const endTime1 = worksheet?.getCell('D14').value
    const startTime2 = worksheet?.getCell('C15').value
    const endTime2 = worksheet?.getCell('D15').value

    // Deve estar vazio (null ou '') para ambos os dias sem horários
    expect(startTime1).toBeFalsy()
    expect(endTime1).toBeFalsy()
    expect(startTime2).toBeFalsy()
    expect(endTime2).toBeFalsy()
  })
})
