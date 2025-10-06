import path from 'path'

import ExcelJS from 'exceljs'

import { ExcelService } from '../lib/excel-service'
import { WeekDays, WeekdaySession } from '../lib/spreadsheet-schema'

// Mock do path.join para o template
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn(),
}))

describe('ExcelService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockWorkbook: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockWorksheet: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCells: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock para armazenar valores das células
    mockCells = {}

    // Mock ExcelJS
    mockWorksheet = {
      getCell: jest.fn().mockImplementation((address: string) => {
        if (!mockCells[address]) {
          mockCells[address] = { value: undefined, alignment: undefined }
        }
        return mockCells[address]
      }),
      getRow: jest.fn().mockReturnValue({ height: undefined }),
      duplicateRow: jest.fn(),
    }

    mockWorkbook = {
      xlsx: {
        readFile: jest.fn().mockResolvedValue(undefined),
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-data')),
      },
      getWorksheet: jest.fn().mockReturnValue(mockWorksheet),
    }

    // Mock do constructor do ExcelJS.Workbook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)

    // Mock do path.join
    ;(path.join as jest.Mock).mockReturnValue('/mocked/path/to/model.xlsx')
  })

  describe('generateAttendanceSheet', () => {
    const baseData = {
      professional: 'Dr. João Silva',
      licenseNumber: 'CRP123456',
      patientName: 'Maria Santos',
      responsible: 'José Santos',
      healthPlan: 'Unimed',
      therapy: 'Psicologia',
      weekDaySessions: [
        {
          day: WeekDays.MONDAY,
          sessions: 4,
          startTime: '08:00',
          endTime: '17:00',
        },
        {
          day: WeekDays.WEDNESDAY,
          sessions: 4,
          startTime: '08:00',
          endTime: '17:00',
        },
        {
          day: WeekDays.FRIDAY,
          sessions: 4,
          startTime: '08:00',
          endTime: '17:00',
        },
      ] as WeekdaySession[],
    }

    it('deve gerar planilha com período de datas', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(mockWorkbook.xlsx.readFile).toHaveBeenCalledWith('/mocked/path/to/model.xlsx')
      expect(mockWorkbook.getWorksheet).toHaveBeenCalledWith(1)
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C3') // professional
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C4') // therapy
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C7') // patientName
    })

    it('deve gerar planilha com competência (formato legado)', async () => {
      const data = {
        ...baseData,
        competency: {
          month: '8', // Setembro (índice 8)
          year: '2025',
        },
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C57') // competency text
    })

    it('deve preencher informações da empresa quando fornecidas', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        companyData: {
          name: 'Clínica Exemplo',
          cnpj: '12345678000195',
          address: 'Rua Exemplo, 123',
        },
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockWorksheet.getCell).toHaveBeenCalledWith('A1')
      expect(mockCells['A1'].value).toContain('Clínica Exemplo')
      expect(mockCells['A1'].value).toContain('CNPJ: 12.345.678/0001-95')
      expect(mockCells['A1'].value).toContain('ENDEREÇO: Rua Exemplo, 123')
    })

    it('deve preencher campos opcionais quando fornecidos', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        cardNumber: 'CARD123456',
        guideNumber: 'GUIDE789',
        startTime: '09:00',
        endTime: '18:00',
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C10') // cardNumber
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C11') // guideNumber
    })

    it('deve formatar dias da semana corretamente', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        weekDaySessions: [
          {
            day: WeekDays.MONDAY,
            sessions: 2,
            startTime: '08:00',
            endTime: '12:00',
          },
          {
            day: WeekDays.TUESDAY,
            sessions: 3,
            startTime: '13:00',
            endTime: '17:00',
          },
          {
            day: WeekDays.FRIDAY,
            sessions: 4,
            startTime: '08:00',
            endTime: '17:00',
          },
        ] as WeekdaySession[],
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C54')
      // Verifica se o valor contém o formato esperado: SEG, TER, SEX
      expect(mockCells['C54'].value).toBe('SEG, TER, SEX')
    })

    it('deve gerar competência correta para período de um mês', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C57')
      expect(mockCells['C57'].value).toBe('SETEMBRO/2025')
    })

    it('deve gerar competência correta para período entre meses', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-15',
        endDate: '2025-10-15',
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C57')
      expect(mockCells['C57'].value).toBe('SETEMBRO/2025 - OUTUBRO/2025')
    })

    it('deve criar uma linha por intervalo quando há múltiplos intervalos na mesma data', async () => {
      const data = {
        ...baseData,
        weekDaySessions: [
          {
            day: WeekDays.MONDAY,
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            day: WeekDays.TUESDAY,
            sessions: 1,
            startTime: '14:00',
            endTime: '15:00',
          },
        ] as WeekdaySession[],
        startDate: '2025-09-01',
        endDate: '2025-09-02',
        advancedSchedule: {
          enabled: true,
          exceptions: [
            {
              date: '2025-09-01',
              sessions: [
                { startTime: '08:00', endTime: '09:00', sessionCount: 1 },
                { startTime: '10:00', endTime: '11:00', sessionCount: 1 },
              ],
            },
          ],
        },
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockCells['B14'].value).toBe('01/09/2025')
      expect(mockCells['C14'].value).toBe('08:00')
      expect(mockCells['B15'].value).toBe('01/09/2025')
      expect(mockCells['C15'].value).toBe('10:00')
      expect(mockCells['B16'].value).toBe('02/09/2025')
      expect(mockWorksheet.duplicateRow).not.toHaveBeenCalled()
    })

    it('deve expandir linhas quando a quantidade de registros excede a capacidade base', async () => {
      const allWeekDays: WeekdaySession[] = [
        WeekDays.MONDAY,
        WeekDays.TUESDAY,
        WeekDays.WEDNESDAY,
        WeekDays.THURSDAY,
        WeekDays.FRIDAY,
        WeekDays.SATURDAY,
        WeekDays.SUNDAY,
      ].map(day => ({
        day,
        sessions: 1,
        startTime: '08:00',
        endTime: '09:00',
      })) as WeekdaySession[]

      const data = {
        ...baseData,
        weekDaySessions: allWeekDays,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        advancedSchedule: {
          enabled: true,
          exceptions: [
            {
              date: '2025-01-15',
              sessions: [
                { startTime: '08:00', endTime: '09:00', sessionCount: 1 },
                { startTime: '10:00', endTime: '11:00', sessionCount: 1 },
              ],
            },
          ],
        },
      }

      await ExcelService.generateAttendanceSheet(data)

      expect(mockWorksheet.duplicateRow).toHaveBeenCalledWith(44, 1, true)
      // Último registro deve estar na nova linha criada (linha 45)
      expect(mockCells['A45'].value).toBe(32)
      expect(mockCells['B45'].value).toBe('31/01/2025')
      // Total deve ser preenchido na linha ajustada (46 + 1 = 47)
      expect(mockCells['E47'].value).toBe(32)
    })

    it('deve calcular total de sessões corretamente', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-07', // Uma semana
        weekDaySessions: [
          {
            day: WeekDays.MONDAY,
            sessions: 2,
            startTime: '08:00',
            endTime: '12:00',
          },
          {
            day: WeekDays.WEDNESDAY,
            sessions: 3,
            startTime: '13:00',
            endTime: '17:00',
          },
          {
            day: WeekDays.FRIDAY,
            sessions: 4,
            startTime: '08:00',
            endTime: '17:00',
          },
        ] as WeekdaySession[],
      }

      await ExcelService.generateAttendanceSheet(data)

      // Verifica se o total de sessões foi preenchido (2 + 3 + 4 = 9)
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('E46')
      expect(mockCells['E46'].value).toBe(9)
    })

    it('deve lançar erro quando worksheet não é encontrada', async () => {
      mockWorkbook.getWorksheet.mockReturnValue(undefined)

      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
      }

      await expect(ExcelService.generateAttendanceSheet(data)).rejects.toThrow(
        'Planilha não encontrada no arquivo template',
      )
    })

    it('deve lançar erro quando nem período nem competência são fornecidos', async () => {
      const data = {
        ...baseData,
        // Sem startDate/endDate nem competency
      }

      await expect(ExcelService.generateAttendanceSheet(data)).rejects.toThrow(
        'É necessário informar a data de início e fim ou a competência',
      )
    })

    it('deve limpar linhas de dados antes de preencher novos registros', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-03',
      }

      await ExcelService.generateAttendanceSheet(data)

      // Verifica se as células foram limpas (linha 14 até 44)
      for (let row = 14; row <= 44; row++) {
        expect(mockWorksheet.getCell).toHaveBeenCalledWith(`A${row}`)
        expect(mockWorksheet.getCell).toHaveBeenCalledWith(`B${row}`)
        expect(mockWorksheet.getCell).toHaveBeenCalledWith(`C${row}`)
        expect(mockWorksheet.getCell).toHaveBeenCalledWith(`D${row}`)
        expect(mockWorksheet.getCell).toHaveBeenCalledWith(`E${row}`)
        expect(mockWorksheet.getCell).toHaveBeenCalledWith(`F${row}`)
      }

      // Verifica que células não preenchidas ficaram como null após limpeza
      // Como temos dados apenas para segunda e quarta-feira no período, linha 16 deve estar null
      expect(mockCells['A16'].value).toBeNull()
      expect(mockCells['B16'].value).toBeNull()
      expect(mockCells['C16'].value).toBeNull()
      expect(mockCells['D16'].value).toBeNull()
      expect(mockCells['E16'].value).toBeNull()
      expect(mockCells['F16'].value).toBeNull()
    })
  })

  describe('Métodos privados através de testes de integração', () => {
    it('deve gerar registros apenas para dias da semana selecionados', async () => {
      const data = {
        professional: 'Dr. Test',
        licenseNumber: 'TEST123',
        patientName: 'Test Patient',
        responsible: 'Test Responsible',
        healthPlan: 'Test Health Plan',
        therapy: 'Test Therapy',
        startDate: '2025-09-01', // Segunda-feira
        endDate: '2025-09-07', // Domingo
        weekDaySessions: [
          {
            day: WeekDays.MONDAY,
            sessions: 4,
            startTime: '08:00',
            endTime: '17:00',
          },
        ] as WeekdaySession[],
      }

      await ExcelService.generateAttendanceSheet(data)

      // Deve ter apenas um registro (segunda-feira)
      expect(mockCells['A14'].value).toBe(1) // Primeiro registro
      expect(mockCells['B14'].value).toBe('01/09/2025') // Data do primeiro registro
      expect(mockCells['C14'].value).toBe('08:00') // Horário início
      expect(mockCells['D14'].value).toBe('17:00') // Horário fim
      expect(mockCells['E14'].value).toBe(4) // Sessões
      expect(mockCells['F14'].value).toBe('Atendido') // Status
      expect(mockCells['A15'].value).toBeNull() // Não deve ter segundo registro
    })

    it('deve usar horários específicos do dia quando fornecidos', async () => {
      const data = {
        professional: 'Dr. Test',
        licenseNumber: 'TEST123',
        patientName: 'Test Patient',
        responsible: 'Test Responsible',
        healthPlan: 'Test Health Plan',
        therapy: 'Test Therapy',
        startDate: '2025-09-01',
        endDate: '2025-09-01',
        startTime: '10:00', // Horário padrão
        endTime: '19:00', // Horário padrão
        weekDaySessions: [
          {
            day: WeekDays.MONDAY,
            sessions: 4,
            startTime: '08:00', // Horário específico do dia
            endTime: '17:00', // Horário específico do dia
          },
        ] as WeekdaySession[],
      }

      await ExcelService.generateAttendanceSheet(data)

      // Deve usar o horário específico do dia (08:00/17:00) em vez do padrão (10:00/19:00)
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('C14') // Start time
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('D14') // End time
      expect(mockCells['C14'].value).toBe('08:00') // Horário específico
      expect(mockCells['D14'].value).toBe('17:00') // Horário específico
    })
  })
})
