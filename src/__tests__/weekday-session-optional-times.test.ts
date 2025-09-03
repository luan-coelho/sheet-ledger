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

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    expect(Buffer.isBuffer(buffer)).toBe(true)

    // Verifica primeira linha (segunda-feira) - sem horários
    expect(worksheet?.getCell('A14').value).toBe(1)
    expect(worksheet?.getCell('B14').value).toBe('01/09/2025')
    expect(worksheet?.getCell('C14').value).toBe('')
    expect(worksheet?.getCell('D14').value).toBe('')
    expect(worksheet?.getCell('E14').value).toBe(2)
    expect(worksheet?.getCell('F14').value).toBe('Atendido')

    // Verifica segunda linha (terça-feira) - sem horários
    expect(worksheet?.getCell('A15').value).toBe(2)
    expect(worksheet?.getCell('B15').value).toBe('02/09/2025')
    expect(worksheet?.getCell('C15').value).toBe('')
    expect(worksheet?.getCell('D15').value).toBe('')
    expect(worksheet?.getCell('E15').value).toBe(3)
    expect(worksheet?.getCell('F15').value).toBe('Atendido')

    // Verifica terceira linha (quarta-feira) - com horários
    expect(worksheet?.getCell('A16').value).toBe(3)
    expect(worksheet?.getCell('B16').value).toBe('03/09/2025')
    expect(worksheet?.getCell('C16').value).toBe('09:00')
    expect(worksheet?.getCell('D16').value).toBe('10:00')
    expect(worksheet?.getCell('E16').value).toBe(1)
    expect(worksheet?.getCell('F16').value).toBe('Atendido')

    // Verifica total de sessões
    expect(worksheet?.getCell('E46').value).toBe(6) // 2 + 3 + 1
  })

  it('deve gerar planilha com todos os dias sem horários', async () => {
    const data = {
      ...baseData,
      weekDaySessions: [
        { day: WeekDays.MONDAY, sessions: 4 },
        { day: WeekDays.FRIDAY, sessions: 2 },
      ],
    }

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    expect(Buffer.isBuffer(buffer)).toBe(true)

    // Verifica primeira linha (segunda-feira) - sem horários
    expect(worksheet?.getCell('A14').value).toBe(1)
    expect(worksheet?.getCell('B14').value).toBe('01/09/2025')
    expect(worksheet?.getCell('C14').value).toBe('')
    expect(worksheet?.getCell('D14').value).toBe('')
    expect(worksheet?.getCell('E14').value).toBe(4)

    // Verifica segunda linha (sexta-feira) - sem horários
    expect(worksheet?.getCell('A15').value).toBe(2)
    expect(worksheet?.getCell('B15').value).toBe('05/09/2025')
    expect(worksheet?.getCell('C15').value).toBe('')
    expect(worksheet?.getCell('D15').value).toBe('')
    expect(worksheet?.getCell('E15').value).toBe(2)

    // Verifica total de sessões
    expect(worksheet?.getCell('E46').value).toBe(6) // 4 + 2
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

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    expect(Buffer.isBuffer(buffer)).toBe(true)

    // Verifica primeira linha (segunda-feira) - com horários
    expect(worksheet?.getCell('A14').value).toBe(1)
    expect(worksheet?.getCell('B14').value).toBe('01/09/2025')
    expect(worksheet?.getCell('C14').value).toBe('08:00')
    expect(worksheet?.getCell('D14').value).toBe('10:00')
    expect(worksheet?.getCell('E14').value).toBe(2)

    // Verifica segunda linha (terça-feira) - sem horários
    expect(worksheet?.getCell('A15').value).toBe(2)
    expect(worksheet?.getCell('B15').value).toBe('02/09/2025')
    expect(worksheet?.getCell('C15').value).toBe('')
    expect(worksheet?.getCell('D15').value).toBe('')
    expect(worksheet?.getCell('E15').value).toBe(3)

    // Verifica terceira linha (quarta-feira) - sem horários
    expect(worksheet?.getCell('A16').value).toBe(3)
    expect(worksheet?.getCell('B16').value).toBe('03/09/2025')
    expect(worksheet?.getCell('C16').value).toBe('')
    expect(worksheet?.getCell('D16').value).toBe('')
    expect(worksheet?.getCell('E16').value).toBe(1)

    // Verifica quarta linha (quinta-feira) - com horários
    expect(worksheet?.getCell('A17').value).toBe(4)
    expect(worksheet?.getCell('B17').value).toBe('04/09/2025')
    expect(worksheet?.getCell('C17').value).toBe('14:00')
    expect(worksheet?.getCell('D17').value).toBe('18:00')
    expect(worksheet?.getCell('E17').value).toBe(4)

    // Verifica total de sessões
    expect(worksheet?.getCell('E46').value).toBe(10) // 2 + 3 + 1 + 4
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

    // Verifica primeira linha (segunda-feira) - sem horários específicos
    const startTime1 = worksheet?.getCell('C14').value
    const endTime1 = worksheet?.getCell('D14').value
    const sessions1 = worksheet?.getCell('E14').value

    // Verifica segunda linha (terça-feira) - sem horários específicos
    const startTime2 = worksheet?.getCell('C15').value
    const endTime2 = worksheet?.getCell('D15').value
    const sessions2 = worksheet?.getCell('E15').value

    // Deve estar vazio (string vazia) para ambos os dias sem horários
    expect(startTime1).toBe('')
    expect(endTime1).toBe('')
    expect(sessions1).toBe(2)

    expect(startTime2).toBe('')
    expect(endTime2).toBe('')
    expect(sessions2).toBe(3)

    // Verifica total de sessões
    expect(worksheet?.getCell('E46').value).toBe(5) // 2 + 3
  })

  it('deve preservar as informações da empresa na célula A1', async () => {
    const data = {
      ...baseData,
      companyData: {
        name: 'CLÍNICA TESTE LTDA',
        cnpj: '11.222.333/0001-44',
        address: 'Rua Teste, 456, Centro, CEP: 12345-678, Cidade - Estado',
      },
      weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 1 }],
    }

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    const companyInfo = worksheet?.getCell('A1').value as string
    expect(companyInfo).toContain('CLÍNICA TESTE LTDA')
    expect(companyInfo).toContain('CNPJ: 11.222.333/0001-44')
    expect(companyInfo).toContain('Rua Teste, 456, Centro, CEP: 12345-678, Cidade - Estado')
  })

  it('deve preencher corretamente os dados do profissional e paciente', async () => {
    const data = {
      ...baseData,
      professional: 'Dra. Maria Silva',
      therapy: 'Fisioterapia',
      licenseNumber: 'CREFITO-123456',
      patientName: 'João Santos',
      responsible: 'Ana Santos',
      healthPlan: 'SulAmérica',
      weekDaySessions: [{ day: WeekDays.WEDNESDAY, sessions: 2, startTime: '14:00', endTime: '16:00' }],
    }

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    expect(worksheet?.getCell('C3').value).toBe('Dra. Maria Silva')
    expect(worksheet?.getCell('C4').value).toBe('Fisioterapia')
    expect(worksheet?.getCell('C5').value).toBe('CREFITO-123456')
    expect(worksheet?.getCell('C7').value).toBe('João Santos')
    expect(worksheet?.getCell('C8').value).toBe('Ana Santos')
    expect(worksheet?.getCell('C9').value).toBe('SulAmérica')
  })

  it('deve verificar que células vazias estão realmente vazias após limpeza', async () => {
    const data = {
      ...baseData,
      weekDaySessions: [
        { day: WeekDays.FRIDAY, sessions: 1 }, // Apenas uma sessão na sexta
      ],
    }

    const buffer = await ExcelService.generateAttendanceSheet(data)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    // Primeira linha deve ter dados
    expect(worksheet?.getCell('A14').value).toBe(1)
    expect(worksheet?.getCell('B14').value).toBe('05/09/2025')
    expect(worksheet?.getCell('E14').value).toBe(1)

    // Segunda linha deve estar vazia (null)
    expect(worksheet?.getCell('A15').value).toBeNull()
    expect(worksheet?.getCell('B15').value).toBeNull()
    expect(worksheet?.getCell('C15').value).toBeNull()
    expect(worksheet?.getCell('D15').value).toBeNull()
    expect(worksheet?.getCell('E15').value).toBeNull()
    expect(worksheet?.getCell('F15').value).toBeNull()
  })
})
