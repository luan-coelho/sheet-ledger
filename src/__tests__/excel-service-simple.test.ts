import path from 'path'

import ExcelJS from 'exceljs'

import { ExcelService } from '../lib/excel-service'
import { WeekDays, WeekdaySession } from '../lib/spreadsheet-schema'

// Mock do path.join para o template
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn(),
}))

describe('ExcelService - Testes Básicos', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock simples do ExcelJS
    const mockWorkbook = {
      xlsx: {
        readFile: jest.fn().mockResolvedValue(undefined),
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-data')),
      },
      getWorksheet: jest.fn().mockReturnValue({
        getCell: jest.fn().mockReturnValue({ value: undefined, alignment: undefined }),
        getRow: jest.fn().mockReturnValue({ height: undefined }),
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)
    ;(path.join as jest.Mock).mockReturnValue('/mocked/path/to/model.xlsx')
  })

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

  describe('Casos de sucesso', () => {
    it('deve gerar planilha com período de datas', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(Buffer.from(result).length).toBeGreaterThan(0)
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
      expect(Buffer.from(result).length).toBeGreaterThan(0)
    })

    it('deve processar dados da empresa quando fornecidos', async () => {
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

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('deve processar campos opcionais quando fornecidos', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        authorizedSession: 'Autorização 123',
        cardNumber: 'CARD123456',
        guideNumber: 'GUIDE789',
        startTime: '09:00',
        endTime: '18:00',
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })
  })

  describe('Casos de erro', () => {
    it('deve lançar erro quando worksheet não é encontrada', async () => {
      // Mock que retorna worksheet undefined
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-data')),
        },
        getWorksheet: jest.fn().mockReturnValue(undefined),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)

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
  })

  describe('Validação de dados', () => {
    it('deve processar array vazio de sessões', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        weekDaySessions: [], // Array vazio
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('deve processar período de um dia', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-01', // Mesmo dia
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('deve processar período entre meses', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-15',
        endDate: '2025-10-15', // Período entre meses
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })
  })

  describe('Cenários específicos', () => {
    it('deve processar todos os dias da semana', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-01',
        endDate: '2025-09-07',
        weekDaySessions: [
          { day: WeekDays.MONDAY, sessions: 1, startTime: '08:00', endTime: '09:00' },
          { day: WeekDays.TUESDAY, sessions: 2, startTime: '08:00', endTime: '10:00' },
          { day: WeekDays.WEDNESDAY, sessions: 3, startTime: '08:00', endTime: '11:00' },
          { day: WeekDays.THURSDAY, sessions: 4, startTime: '08:00', endTime: '12:00' },
          { day: WeekDays.FRIDAY, sessions: 5, startTime: '08:00', endTime: '13:00' },
          { day: WeekDays.SATURDAY, sessions: 6, startTime: '08:00', endTime: '14:00' },
          { day: WeekDays.SUNDAY, sessions: 7, startTime: '08:00', endTime: '15:00' },
        ] as WeekdaySession[],
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('deve processar período sem dias selecionados', async () => {
      const data = {
        ...baseData,
        startDate: '2025-09-06', // Sábado
        endDate: '2025-09-07', // Domingo
        weekDaySessions: [
          {
            day: WeekDays.MONDAY, // Segunda-feira não está no período
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
        ] as WeekdaySession[],
      }

      const result = await ExcelService.generateAttendanceSheet(data)

      expect(Buffer.isBuffer(result)).toBe(true)
    })
  })
})
