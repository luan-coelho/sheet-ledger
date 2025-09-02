import { createBrazilianDate } from '../lib/date-utils'

describe('Debug createBrazilianDate', () => {
  it('deve investigar como createBrazilianDate funciona em diferentes ambientes', () => {
    const originalTZ = process.env.TZ

    try {
      // Simula timezone UTC (como na Vercel)
      process.env.TZ = 'UTC'

      const startStr = '2025-09-01'
      const endStr = '2025-09-30'

      const startDate = createBrazilianDate(startStr)
      const endDate = createBrazilianDate(endStr)

      // Simula o loop do ExcelService
      const currentDate = new Date(startDate)
      const dates = []
      let iterations = 0
      const maxIterations = 50

      while (currentDate <= endDate && iterations < maxIterations) {
        const dateStr = currentDate.toLocaleDateString('pt-BR')
        dates.push(dateStr)

        currentDate.setDate(currentDate.getDate() + 1)

        iterations++
      }

      expect(dates).toContain('30/09/2025')
    } finally {
      if (originalTZ) {
        process.env.TZ = originalTZ
      } else {
        delete process.env.TZ
      }
    }
  })
})
