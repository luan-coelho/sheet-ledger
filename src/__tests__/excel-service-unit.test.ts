import path from 'path'

import ExcelJS from 'exceljs'

import { ExcelService } from '../lib/excel-service'
import { WeekDays } from '../lib/spreadsheet-schema'

describe('ExcelService - Testes Unitários dos Métodos Privados', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Formatação de dias da semana', () => {
    it('deve formatar dias da semana em ordem correta com sessões', async () => {
      const testData = {
        professional: 'Test',
        licenseNumber: 'TEST123',
        patientName: 'Test',
        responsible: 'Test',
        healthPlan: 'Test',
        therapy: 'Test',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        weekDaySessions: [
          {
            day: WeekDays.FRIDAY, // Sexta
            sessions: 3,
            startTime: '08:00',
            endTime: '17:00',
          },
          {
            day: WeekDays.MONDAY, // Segunda
            sessions: 2,
            startTime: '08:00',
            endTime: '17:00',
          },
          {
            day: WeekDays.WEDNESDAY, // Quarta
            sessions: 4,
            startTime: '08:00',
            endTime: '17:00',
          },
        ],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCells: Record<string, any> = {}
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
        getWorksheet: jest.fn().mockReturnValue({
          getCell: jest.fn().mockImplementation((address: string) => {
            if (!mockCells[address]) {
              mockCells[address] = { value: undefined }
            }
            return mockCells[address]
          }),
          getRow: jest.fn().mockReturnValue({ height: undefined }),
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)
      jest.spyOn(path, 'join').mockReturnValue('/test/path')

      await ExcelService.generateAttendanceSheet(testData)

      // Verifica se os dias foram formatados na ordem correta na célula C53: SEG(2), QUA(4), SEX(3)
      expect(mockCells['C53'].value).toBe('SEG, QUA, SEX')
    })

    it('deve retornar string vazia quando não há sessões', async () => {
      const testData = {
        professional: 'Test',
        licenseNumber: 'TEST123',
        patientName: 'Test',
        responsible: 'Test',
        healthPlan: 'Test',
        therapy: 'Test',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        weekDaySessions: [], // Array vazio
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCells: Record<string, any> = {}
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
        getWorksheet: jest.fn().mockReturnValue({
          getCell: jest.fn().mockImplementation((address: string) => {
            if (!mockCells[address]) {
              mockCells[address] = { value: undefined }
            }
            return mockCells[address]
          }),
          getRow: jest.fn().mockReturnValue({ height: undefined }),
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)
      jest.spyOn(path, 'join').mockReturnValue('/test/path')

      await ExcelService.generateAttendanceSheet(testData)

      // Deve ser string vazia para array vazio de sessões na célula C53
      expect(mockCells['C53'].value).toBe('')
    })
  })

  describe('Geração de registros por período', () => {
    it('deve gerar registros apenas para dias úteis quando solicitado', async () => {
      const testData = {
        professional: 'Test',
        licenseNumber: 'TEST123',
        patientName: 'Test',
        responsible: 'Test',
        healthPlan: 'Test',
        therapy: 'Test',
        startDate: '2025-09-01', // Segunda-feira
        endDate: '2025-09-05', // Sexta-feira
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
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            day: WeekDays.WEDNESDAY,
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            day: WeekDays.THURSDAY,
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            day: WeekDays.FRIDAY,
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
        ],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCells: Record<string, any> = {}
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
        getWorksheet: jest.fn().mockReturnValue({
          getCell: jest.fn().mockImplementation((address: string) => {
            if (!mockCells[address]) {
              mockCells[address] = { value: undefined }
            }
            return mockCells[address]
          }),
          getRow: jest.fn().mockReturnValue({ height: undefined }),
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)
      jest.spyOn(path, 'join').mockReturnValue('/test/path')

      await ExcelService.generateAttendanceSheet(testData)

      // Deve ter exatamente 5 registros (segunda a sexta)
      expect(mockCells['A13'].value).toBe(1) // Primeiro registro
      expect(mockCells['A14'].value).toBe(2) // Segundo registro
      expect(mockCells['A15'].value).toBe(3) // Terceiro registro
      expect(mockCells['A16'].value).toBe(4) // Quarto registro
      expect(mockCells['A17'].value).toBe(5) // Quinto registro
      expect(mockCells['A18'].value).toBeNull() // Não deve ter sexto registro

      // Verifica o total de sessões (5 dias × 1 sessão = 5)
      expect(mockCells['E45'].value).toBe(5)
    })
  })

  describe('Cenários edge cases', () => {
    it('deve lidar com período que não contém nenhum dia selecionado', async () => {
      const testData = {
        professional: 'Test',
        licenseNumber: 'TEST123',
        patientName: 'Test',
        responsible: 'Test',
        healthPlan: 'Test',
        therapy: 'Test',
        startDate: '2025-09-06', // Sábado
        endDate: '2025-09-07', // Domingo
        weekDaySessions: [
          {
            day: WeekDays.MONDAY, // Segunda-feira não está no período
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
        ],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCells: Record<string, any> = {}
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
        getWorksheet: jest.fn().mockReturnValue({
          getCell: jest.fn().mockImplementation((address: string) => {
            if (!mockCells[address]) {
              mockCells[address] = { value: undefined }
            }
            return mockCells[address]
          }),
          getRow: jest.fn().mockReturnValue({ height: undefined }),
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)
      jest.spyOn(path, 'join').mockReturnValue('/test/path')

      await ExcelService.generateAttendanceSheet(testData)

      // Não deve ter nenhum registro (valor deve ser null após limpeza)
      expect(mockCells['A13'].value).toBeNull()
      // Total de sessões deve ser 0
      expect(mockCells['E45'].value).toBe(0)
    })

    it('deve gerar apenas as datas corretas para setembro 2025 (seg, ter, qua)', async () => {
      const testData = {
        professional: 'Test',
        licenseNumber: 'TEST123',
        patientName: 'Test',
        responsible: 'Test',
        healthPlan: 'Test',
        therapy: 'Test',
        startDate: '2025-09-01', // 1º de setembro de 2025
        endDate: '2025-09-30', // 30 de setembro de 2025
        weekDaySessions: [
          {
            day: WeekDays.MONDAY, // Segunda-feira
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            day: WeekDays.TUESDAY, // Terça-feira
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            day: WeekDays.WEDNESDAY, // Quarta-feira
            sessions: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
        ],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCells: Record<string, any> = {}
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
        getWorksheet: jest.fn().mockReturnValue({
          getCell: jest.fn().mockImplementation((address: string) => {
            if (!mockCells[address]) {
              mockCells[address] = { value: undefined }
            }
            return mockCells[address]
          }),
          getRow: jest.fn().mockReturnValue({ height: undefined }),
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => mockWorkbook as any)
      jest.spyOn(path, 'join').mockReturnValue('/test/path')

      await ExcelService.generateAttendanceSheet(testData)

      // Datas esperadas: apenas segundas, terças e quartas de setembro 2025
      const expectedDates = [
        '01/09/2025', // Segunda-feira
        '02/09/2025', // Terça-feira
        '03/09/2025', // Quarta-feira
        '08/09/2025', // Segunda-feira
        '09/09/2025', // Terça-feira
        '10/09/2025', // Quarta-feira
        '15/09/2025', // Segunda-feira
        '16/09/2025', // Terça-feira
        '17/09/2025', // Quarta-feira
        '22/09/2025', // Segunda-feira
        '23/09/2025', // Terça-feira
        '24/09/2025', // Quarta-feira
        '29/09/2025', // Segunda-feira
        '30/09/2025', // Terça-feira
      ]

      // Verifica se temos exatamente 14 registros
      for (let i = 0; i < expectedDates.length; i++) {
        const row = 13 + i
        expect(mockCells[`A${row}`].value).toBe(i + 1) // Número sequencial
        expect(mockCells[`B${row}`].value).toBe(expectedDates[i]) // Data esperada
        expect(mockCells[`E${row}`].value).toBe(1) // 1 sessão por dia
        expect(mockCells[`F${row}`].value).toBe('Atendido') // Status
      }

      // Não deve ter mais registros além dos 14 esperados
      expect(mockCells['A27'].value).toBeNull() // Linha 27 (13 + 14) deve estar vazia

      // Total de sessões deve ser 14 (14 dias × 1 sessão cada)
      expect(mockCells['E45'].value).toBe(14)

      // Verifica formatação dos dias da semana na célula C53
      expect(mockCells['C53'].value).toBe('SEG, TER, QUA')
    })
  })
})
